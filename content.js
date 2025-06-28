// Content script for Focus Mode extension
// This script runs on all pages to help with tab management

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'checkForUnsavedWork':
      // Check if there's unsaved work on the page
      const hasUnsavedWork = checkUnsavedWork();
      sendResponse({ hasUnsavedWork });
      break;
      
    case 'showWarning':
      // Show warning before closing tab
      showClosingWarning();
      break;
  }
});

function checkUnsavedWork() {
  // Check for common indicators of unsaved work
  const indicators = [
    // Text inputs with content
    'input[type="text"]:not([value=""]), input[type="email"]:not([value=""]), input[type="password"]:not([value=""])',
    // Textareas with content
    'textarea:not(:empty)',
    // Content editable elements
    '[contenteditable="true"]:not(:empty)',
    // Forms that might have been modified
    'form.modified, form.dirty',
    // Common editor classes
    '.editor-content:not(:empty), .ql-editor:not(:empty), .CodeMirror-code'
  ];
  
  for (const selector of indicators) {
    if (document.querySelector(selector)) {
      return true;
    }
  }
  
  // Check for beforeunload listeners (indicates potential unsaved work)
  return window.onbeforeunload !== null;
}

function showClosingWarning() {
  // Create and show a warning notification
  const warning = document.createElement('div');
  warning.id = 'focus-mode-warning';
  warning.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 300px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    ">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
        <strong>Focus Mode Active</strong>
      </div>
      <p style="margin: 0; opacity: 0.9; line-height: 1.4;">
        This tab will be closed in a few seconds to maintain single-tab focus.
      </p>
    </div>
  `;
  
  document.body.appendChild(warning);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (document.getElementById('focus-mode-warning')) {
      document.body.removeChild(warning);
    }
  }, 3000);
}

// Monitor for page changes that might indicate work
let initialContent = '';
let hasBeenModified = false;

window.addEventListener('load', () => {
  // Capture initial state
  initialContent = document.body.innerHTML;
  
  // Monitor for changes
  const observer = new MutationObserver(() => {
    if (!hasBeenModified) {
      hasBeenModified = true;
      // Mark forms as potentially modified
      document.querySelectorAll('form').forEach(form => {
        form.classList.add('modified');
      });
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
  
  // Monitor input changes
  document.addEventListener('input', () => {
    hasBeenModified = true;
  });
  
  document.addEventListener('change', () => {
    hasBeenModified = true;
  });
});

// Add CSS for smooth animations
const style = document.createElement('style');
style.textContent = `
  #focus-mode-warning {
    animation: focusSlideIn 0.3s ease-out;
  }
  
  @keyframes focusSlideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);