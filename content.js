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
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'startLoop') {
    startLoop(request.startTime, request.endTime);
    sendResponse({ success: true });
  } else if (request.action === 'stopLoop') {
    const currentTime = await stopLoop();
    sendResponse({ success: true, currentTime: currentTime });
  }
});

// Listen for messages from injected script
window.addEventListener('message', async (event) => {
  if (event.source !== window) return;
  
  if (event.data.type === 'BILIBILI_ANALYZE_REQUEST') {
    const { action, text } = event.data;
    
    if (action === 'getOpenAIKey') {
      try {
        const result = await chrome.storage.sync.get(['openaiKey']);
        const apiKey = result.openaiKey;
        
        // Send response back to injected script
        window.postMessage({
          type: 'BILIBILI_ANALYZE_RESPONSE',
          apiKey: apiKey,
          text: text
        }, '*');
      } catch (error) {
        console.error('Error getting OpenAI key:', error);
        window.postMessage({
          type: 'BILIBILI_ANALYZE_RESPONSE',
          apiKey: null,
          text: text
        }, '*');
      }
    }
  } else if (event.data.type === 'BILIBILI_ANKI_REQUEST') {
    const { action, chineseText, analysisContent, startTime, endTime } = event.data;
    
    if (action === 'addToAnki') {
      try {
        const result = await chrome.storage.sync.get(['ankiDeck', 'frontTemplate', 'backTemplate']);
        const ankiDeck = result.ankiDeck || 'Chinese Learning';
        const frontTemplate = result.frontTemplate || 'Chinese Text: {{chineseText}}\n\nLoop: {{startTime}}s - {{endTime}}s';
        const backTemplate = result.backTemplate || '{{analysis}}\n\n<a href="{{loopUrl}}" target="_blank">Watch Loop</a>';
        
        // Get current URL with loop parameters
        const currentUrl = new URL(window.location.href);
        const loopUrl = `${currentUrl.origin}${currentUrl.pathname}?loop_start=${startTime || 0}&loop_end=${endTime || 60}`;
        
        // Get video title
        const videoTitle = document.querySelector('h1')?.textContent || 'Bilibili Video';
        
        // Prepare data for template replacement
        const templateData = {
          chineseText: chineseText.replace(/\n/g, '<br>'),
          analysis: formatAnalysisForAnki(analysisContent),
          loopUrl: loopUrl,
          startTime: startTime || 0,
          endTime: endTime || 60,
          videoTitle: videoTitle,
          currentUrl: window.location.href
        };
        
        // Apply templates
        const frontContent = replaceTemplateVariables(frontTemplate, templateData);
        const backContent = replaceTemplateVariables(backTemplate, templateData);
        
        const cardData = {
          deckName: ankiDeck,
          modelName: 'Basic',
          fields: {
            Front: frontContent,
            Back: backContent
          },
          tags: ['bilibili', 'chinese-learning']
        };
        
        const success = await addToAnkiConnect(cardData);
        
        window.postMessage({
          type: 'BILIBILI_ANKI_RESPONSE',
          success: success,
          message: success ? 'Card added successfully!' : 'Failed to add to Anki. Please check if AnkiConnect is installed.'
        }, '*');
      } catch (error) {
        console.error('Error adding to Anki:', error);
        window.postMessage({
          type: 'BILIBILI_ANKI_RESPONSE',
          success: false,
          message: 'Error adding to Anki: ' + error.message
        }, '*');
      }
    } else if (action === 'addUrlToAnki') {
      try {
        const result = await chrome.storage.sync.get(['ankiDeck', 'frontTemplate', 'backTemplate']);
        const ankiDeck = result.ankiDeck || 'Chinese Learning';
        const frontTemplate = result.frontTemplate || 'Loop: {{videoTitle}}\n\n{{startTime}}s - {{endTime}}s';
        const backTemplate = result.backTemplate || '<a href="{{loopUrl}}" target="_blank">Watch Loop</a>';
        
        // Prepare data for template replacement
        const templateData = {
          chineseText: '',
          analysis: '',
          loopUrl: event.data.loopUrl,
          startTime: event.data.startTime || 0,
          endTime: event.data.endTime || 60,
          videoTitle: event.data.videoTitle,
          currentUrl: window.location.href
        };
        
        // Apply templates
        const frontContent = replaceTemplateVariables(frontTemplate, templateData);
        const backContent = replaceTemplateVariables(backTemplate, templateData);
        
        const cardData = {
          deckName: ankiDeck,
          modelName: 'Basic',
          fields: {
            Front: frontContent,
            Back: backContent
          },
          tags: ['bilibili', 'loop-url']
        };
        
        const success = await addToAnkiConnect(cardData);
        
        if (success) {
          console.log('Loop URL automatically added to Anki');
        } else {
          console.log('Failed to add URL to Anki - AnkiConnect may not be installed');
        }
      } catch (error) {
        console.error('Error adding URL to Anki:', error);
      }
    }
  } else if (event.data.type === 'BILIBILI_PROMPT_REQUEST') {
    const { action } = event.data;
    
    if (action === 'getCustomPrompt') {
      try {
        const result = await chrome.storage.sync.get(['customPrompt', 'openaiModel']);
        const customPrompt = result.customPrompt;
        const openaiModel = result.openaiModel;
        
        window.postMessage({
          type: 'BILIBILI_PROMPT_RESPONSE',
          customPrompt: customPrompt,
          openaiModel: openaiModel
        }, '*');
      } catch (error) {
        console.error('Error getting custom prompt:', error);
        window.postMessage({
          type: 'BILIBILI_PROMPT_RESPONSE',
          customPrompt: null,
          openaiModel: null
        }, '*');
      }
    }
  }
});

// Replace template variables with actual values
function replaceTemplateVariables(template, data) {
  let result = template;
  
  // Replace all variables
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, data[key]);
  });
  
  return result;
}

// Format analysis content for better Anki display
function formatAnalysisForAnki(htmlContent) {
  // Convert HTML to Anki-compatible format
  // Anki supports basic HTML, so we'll clean up the formatting
  let formatted = htmlContent;
  
  // Replace common HTML tags with Anki-compatible ones
  formatted = formatted.replace(/<strong>/g, '<b>');
  formatted = formatted.replace(/<\/strong>/g, '</b>');
  formatted = formatted.replace(/<em>/g, '<i>');
  formatted = formatted.replace(/<\/em>/g, '</i>');
  
  // Ensure proper line breaks
  formatted = formatted.replace(/<br\s*\/?>/gi, '<br>');
  formatted = formatted.replace(/\n/g, '<br>');
  
  // Add some styling for better readability
  formatted = formatted.replace(/<h[1-6]>/g, '<div style="font-weight: bold; margin-top: 10px; margin-bottom: 5px;">');
  formatted = formatted.replace(/<\/h[1-6]>/g, '</div>');
  
  // Style lists
  formatted = formatted.replace(/<ul>/g, '<div style="margin-left: 20px;">');
  formatted = formatted.replace(/<\/ul>/g, '</div>');
  formatted = formatted.replace(/<li>/g, '<div style="margin-bottom: 3px;">• ');
  formatted = formatted.replace(/<\/li>/g, '</div>');
  
  // Add some spacing between sections
  formatted = formatted.replace(/<\/div><div/g, '</div><br><div');
  
  return formatted;
}

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
  
  // Return current time for URL update
  return new Promise((resolve) => {
    setTimeout(() => {
      const video = document.querySelector('video');
      const currentTime = video ? video.currentTime : 0;
      resolve(currentTime);
    }, 100);
  });
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

// Handle URL parameters for auto-loop (deprecated - now handled in injected script)
function handleUrlParameters() {
  // This function is now deprecated as URL parameters are handled in the injected script
  // Keeping for backward compatibility
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    injectVideoController();
  });
} else {
  injectVideoController();
}

// Also handle dynamic page changes (for SPA behavior)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    // URL parameters are now handled in the injected script
  }
}).observe(document, { subtree: true, childList: true });

// Add to AnkiConnect function
async function addToAnkiConnect(cardData) {
  try {
    const response = await fetch('http://localhost:8765', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'addNote',
        version: 6,
        params: {
          note: cardData
        }
      })
    });
    
    if (!response.ok) {
      return false;
    }
    
    const result = await response.json();
    return result.result !== null;
  } catch (error) {
    console.error('AnkiConnect error:', error);
    return false;
  }
}

// Export functions for potential use by injected scripts
window.bilibiliLoopExtension = {
  startLoop,
  stopLoop
}; 