// Popup script for Bilibili Language Learning Loop extension

document.addEventListener('DOMContentLoaded', function() {
  // Load saved settings
  loadSettings();
  
  // Add event listeners
  document.getElementById('startLoop').addEventListener('click', startVideoLoop);
  document.getElementById('stopLoop').addEventListener('click', stopVideoLoop);
  document.getElementById('analyzeText').addEventListener('click', analyzeText);
  document.getElementById('addToAnki').addEventListener('click', addToAnki);
  document.getElementById('saveSettings').addEventListener('click', saveSettings);
});

// Load settings from storage
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(['openaiKey', 'ankiDeck']);
    if (result.openaiKey) {
      document.getElementById('openaiKey').value = result.openaiKey;
    }
    if (result.ankiDeck) {
      document.getElementById('ankiDeck').value = result.ankiDeck;
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Save settings to storage
async function saveSettings() {
  try {
    const openaiKey = document.getElementById('openaiKey').value;
    const ankiDeck = document.getElementById('ankiDeck').value;
    
    await chrome.storage.sync.set({
      openaiKey: openaiKey,
      ankiDeck: ankiDeck
    });
    
    showStatus('Settings saved successfully!', 'success');
  } catch (error) {
    showStatus('Error saving settings: ' + error.message, 'error');
  }
}

// Start video loop
async function startVideoLoop() {
  try {
    const startTime = parseFloat(document.getElementById('startTime').value) || 0;
    const endTime = parseFloat(document.getElementById('endTime').value) || 60;
    
    if (startTime >= endTime) {
      showStatus('Start time must be less than end time', 'error');
      return;
    }
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('bilibili.com')) {
      showStatus('Please navigate to a Bilibili video page', 'error');
      return;
    }
    
    await chrome.tabs.sendMessage(tab.id, {
      action: 'startLoop',
      startTime: startTime,
      endTime: endTime
    });
    
    showStatus('Video loop started!', 'success');
  } catch (error) {
    showStatus('Error starting loop: ' + error.message, 'error');
  }
}

// Stop video loop
async function stopVideoLoop() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    await chrome.tabs.sendMessage(tab.id, {
      action: 'stopLoop'
    });
    
    showStatus('Video loop stopped!', 'success');
  } catch (error) {
    showStatus('Error stopping loop: ' + error.message, 'error');
  }
}

// Analyze text with ChatGPT
async function analyzeText() {
  try {
    const chineseText = document.getElementById('chineseText').value.trim();
    if (!chineseText) {
      showStatus('Please enter Chinese text to analyze', 'error');
      return;
    }
    
    const openaiKey = document.getElementById('openaiKey').value;
    if (!openaiKey) {
      showStatus('Please enter your OpenAI API key in settings', 'error');
      return;
    }
    
    showStatus('Analyzing text...', 'success');
    
    const analysis = await analyzeWithChatGPT(chineseText, openaiKey);
    
    document.getElementById('analysisContent').innerHTML = analysis;
    document.getElementById('analysisResult').style.display = 'block';
    
    showStatus('Analysis completed!', 'success');
  } catch (error) {
    showStatus('Error analyzing text: ' + error.message, 'error');
  }
}

// Analyze text with ChatGPT API
async function analyzeWithChatGPT(text, apiKey) {
  const prompt = `Please analyze this Chinese text and provide the following information in a structured format:

Text: "${text}"

Please provide:
1. **Pinyin**: The pronunciation in pinyin
2. **Vietnamese Translation**: Translation to Vietnamese (tiếng Việt)
3. **Grammar Notes**: Key grammar points and explanations
4. **Vocabulary**: Important words and their meanings
5. **Usage Examples**: How to use this text in context

Format the response in HTML with clear sections.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful Chinese language tutor. Provide clear, structured analysis of Chinese text with pinyin, Vietnamese translation, grammar notes, and vocabulary explanations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Add to Anki
async function addToAnki() {
  try {
    const chineseText = document.getElementById('chineseText').value.trim();
    const analysisContent = document.getElementById('analysisContent').innerHTML;
    
    if (!chineseText) {
      showStatus('Please enter Chinese text first', 'error');
      return;
    }
    
    if (!analysisContent) {
      showStatus('Please analyze the text first', 'error');
      return;
    }
    
    const ankiDeck = document.getElementById('ankiDeck').value || 'Chinese Learning';
    
    // Get current video URL for loop link
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const videoUrl = tab.url;
    
    // Create Anki card data
    const cardData = {
      deckName: ankiDeck,
      modelName: 'Basic',
      fields: {
        Front: chineseText,
        Back: analysisContent
      },
      tags: ['bilibili', 'chinese-learning']
    };
    
    // Try to add to Anki via AnkiConnect
    const success = await addToAnkiConnect(cardData);
    
    if (success) {
      showStatus('Card added to Anki successfully!', 'success');
    } else {
      showStatus('Failed to add to Anki. Please check if AnkiConnect is installed.', 'error');
    }
  } catch (error) {
    showStatus('Error adding to Anki: ' + error.message, 'error');
  }
}

// Add card to Anki via AnkiConnect
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

// Show status message
function showStatus(message, type) {
  const statusElement = document.getElementById('loopStatus');
  statusElement.textContent = message;
  statusElement.className = `status ${type}`;
  statusElement.style.display = 'block';
  
  // Hide status after 3 seconds
  setTimeout(() => {
    statusElement.style.display = 'none';
  }, 3000);
} 