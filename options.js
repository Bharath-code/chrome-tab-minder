document.addEventListener('DOMContentLoaded', async () => {
  const elements = {
    closeOnTimerEnd: document.getElementById('closeOnTimerEnd'),
    showWarnings: document.getElementById('showWarnings'),
    handlePinnedTabs: document.getElementById('handlePinnedTabs'),
    whitelistInput: document.getElementById('whitelistInput'),
    addToWhitelist: document.getElementById('addToWhitelist'),
    whitelistItems: document.getElementById('whitelistItems'),
    emptyWhitelist: document.getElementById('emptyWhitelist'),
    preset1: document.getElementById('preset1'),
    preset2: document.getElementById('preset2'),
    preset3: document.getElementById('preset3'),
    preset4: document.getElementById('preset4'),
    totalFocusTime: document.getElementById('totalFocusTime'),
    sessionsCompleted: document.getElementById('sessionsCompleted'),
    tabsClosed: document.getElementById('tabsClosed'),
    longestSession: document.getElementById('longestSession'),
    resetStats: document.getElementById('resetStats'),
    exportData: document.getElementById('exportData'),
    saveStatus: document.getElementById('saveStatus')
  };

  let settings = {
    closeOnTimerEnd: false,
    showWarnings: true,
    handlePinnedTabs: true,
    whitelist: [],
    presets: [25, 45, 60, 90],
    stats: {
      totalFocusTime: 0,
      sessionsCompleted: 0,
      tabsClosed: 0,
      longestSession: 0
    }
  };

  // Load settings
  await loadSettings();
  initializeUI();

  // Event listeners
  elements.closeOnTimerEnd.addEventListener('change', saveSetting);
  elements.showWarnings.addEventListener('change', saveSetting);
  elements.handlePinnedTabs.addEventListener('change', saveSetting);
  elements.addToWhitelist.addEventListener('click', addToWhitelist);
  elements.whitelistInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addToWhitelist();
  });
  
  // Preset inputs
  [elements.preset1, elements.preset2, elements.preset3, elements.preset4].forEach((input, index) => {
    input.addEventListener('change', () => savePreset(index, input.value));
  });

  elements.resetStats.addEventListener('click', resetStats);
  elements.exportData.addEventListener('click', exportData);

  // Functions
  async function loadSettings() {
    try {
      const result = await chrome.storage.sync.get([
        'closeOnTimerEnd',
        'showWarnings', 
        'handlePinnedTabs',
        'whitelist',
        'presets',
        'stats'
      ]);
      
      settings = { ...settings, ...result };
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  function initializeUI() {
    // General settings
    elements.closeOnTimerEnd.checked = settings.closeOnTimerEnd;
    elements.showWarnings.checked = settings.showWarnings;
    elements.handlePinnedTabs.checked = settings.handlePinnedTabs;

    // Whitelist
    updateWhitelistDisplay();

    // Presets
    elements.preset1.value = settings.presets[0];
    elements.preset2.value = settings.presets[1];
    elements.preset3.value = settings.presets[2];
    elements.preset4.value = settings.presets[3];

    // Stats
    updateStatsDisplay();
  }

  async function saveSetting(event) {
    const setting = event.target.id;
    const value = event.target.checked;
    
    settings[setting] = value;
    
    try {
      await chrome.storage.sync.set({ [setting]: value });
      showSaveStatus('Settings saved');
    } catch (error) {
      console.error('Error saving setting:', error);
      showSaveStatus('Error saving settings', true);
    }
  }

  async function addToWhitelist() {
    const url = elements.whitelistInput.value.trim();
    if (!url) return;

    // Basic URL validation
    if (!isValidUrl(url)) {
      alert('Please enter a valid domain or URL (e.g., gmail.com, docs.google.com)');
      return;
    }

    if (settings.whitelist.includes(url)) {
      alert('This website is already in the whitelist');
      return;
    }

    settings.whitelist.push(url);
    elements.whitelistInput.value = '';

    try {
      await chrome.storage.sync.set({ whitelist: settings.whitelist });
      await chrome.runtime.sendMessage({ 
        action: 'updateWhitelist', 
        whitelist: settings.whitelist 
      });
      
      updateWhitelistDisplay();
      showSaveStatus('Website added to whitelist');
    } catch (error) {
      console.error('Error adding to whitelist:', error);
      showSaveStatus('Error adding website', true);
    }
  }

  async function removeFromWhitelist(url) {
    settings.whitelist = settings.whitelist.filter(item => item !== url);
    
    try {
      await chrome.storage.sync.set({ whitelist: settings.whitelist });
      await chrome.runtime.sendMessage({ 
        action: 'updateWhitelist', 
        whitelist: settings.whitelist 
      });
      
      updateWhitelistDisplay();
      showSaveStatus('Website removed from whitelist');
    } catch (error) {
      console.error('Error removing from whitelist:', error);
      showSaveStatus('Error removing website', true);
    }
  }

  function updateWhitelistDisplay() {
    elements.whitelistItems.innerHTML = '';
    
    if (settings.whitelist.length === 0) {
      elements.emptyWhitelist.style.display = 'block';
    } else {
      elements.emptyWhitelist.style.display = 'none';
      
      settings.whitelist.forEach(url => {
        const item = document.createElement('div');
        item.className = 'whitelist-item';
        item.innerHTML = `
          <span class="whitelist-url">${url}</span>
          <button class="remove-btn" data-url="${url}">Remove</button>
        `;
        
        item.querySelector('.remove-btn').addEventListener('click', (e) => {
          removeFromWhitelist(e.target.dataset.url);
        });
        
        elements.whitelistItems.appendChild(item);
      });
    }
  }

  async function savePreset(index, value) {
    const numValue = parseInt(value);
    if (numValue < 1 || numValue > 480) {
      alert('Please enter a value between 1 and 480 minutes');
      return;
    }

    settings.presets[index] = numValue;
    
    try {
      await chrome.storage.sync.set({ presets: settings.presets });
      showSaveStatus('Presets updated');
    } catch (error) {
      console.error('Error saving presets:', error);
      showSaveStatus('Error saving presets', true);
    }
  }

  function updateStatsDisplay() {
    const stats = settings.stats;
    
    // Total focus time
    const hours = Math.floor(stats.totalFocusTime / 3600000);
    const minutes = Math.floor((stats.totalFocusTime % 3600000) / 60000);
    elements.totalFocusTime.textContent = `${hours}h ${minutes}m`;
    
    // Other stats
    elements.sessionsCompleted.textContent = stats.sessionsCompleted;
    elements.tabsClosed.textContent = stats.tabsClosed;
    elements.longestSession.textContent = `${Math.floor(stats.longestSession / 60000)}m`;
  }

  async function resetStats() {
    if (!confirm('Are you sure you want to reset all statistics? This action cannot be undone.')) {
      return;
    }

    settings.stats = {
      totalFocusTime: 0,
      sessionsCompleted: 0,
      tabsClosed: 0,
      longestSession: 0
    };

    try {
      await chrome.storage.sync.set({ stats: settings.stats });
      updateStatsDisplay();
      showSaveStatus('Statistics reset');
    } catch (error) {
      console.error('Error resetting stats:', error);
      showSaveStatus('Error resetting statistics', true);
    }
  }

  function exportData() {
    const data = {
      settings: settings,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `focus-mode-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    showSaveStatus('Data exported successfully');
  }

  function isValidUrl(string) {
    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;
    
    // Remove protocol if present
    let cleanUrl = string.replace(/^https?:\/\//, '');
    
    // Remove path if present
    cleanUrl = cleanUrl.split('/')[0];
    
    return domainRegex.test(cleanUrl) && cleanUrl.length > 2;
  }

  function showSaveStatus(message, isError = false) {
    elements.saveStatus.textContent = message;
    elements.saveStatus.style.color = isError ? '#ef4444' : '#10b981';
    
    setTimeout(() => {
      elements.saveStatus.textContent = 'All changes saved automatically';
      elements.saveStatus.style.color = '#64748b';
    }, 3000);
  }

  // Auto-save indication
  document.addEventListener('change', () => {
    showSaveStatus('Saving...');
  });
});