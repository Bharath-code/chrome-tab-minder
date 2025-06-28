document.addEventListener('DOMContentLoaded', async () => {
  const elements = {
    toggleFocus: document.getElementById('toggleFocus'),
    toggleText: document.getElementById('toggleText'),
    statusDot: document.getElementById('statusDot'),
    statusText: document.getElementById('statusText'),
    timerSection: document.getElementById('timerSection'),
    timeRemaining: document.getElementById('timeRemaining'),
    customMinutes: document.getElementById('customMinutes'),
    startCustomTimer: document.getElementById('startCustomTimer'),
    stopTimer: document.getElementById('stopTimer'),
    openOptions: document.getElementById('openOptions'),
    showStats: document.getElementById('showStats')
  };

  let currentStatus = {
    focusMode: false,
    remainingTime: 0,
    timerActive: false
  };

  // Initialize UI
  await updateUI();

  // Event listeners
  elements.toggleFocus.addEventListener('click', toggleFocusMode);
  elements.startCustomTimer.addEventListener('click', startCustomTimer);
  elements.stopTimer.addEventListener('click', stopTimer);
  elements.openOptions.addEventListener('click', openOptions);

  // Preset timer buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const minutes = parseInt(btn.dataset.minutes);
      startTimer(minutes * 60 * 1000);
    });
  });

  // Update timer display every second
  setInterval(updateTimerDisplay, 1000);

  // Functions
  async function updateUI() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getStatus' });
      currentStatus = response;
      
      // Update focus mode toggle
      if (currentStatus.focusMode) {
        elements.toggleText.textContent = 'Disable Focus Mode';
        elements.toggleFocus.classList.add('active');
        elements.statusDot.classList.add('active');
        elements.statusText.textContent = 'Active';
        elements.timerSection.classList.remove('disabled');
      } else {
        elements.toggleText.textContent = 'Enable Focus Mode';
        elements.toggleFocus.classList.remove('active');
        elements.statusDot.classList.remove('active');
        elements.statusText.textContent = 'Inactive';
        elements.timerSection.classList.add('disabled');
      }

      // Update timer display
      updateTimerDisplay();
      
      // Show/hide timer controls
      if (currentStatus.timerActive) {
        elements.startCustomTimer.style.display = 'none';
        elements.stopTimer.style.display = 'block';
        elements.timerSection.classList.add('timer-active');
      } else {
        elements.startCustomTimer.style.display = 'block';
        elements.stopTimer.style.display = 'none';
        elements.timerSection.classList.remove('timer-active');
      }
    } catch (error) {
      console.error('Error updating UI:', error);
    }
  }

  function updateTimerDisplay() {
    if (currentStatus.remainingTime > 0) {
      const minutes = Math.floor(currentStatus.remainingTime / 60000);
      const seconds = Math.floor((currentStatus.remainingTime % 60000) / 1000);
      elements.timeRemaining.textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      // Update remaining time for next iteration
      if (currentStatus.timerActive) {
        currentStatus.remainingTime = Math.max(0, currentStatus.remainingTime - 1000);
      }
    } else {
      elements.timeRemaining.textContent = '00:00';
    }
  }

  async function toggleFocusMode() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'toggleFocusMode' });
      currentStatus.focusMode = response.focusMode;
      await updateUI();
    } catch (error) {
      console.error('Error toggling focus mode:', error);
    }
  }

  async function startCustomTimer() {
    const minutes = parseInt(elements.customMinutes.value) || 30;
    if (minutes < 1 || minutes > 480) {
      alert('Please enter a valid time between 1 and 480 minutes.');
      return;
    }
    
    await startTimer(minutes * 60 * 1000);
    elements.customMinutes.value = '';
  }

  async function startTimer(duration) {
    if (!currentStatus.focusMode) {
      alert('Please enable Focus Mode first.');
      return;
    }

    try {
      await chrome.runtime.sendMessage({ 
        action: 'startTimer', 
        duration: duration 
      });
      
      currentStatus.timerActive = true;
      currentStatus.remainingTime = duration;
      await updateUI();
    } catch (error) {
      console.error('Error starting timer:', error);
    }
  }

  async function stopTimer() {
    try {
      await chrome.runtime.sendMessage({ action: 'stopTimer' });
      currentStatus.timerActive = false;
      currentStatus.remainingTime = 0;
      await updateUI();
    } catch (error) {
      console.error('Error stopping timer:', error);
    }
  }

  function openOptions() {
    chrome.runtime.openOptionsPage();
  }

  // Add some visual feedback for button clicks
  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', function() {
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = '';
      }, 150);
    });
  });
});