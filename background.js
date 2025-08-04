// Background service worker for Bilibili Language Learning Loop extension

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Bilibili Language Learning Loop extension installed');
    
    // Set default settings
    chrome.storage.sync.set({
      openaiKey: '',
      ankiDeck: 'Chinese Learning'
    });
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.sync.get(['openaiKey', 'ankiDeck'], (result) => {
      sendResponse(result);
    });
    return true; // Keep message channel open for async response
  }
});

// Handle tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('bilibili.com')) {
    // Content script should be automatically injected via manifest
    console.log('Bilibili page loaded, content script ready');
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.includes('bilibili.com')) {
    // Open popup (handled by manifest)
    console.log('Extension icon clicked on Bilibili page');
  }
}); 