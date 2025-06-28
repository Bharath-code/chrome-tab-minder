// Background service worker for Focus Mode extension
let focusMode = false;
let timerEndTime = null;
let timerInterval = null;
let whitelist = [];
let allowedTab = null;
let allowedWindow = null;

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  // Load saved settings
  const result = await chrome.storage.sync.get([
    'focusMode', 
    'whitelist', 
    'timerEndTime', 
    'allowedTab', 
    'allowedWindow'
  ]);
  
  focusMode = result.focusMode || false;
  whitelist = result.whitelist || [];
  timerEndTime = result.timerEndTime;
  allowedTab = result.allowedTab;
  allowedWindow = result.allowedWindow;
  
  // Resume timer if it was running
  if (timerEndTime && timerEndTime > Date.now()) {
    startTimerMonitoring();
  }
  
  updateBadge();
});

// Tab management
chrome.tabs.onCreated.addListener(async (tab) => {
  if (!focusMode) return;
  
  // Check if this tab is whitelisted
  if (isWhitelisted(tab.url)) return;
  
  // If no allowed tab is set, set this as the allowed tab
  if (!allowedTab) {
    allowedTab = tab.id;
    allowedWindow = tab.windowId;
    await chrome.storage.sync.set({ allowedTab, allowedWindow });
    return;
  }
  
  // If this is not the allowed tab, close it after a brief delay
  setTimeout(async () => {
    try {
      // Show warning notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Focus Mode Active',
        message: 'Only one tab allowed. Additional tab will be closed.'
      });
      
      await chrome.tabs.remove(tab.id);
    } catch (error) {
      console.log('Tab already closed or not found');
    }
  }, 2000);
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (tabId === allowedTab) {
    allowedTab = null;
    allowedWindow = null;
    await chrome.storage.sync.set({ allowedTab: null, allowedWindow: null });
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (!focusMode) return;
  
  const tab = await chrome.tabs.get(activeInfo.tabId);
  
  // Check if this tab is whitelisted
  if (isWhitelisted(tab.url)) return;
  
  // Update allowed tab if none is set
  if (!allowedTab) {
    allowedTab = activeInfo.tabId;
    allowedWindow = activeInfo.windowId;
    await chrome.storage.sync.set({ allowedTab, allowedWindow });
  }
});

// Window management
chrome.windows.onCreated.addListener(async (window) => {
  if (!focusMode) return;
  
  // If no allowed window is set, set this as allowed
  if (!allowedWindow) {
    allowedWindow = window.id;
    await chrome.storage.sync.set({ allowedWindow });
    return;
  }
  
  // If this is not the allowed window, close it
  setTimeout(async () => {
    try {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Focus Mode Active',
        message: 'Only one window allowed. Additional window will be closed.'
      });
      
      await chrome.windows.remove(window.id);
    } catch (error) {
      console.log('Window already closed or not found');
    }
  }, 2000);
});

chrome.windows.onRemoved.addListener(async (windowId) => {
  if (windowId === allowedWindow) {
    allowedWindow = null;
    await chrome.storage.sync.set({ allowedWindow: null });
  }
});

// Timer management
function startTimer(duration) {
  timerEndTime = Date.now() + duration;
  chrome.storage.sync.set({ timerEndTime });
  startTimerMonitoring();
  updateBadge();
}

function stopTimer() {
  timerEndTime = null;
  chrome.storage.sync.set({ timerEndTime: null });
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  updateBadge();
}

function startTimerMonitoring() {
  if (timerInterval) clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    if (!timerEndTime || timerEndTime <= Date.now()) {
      // Timer finished
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Focus Timer Complete',
        message: 'Your focus session has ended!',
        requireInteraction: true
      });
      
      stopTimer();
      
      // Optionally close the current tab (can be configured)
      chrome.storage.sync.get(['closeOnTimerEnd'], (result) => {
        if (result.closeOnTimerEnd && allowedTab) {
          chrome.tabs.remove(allowedTab);
        }
      });
    }
  }, 1000);
}

function getRemainingTime() {
  if (!timerEndTime) return 0;
  return Math.max(0, timerEndTime - Date.now());
}

// Utility functions
function isWhitelisted(url) {
  if (!url) return false;
  
  for (const whitelistUrl of whitelist) {
    if (url.includes(whitelistUrl)) {
      return true;
    }
  }
  return false;
}

function updateBadge() {
  const remaining = getRemainingTime();
  let badgeText = '';
  
  if (focusMode && remaining > 0) {
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    badgeText = minutes > 0 ? `${minutes}m` : `${seconds}s`;
  } else if (focusMode) {
    badgeText = 'ON';
  }
  
  chrome.action.setBadgeText({ text: badgeText });
  chrome.action.setBadgeBackgroundColor({ color: focusMode ? '#10B981' : '#6B7280' });
}

// Message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'toggleFocusMode':
      focusMode = !focusMode;
      chrome.storage.sync.set({ focusMode });
      
      if (!focusMode) {
        stopTimer();
        allowedTab = null;
        allowedWindow = null;
        chrome.storage.sync.set({ allowedTab: null, allowedWindow: null });
      }
      
      updateBadge();
      sendResponse({ focusMode });
      break;
      
    case 'startTimer':
      startTimer(request.duration);
      sendResponse({ success: true });
      break;
      
    case 'stopTimer':
      stopTimer();
      sendResponse({ success: true });
      break;
      
    case 'getStatus':
      sendResponse({
        focusMode,
        remainingTime: getRemainingTime(),
        timerActive: timerEndTime && timerEndTime > Date.now()
      });
      break;
      
    case 'updateWhitelist':
      whitelist = request.whitelist;
      chrome.storage.sync.set({ whitelist });
      sendResponse({ success: true });
      break;
  }
});

// Update badge periodically
setInterval(updateBadge, 1000);