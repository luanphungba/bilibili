// Injected script for enhanced video control and features

(function() {
  'use strict';
  
  // Enhanced video detection and control
  class BilibiliVideoController {
    constructor() {
      this.video = null;
      this.isLooping = false;
      this.loopInterval = null;
      this.startTime = 0;
      this.endTime = 60;
      this.originalVolume = 1;
      this.originalPlaybackRate = 1;
      
      this.init();
    }
    
    init() {
      this.findVideo();
      this.setupEventListeners();
      this.createControlPanel();
    }
    
    findVideo() {
      // Enhanced video detection for Bilibili
      const selectors = [
        'video',
        '.bilibili-player-video video',
        '#bilibili-player video',
        '.player-video video',
        '.bpx-player-video-wrap video',
        '.bpx-player-container video'
      ];
      
      for (const selector of selectors) {
        const video = document.querySelector(selector);
        if (video && video.readyState >= 2) { // HAVE_CURRENT_DATA
          this.video = video;
          console.log('Video element found:', video);
          break;
        }
      }
      
      // If video not found, try again after a delay
      if (!this.video) {
        setTimeout(() => this.findVideo(), 1000);
      }
    }
    
    setupEventListeners() {
      // Listen for video element changes
      const observer = new MutationObserver(() => {
        if (!this.video || !this.video.parentNode) {
          this.findVideo();
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      // Listen for video events
      if (this.video) {
        this.video.addEventListener('loadedmetadata', () => {
          console.log('Video metadata loaded');
        });
        
        this.video.addEventListener('timeupdate', () => {
          this.handleTimeUpdate();
        });
      }
    }
    
    createControlPanel() {
      // Create persistent control panel on the right side
      const panel = document.createElement('div');
      panel.id = 'bilibili-loop-panel';
      panel.style.cssText = `
        position: fixed;
        top: 50%;
        right: 20px;
        transform: translateY(-50%);
        background: rgba(0, 161, 214, 0.95);
        color: white;
        padding: 20px;
        border-radius: 12px;
        font-family: 'Segoe UI', sans-serif;
        font-size: 14px;
        z-index: 9998;
        backdrop-filter: blur(10px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        min-width: 280px;
        max-width: 320px;
        border: 2px solid rgba(255,255,255,0.2);
      `;
      
      panel.innerHTML = `
        <div style="margin-bottom: 15px; font-weight: bold; font-size: 16px; text-align: center;">
          🎬 Language Learning Loop
        </div>
        
        <div style="margin-bottom: 15px;">
          <div style="margin-bottom: 8px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">Start Time (s):</label>
            <input type="number" id="loop-start-input" style="width: 100%; padding: 8px; border: none; border-radius: 6px; background: rgba(255,255,255,0.9); color: #333;" value="0" min="0">
          </div>
          <div style="margin-bottom: 8px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">End Time (s):</label>
            <input type="number" id="loop-end-input" style="width: 100%; padding: 8px; border: none; border-radius: 6px; background: rgba(255,255,255,0.9); color: #333;" value="60" min="0">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">Speed:</label>
            <select id="loop-speed-input" style="width: 100%; padding: 8px; border: none; border-radius: 6px; background: rgba(255,255,255,0.9); color: #333;">
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1" selected>1x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>
          </div>
        </div>
        
        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
          <button id="loop-start-btn" style="flex: 1; padding: 10px; border: none; border-radius: 6px; background: #4CAF50; color: white; cursor: pointer; font-weight: 500; transition: background 0.2s;">Start Loop</button>
          <button id="loop-stop-btn" style="flex: 1; padding: 10px; border: none; border-radius: 6px; background: #f44336; color: white; cursor: pointer; font-weight: 500; transition: background 0.2s;">Stop Loop</button>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 4px; font-weight: 500;">Chinese Text:</label>
          <textarea id="chinese-text-input" placeholder="Enter Chinese text to analyze..." style="width: 100%; padding: 8px; border: none; border-radius: 6px; background: rgba(255,255,255,0.9); color: #333; resize: vertical; min-height: 60px; font-family: inherit;"></textarea>
        </div>
        
        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
          <button id="analyze-btn" style="flex: 1; padding: 10px; border: none; border-radius: 6px; background: #2196F3; color: white; cursor: pointer; font-weight: 500; transition: background 0.2s;">Analyze</button>
          <button id="anki-btn" style="flex: 1; padding: 10px; border: none; border-radius: 6px; background: #FF9800; color: white; cursor: pointer; font-weight: 500; transition: background 0.2s;">Add to Anki</button>
        </div>
        
        <div style="margin-bottom: 15px;">
          <div id="loop-status" style="text-align: center; font-weight: 500; margin-bottom: 5px;">Ready</div>
          <div id="loop-time" style="text-align: center; font-size: 12px; opacity: 0.8;">00:00 / 00:00</div>
        </div>
        
        <div id="analysis-result" style="display: none; background: rgba(255,255,255,0.1); border-radius: 6px; padding: 10px; margin-top: 10px; max-height: 200px; overflow-y: auto;">
          <div style="font-weight: 500; margin-bottom: 8px;">Analysis Result:</div>
          <div id="analysis-content" style="font-size: 12px; line-height: 1.4;"></div>
        </div>
        
        <div style="text-align: center; margin-top: 10px;">
          <button id="toggle-panel-btn" style="background: none; border: none; color: white; cursor: pointer; font-size: 12px; opacity: 0.7;">Hide Panel</button>
        </div>
      `;
      
      document.body.appendChild(panel);
      
      // Add event listeners
      document.getElementById('loop-start-btn').addEventListener('click', () => {
        this.startLoop();
      });
      
      document.getElementById('loop-stop-btn').addEventListener('click', () => {
        this.stopLoop();
      });
      
      document.getElementById('analyze-btn').addEventListener('click', () => {
        this.analyzeText();
      });
      
      document.getElementById('anki-btn').addEventListener('click', () => {
        this.addToAnki();
      });
      
      document.getElementById('toggle-panel-btn').addEventListener('click', () => {
        this.togglePanel();
      });
      
      // Add hover effects
      const buttons = panel.querySelectorAll('button');
      buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
          btn.style.opacity = '0.8';
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.opacity = '1';
        });
      });
    }
    
    togglePanel() {
      const panel = document.getElementById('bilibili-loop-panel');
      const toggleBtn = document.getElementById('toggle-panel-btn');
      
      if (panel.style.display === 'none') {
        panel.style.display = 'block';
        toggleBtn.textContent = 'Hide Panel';
      } else {
        panel.style.display = 'none';
        toggleBtn.textContent = 'Show Panel';
      }
    }
    
    startLoop() {
      if (!this.video) {
        console.error('No video element found');
        return;
      }
      
      const startInput = document.getElementById('loop-start-input');
      const endInput = document.getElementById('loop-end-input');
      const speedInput = document.getElementById('loop-speed-input');
      
      this.startTime = parseFloat(startInput.value) || 0;
      this.endTime = parseFloat(endInput.value) || 60;
      const speed = parseFloat(speedInput.value) || 1;
      
      if (this.startTime >= this.endTime) {
        alert('Start time must be less than end time');
        return;
      }
      
      // Store original settings
      this.originalVolume = this.video.volume;
      this.originalPlaybackRate = this.video.playbackRate;
      
      // Set video properties
      this.video.currentTime = this.startTime;
      this.video.playbackRate = speed;
      
      this.isLooping = true;
      
      // Start monitoring
      this.loopInterval = setInterval(() => {
        if (!this.isLooping || !this.video) return;
        
        if (this.video.currentTime >= this.endTime) {
          this.video.currentTime = this.startTime;
          console.log('Loop reset to start time');
        }
      }, 100);
      
      this.updateStatus();
      console.log(`Loop started: ${this.startTime}s to ${this.endTime}s at ${speed}x speed`);
    }
    
    stopLoop() {
      this.isLooping = false;
      
      if (this.loopInterval) {
        clearInterval(this.loopInterval);
        this.loopInterval = null;
      }
      
      // Restore original settings
      if (this.video) {
        this.video.playbackRate = this.originalPlaybackRate;
      }
      
      this.updateStatus();
      console.log('Loop stopped');
    }
    
    async analyzeText() {
      const textInput = document.getElementById('chinese-text-input');
      const chineseText = textInput.value.trim();
      
      if (!chineseText) {
        alert('Please enter Chinese text to analyze');
        return;
      }
      
      // Get OpenAI API key from storage
      const result = await chrome.storage.sync.get(['openaiKey']);
      const apiKey = result.openaiKey;
      
      if (!apiKey) {
        alert('Please set your OpenAI API key in the extension popup settings');
        return;
      }
      
      try {
        const analysis = await this.analyzeWithChatGPT(chineseText, apiKey);
        
        document.getElementById('analysis-content').innerHTML = analysis;
        document.getElementById('analysis-result').style.display = 'block';
        
        console.log('Analysis completed');
      } catch (error) {
        alert('Error analyzing text: ' + error.message);
      }
    }
    
    async analyzeWithChatGPT(text, apiKey) {
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
    
    async addToAnki() {
      const chineseText = document.getElementById('chinese-text-input').value.trim();
      const analysisContent = document.getElementById('analysis-content').innerHTML;
      
      if (!chineseText) {
        alert('Please enter Chinese text first');
        return;
      }
      
      if (!analysisContent) {
        alert('Please analyze the text first');
        return;
      }
      
      try {
        const result = await chrome.storage.sync.get(['ankiDeck']);
        const ankiDeck = result.ankiDeck || 'Chinese Learning';
        
        const cardData = {
          deckName: ankiDeck,
          modelName: 'Basic',
          fields: {
            Front: chineseText,
            Back: analysisContent
          },
          tags: ['bilibili', 'chinese-learning']
        };
        
        const success = await this.addToAnkiConnect(cardData);
        
        if (success) {
          alert('Card added to Anki successfully!');
        } else {
          alert('Failed to add to Anki. Please check if AnkiConnect is installed.');
        }
      } catch (error) {
        alert('Error adding to Anki: ' + error.message);
      }
    }
    
    async addToAnkiConnect(cardData) {
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
    
    handleTimeUpdate() {
      if (!this.video) return;
      
      const timeDisplay = document.getElementById('loop-time');
      if (timeDisplay) {
        const current = this.formatTime(this.video.currentTime);
        const duration = this.formatTime(this.video.duration || 0);
        timeDisplay.textContent = `${current} / ${duration}`;
      }
    }
    
    updateStatus() {
      const statusElement = document.getElementById('loop-status');
      if (statusElement) {
        if (this.isLooping) {
          statusElement.textContent = `Looping: ${this.startTime}s - ${this.endTime}s`;
          statusElement.style.color = '#4CAF50';
        } else {
          statusElement.textContent = 'Ready';
          statusElement.style.color = 'white';
        }
      }
    }
    
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Public methods for external control
    setLoop(start, end) {
      this.startTime = start;
      this.endTime = end;
      
      if (this.isLooping) {
        this.stopLoop();
        this.startLoop();
      }
    }
    
    getLoopStatus() {
      return {
        isLooping: this.isLooping,
        startTime: this.startTime,
        endTime: this.endTime,
        currentTime: this.video?.currentTime || 0
      };
    }
  }
  
  // Initialize the controller
  const videoController = new BilibiliVideoController();
  
  // Expose to window for external access
  window.bilibiliVideoController = videoController;
  
  // Listen for messages from content script
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    
    if (event.data.type === 'BILIBILI_LOOP_CONTROL') {
      const { action, startTime, endTime } = event.data;
      
      switch (action) {
        case 'startLoop':
          videoController.setLoop(startTime, endTime);
          videoController.startLoop();
          break;
        case 'stopLoop':
          videoController.stopLoop();
          break;
        case 'getStatus':
          event.source.postMessage({
            type: 'BILIBILI_LOOP_STATUS',
            status: videoController.getLoopStatus()
          }, '*');
          break;
      }
    }
  });
  
})(); 