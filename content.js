// Content script for Bilibili video control

// Inject the enhanced video controller script
function injectVideoController() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected.js');
  script.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startLoop') {
    startLoop(request.startTime, request.endTime);
    sendResponse({ success: true });
  } else if (request.action === 'stopLoop') {
    stopLoop();
    sendResponse({ success: true });
  }
});

// Start video loop using injected controller
function startLoop(startTime, endTime) {
  console.log(`Starting loop from ${startTime}s to ${endTime}s`);
  
  // Send message to injected script
  window.postMessage({
    type: 'BILIBILI_LOOP_CONTROL',
    action: 'startLoop',
    startTime: startTime,
    endTime: endTime
  }, '*');
  
  // Add visual indicator
  addLoopIndicator(startTime, endTime);
}

// Stop video loop
function stopLoop() {
  console.log('Stopping loop');
  
  // Send message to injected script
  window.postMessage({
    type: 'BILIBILI_LOOP_CONTROL',
    action: 'stopLoop'
  }, '*');
  
  // Remove visual indicator
  removeLoopIndicator();
}

// Add visual indicator for loop status
function addLoopIndicator(startTime, endTime) {
  removeLoopIndicator(); // Remove existing indicator
  
  const indicator = document.createElement('div');
  indicator.id = 'bilibili-loop-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #00a1d6;
    color: white;
    padding: 10px 15px;
    border-radius: 5px;
    font-size: 14px;
    font-weight: bold;
    z-index: 9999;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  `;
  indicator.textContent = `🔁 Loop: ${startTime}s - ${endTime}s`;
  
  document.body.appendChild(indicator);
}

// Remove visual indicator
function removeLoopIndicator() {
  const indicator = document.getElementById('bilibili-loop-indicator');
  if (indicator) {
    indicator.remove();
  }
}

// Handle URL parameters for auto-loop
function handleUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const loopStart = urlParams.get('loop_start');
  const loopEnd = urlParams.get('loop_end');
  
  if (loopStart && loopEnd) {
    const startTime = parseFloat(loopStart);
    const endTime = parseFloat(loopEnd);
    
    if (!isNaN(startTime) && !isNaN(endTime) && startTime < endTime) {
      // Wait for video to load and controller to be ready
      setTimeout(() => {
        startLoop(startTime, endTime);
      }, 3000);
    }
  }
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    injectVideoController();
    handleUrlParameters();
  });
} else {
  injectVideoController();
  handleUrlParameters();
}

// Also handle dynamic page changes (for SPA behavior)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    handleUrlParameters();
  }
}).observe(document, { subtree: true, childList: true });

// Export functions for potential use by injected scripts
window.bilibiliLoopExtension = {
  startLoop,
  stopLoop
}; 