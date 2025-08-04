// Popup script for Bilibili Language Learning Loop extension

document.addEventListener('DOMContentLoaded', function() {
  // Load saved settings
  loadSettings();
  
  // Add event listeners
  document.getElementById('saveSettings').addEventListener('click', saveSettings);
  
  // Add template preview listeners
  document.getElementById('frontTemplate').addEventListener('input', updateFrontPreview);
  document.getElementById('backTemplate').addEventListener('input', updateBackPreview);
});

// Load settings from storage
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get([
      'openaiKey', 
      'openaiModel',
      'customPrompt', 
      'ankiDeck', 
      'frontTemplate', 
      'backTemplate'
    ]);
    
    if (result.openaiKey) {
      document.getElementById('openaiKey').value = result.openaiKey;
    }
    if (result.openaiModel) {
      document.getElementById('openaiModel').value = result.openaiModel;
    }
    if (result.customPrompt) {
      document.getElementById('customPrompt').value = result.customPrompt;
    }
    if (result.ankiDeck) {
      document.getElementById('ankiDeck').value = result.ankiDeck;
    }
    if (result.frontTemplate) {
      document.getElementById('frontTemplate').value = result.frontTemplate;
    }
    if (result.backTemplate) {
      document.getElementById('backTemplate').value = result.backTemplate;
    }
    
    // Update previews after loading
    updateFrontPreview();
    updateBackPreview();
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Save settings to storage
async function saveSettings() {
  try {
    const openaiKey = document.getElementById('openaiKey').value;
    const openaiModel = document.getElementById('openaiModel').value;
    const customPrompt = document.getElementById('customPrompt').value;
    const ankiDeck = document.getElementById('ankiDeck').value;
    const frontTemplate = document.getElementById('frontTemplate').value;
    const backTemplate = document.getElementById('backTemplate').value;
    
    await chrome.storage.sync.set({
      openaiKey: openaiKey,
      openaiModel: openaiModel,
      customPrompt: customPrompt,
      ankiDeck: ankiDeck,
      frontTemplate: frontTemplate,
      backTemplate: backTemplate
    });
    
    showStatus('Settings saved successfully!', 'success');
  } catch (error) {
    showStatus('Error saving settings: ' + error.message, 'error');
  }
}

// Update front template preview
function updateFrontPreview() {
  const template = document.getElementById('frontTemplate').value;
  const preview = document.getElementById('frontPreview');
  
  // Create sample data for preview
  const sampleData = {
    chineseText: '你好世界',
    startTime: 10,
    endTime: 25,
    videoTitle: 'Sample Video',
    currentUrl: 'https://www.bilibili.com/video/sample'
  };
  
  const previewText = replaceTemplateVariables(template, sampleData);
  preview.textContent = previewText;
}

// Update back template preview
function updateBackPreview() {
  const template = document.getElementById('backTemplate').value;
  const preview = document.getElementById('backPreview');
  
  // Create sample data for preview
  const sampleData = {
    analysis: '<strong>Pinyin:</strong> nǐ hǎo shì jiè<br><strong>Translation:</strong> Hello world',
    loopUrl: 'https://www.bilibili.com/video/sample?loop_start=10&loop_end=25',
    startTime: 10,
    endTime: 25
  };
  
  const previewText = replaceTemplateVariables(template, sampleData);
  preview.textContent = previewText;
}

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

// Show status message
function showStatus(message, type) {
  const statusElement = document.getElementById('settingsStatus');
  statusElement.textContent = message;
  statusElement.className = `status ${type}`;
  statusElement.style.display = 'block';
  
  // Hide status after 3 seconds
  setTimeout(() => {
    statusElement.style.display = 'none';
  }, 3000);
} 