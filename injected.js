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
      this.handleUrlParameters();
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
        max-height: 90vh;
        overflow-y: auto;
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
          <button id="analyze-btn" style="flex: 1; padding: 10px; border: none; border-radius: 6px; background: #2196F3; color: white; cursor: pointer; font-weight: 500; transition: background 0.2s; position: relative;">
            <span id="analyze-text">Analyze</span>
            <span id="analyze-loading" style="display: none; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);">⏳</span>
          </button>
          <button id="anki-btn" style="flex: 1; padding: 10px; border: none; border-radius: 6px; background: #FF9800; color: white; cursor: pointer; font-weight: 500; transition: background 0.2s; position: relative;">
            <span id="anki-text">Add to Anki</span>
            <span id="anki-loading" style="display: none; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);">⏳</span>
          </button>
        </div>
        
        <div id="loop-url-section" style="margin-bottom: 15px; display: none;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-weight: 500; font-size: 12px;">Loop URL:</div>
            <button id="copy-url-btn" style="padding: 4px 8px; border: none; border-radius: 4px; background: #4CAF50; color: white; cursor: pointer; font-size: 10px;">Copy</button>
          </div>
          <div id="loop-url" style="background: rgba(255,255,255,0.9); padding: 6px; border-radius: 4px; font-size: 10px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%;" title="Click to copy"></div>
        </div>
        
        <div id="analysis-result" style="display: none; background: white; border-radius: 6px; padding: 10px; margin-top: 10px; max-height: 40vh; overflow-y: auto; border: 1px solid rgba(0,0,0,0.1);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-weight: 500; color: #333;">Analysis Result:</div>
            <div style="display: flex; gap: 5px;">
              <button id="copy-analysis-btn" style="padding: 4px 8px; border: none; border-radius: 4px; background: #4CAF50; color: white; cursor: pointer; font-size: 10px;">Copy</button>
              <button id="edit-analysis-btn" style="padding: 4px 8px; border: none; border-radius: 4px; background: #2196F3; color: white; cursor: pointer; font-size: 10px;">Edit</button>
            </div>
          </div>
          <div id="analysis-content" style="font-size: 12px; line-height: 1.4; word-wrap: break-word; overflow-wrap: break-word; color: #333;"></div>
          <textarea id="analysis-content-edit" style="display: none; width: 100%; min-height: 200px; padding: 8px; border: none; border-radius: 4px; background: rgba(255,255,255,0.9); color: #333; font-size: 12px; font-family: inherit; resize: vertical;"></textarea>
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
      
      document.getElementById('copy-url-btn').addEventListener('click', () => {
        this.copyUrlToClipboard();
      });
      
      // Add click-to-copy for the URL display itself
      document.getElementById('loop-url').addEventListener('click', () => {
        this.copyUrlToClipboard();
      });
      
      document.getElementById('copy-analysis-btn').addEventListener('click', () => {
        this.copyAnalysisToClipboard();
      });
      
      document.getElementById('edit-analysis-btn').addEventListener('click', () => {
        this.toggleAnalysisEdit();
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
      const showBtn = document.getElementById('bilibili-loop-show-btn');
      
      if (panel.style.display === 'none') {
        panel.style.display = 'block';
        toggleBtn.textContent = 'Hide Panel';
        if (showBtn) showBtn.style.display = 'none';
      } else {
        panel.style.display = 'none';
        toggleBtn.textContent = 'Show Panel';
        this.createShowButton();
      }
    }
    
    createShowButton() {
      // Remove existing show button
      const existingBtn = document.getElementById('bilibili-loop-show-btn');
      if (existingBtn) {
        existingBtn.remove();
      }
      
      // Create floating show button
      const showBtn = document.createElement('div');
      showBtn.id = 'bilibili-loop-show-btn';
      showBtn.style.cssText = `
        position: fixed;
        top: 50%;
        right: 20px;
        transform: translateY(-50%);
        background: #00a1d6;
        color: white;
        padding: 15px;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        z-index: 9997;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      showBtn.innerHTML = '🎬';
      showBtn.title = 'Show Language Learning Panel';
      
      // Add hover effect
      showBtn.addEventListener('mouseenter', () => {
        showBtn.style.transform = 'translateY(-50%) scale(1.1)';
        showBtn.style.background = '#0091c2';
      });
      showBtn.addEventListener('mouseleave', () => {
        showBtn.style.transform = 'translateY(-50%) scale(1)';
        showBtn.style.background = '#00a1d6';
      });
      
      // Add click event
      showBtn.addEventListener('click', () => {
        this.togglePanel();
      });
      
      document.body.appendChild(showBtn);
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
      
      // Set video properties and start playing
      this.video.currentTime = this.startTime;
      this.video.playbackRate = speed;
      
      // Auto-play the video when starting loop
      this.video.play().catch(error => {
        console.log('Auto-play failed:', error);
        // This is normal if user hasn't interacted with the page yet
        // Show a message to the user to click on the video first
        this.showMessage('Please click on the video first to enable auto-play', 'info');
      });
      
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
      this.updateLoopUrl();
      
      this.showMessage(`Loop started: ${this.startTime}s to ${this.endTime}s`, 'success');
      console.log(`Loop started: ${this.startTime}s to ${this.endTime}s at ${speed}x speed`);
    }
    
    stopLoop() {
      this.isLooping = false;
      
      if (this.loopInterval) {
        clearInterval(this.loopInterval);
        this.loopInterval = null;
      }
      
      // Pause video and set current time as end time
      if (this.video) {
        this.video.pause();
        this.video.playbackRate = this.originalPlaybackRate;
        
        // Update the end time input with current time
        const endInput = document.getElementById('loop-end-input');
        if (endInput) {
          endInput.value = Math.floor(this.video.currentTime);
        }
      }
      
      this.updateStatus();
      this.showMessage('Loop stopped and video paused', 'info');
      console.log('Loop stopped and video paused');
    }
    
    async analyzeText() {
      const textInput = document.getElementById('chinese-text-input');
      const chineseText = textInput.value.trim();
      
      if (!chineseText) {
        alert('Please enter Chinese text to analyze');
        return;
      }
      
      // Show loading state
      this.setAnalyzeLoading(true);
      
      // Send message to content script to get API key
      window.postMessage({
        type: 'BILIBILI_ANALYZE_REQUEST',
        action: 'getOpenAIKey',
        text: chineseText
      }, '*');
    }
    
    // Handle response from content script
    handleAnalyzeResponse(apiKey, text) {
      if (!apiKey) {
        alert('Please set your OpenAI API key in the extension popup settings');
        this.setAnalyzeLoading(false);
        return;
      }
      
      this.analyzeWithChatGPT(text, apiKey).then(analysis => {
        // Clean up the HTML content to remove excessive spacing
        const cleanedAnalysis = this.cleanHtmlContent(analysis);
        document.getElementById('analysis-content').innerHTML = cleanedAnalysis;
        document.getElementById('analysis-result').style.display = 'block';
        console.log('Analysis completed');
        this.setAnalyzeLoading(false);
      }).catch(error => {
        alert('Error analyzing text: ' + error.message);
        this.setAnalyzeLoading(false);
      });
    }
    
    async analyzeWithChatGPT(text, apiKey) {
      // Send message to content script to get custom prompt
      return new Promise((resolve, reject) => {
        const messageHandler = (event) => {
          if (event.data.type === 'BILIBILI_PROMPT_RESPONSE') {
            window.removeEventListener('message', messageHandler);
            
            const { customPrompt } = event.data;
            let prompt = customPrompt || `Please analyze this Chinese text and provide the following information in a structured format:

Text: "{text}"

Please provide:
1. **Pinyin**: The pronunciation in pinyin
2. **Vietnamese Translation**: Translation to Vietnamese (tiếng Việt)
3. **Grammar Notes**: Key grammar points and explanations
4. **Vocabulary**: Important words and their meanings
5. **Usage Examples**: How to use this text in context

Format the response in HTML with clear sections.`;

            // Replace {text} placeholder with actual text
            prompt = prompt.replace('{text}', text);

            fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
              },
              body: JSON.stringify({
                model: selectedModel,
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
            }).then(response => {
              if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
              }
              return response.json();
            }).then(data => {
              resolve(data.choices[0].message.content);
            }).catch(error => {
              reject(error);
            });
          }
        };
        
        window.addEventListener('message', messageHandler);
        
        // Request custom prompt from content script
        window.postMessage({
          type: 'BILIBILI_PROMPT_REQUEST',
          action: 'getCustomPrompt'
        }, '*');
      });
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
      
      // Show loading state
      this.setAnkiLoading(true);
      
      // Send message to content script to get Anki deck and add card
      window.postMessage({
        type: 'BILIBILI_ANKI_REQUEST',
        action: 'addToAnki',
        chineseText: chineseText,
        analysisContent: analysisContent,
        startTime: this.startTime,
        endTime: this.endTime
      }, '*');
    }
    

    
    handleTimeUpdate() {
      // Time display removed to make panel more compact
      // Video time updates are handled by the video player itself
    }
    
    updateStatus() {
      // Status is now handled by the loop URL section visibility
      // No need to update status text since we removed that section
    }
    
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    showMessage(message, type = 'info') {
      // Remove existing message
      const existingMsg = document.getElementById('bilibili-loop-message');
      if (existingMsg) {
        existingMsg.remove();
      }
      
      const msgDiv = document.createElement('div');
      msgDiv.id = 'bilibili-loop-message';
      msgDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-family: 'Segoe UI', sans-serif;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        max-width: 300px;
        text-align: center;
      `;
      msgDiv.textContent = message;
      
      document.body.appendChild(msgDiv);
      
      // Remove message after 3 seconds
      setTimeout(() => {
        if (msgDiv.parentNode) {
          msgDiv.remove();
        }
      }, 3000);
    }
    
    // Public methods for external control
    setLoop(start, end) {
      this.startTime = start;
      this.endTime = end;
      
      // Update the input fields
      const startInput = document.getElementById('loop-start-input');
      const endInput = document.getElementById('loop-end-input');
      
      if (startInput) startInput.value = start;
      if (endInput) endInput.value = end;
      
      this.updateLoopUrl();
      
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
    
    // Handle URL parameters for auto-start
    handleUrlParameters() {
      const urlParams = new URLSearchParams(window.location.search);
      const loopStart = urlParams.get('loop_start');
      const loopEnd = urlParams.get('loop_end');
      
      if (loopStart && loopEnd) {
        const startTime = parseFloat(loopStart);
        const endTime = parseFloat(loopEnd);
        
        if (!isNaN(startTime) && !isNaN(endTime) && startTime < endTime) {
          // Update input fields
          const startInput = document.getElementById('loop-start-input');
          const endInput = document.getElementById('loop-end-input');
          
          if (startInput) startInput.value = startTime;
          if (endInput) endInput.value = endTime;
          
          // Wait for video to be ready, then start loop
          const checkVideo = () => {
            if (this.video && this.video.readyState >= 2) {
              this.setLoop(startTime, endTime);
              this.startLoop();
            } else {
              setTimeout(checkVideo, 500);
            }
          };
          
          checkVideo();
        }
      }
    }
    
    // Update loop URL display
    updateLoopUrl() {
      const urlSection = document.getElementById('loop-url-section');
      const urlDisplay = document.getElementById('loop-url');
      
      if (this.startTime >= 0 && this.endTime > this.startTime) {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('loop_start', this.startTime.toString());
        currentUrl.searchParams.set('loop_end', this.endTime.toString());
        
        const fullUrl = currentUrl.toString();
        // Show a shortened version but keep the full URL for copying
        const shortUrl = fullUrl.length > 50 ? fullUrl.substring(0, 47) + '...' : fullUrl;
        urlDisplay.textContent = shortUrl;
        urlDisplay.title = fullUrl; // Show full URL on hover
        urlSection.style.display = 'block';
      } else {
        urlSection.style.display = 'none';
      }
    }
    
    // Copy URL to clipboard
    copyUrlToClipboard() {
      const urlDisplay = document.getElementById('loop-url');
      // Get the full URL from the title attribute (for shortened URLs)
      const url = urlDisplay.title || urlDisplay.textContent;
      
      navigator.clipboard.writeText(url).then(() => {
        this.showMessage('URL copied to clipboard!', 'success');
      }).catch(err => {
        console.error('Failed to copy URL:', err);
        this.showMessage('Failed to copy URL', 'error');
      });
    }
    
    // Copy analysis to clipboard
    copyAnalysisToClipboard() {
      const analysisContent = document.getElementById('analysis-content');
      // Get HTML content for better formatting when pasted
      const html = analysisContent.innerHTML;
      const text = analysisContent.textContent || analysisContent.innerText;
      
      // Try to copy HTML first, fallback to text
      navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([text], { type: 'text/plain' })
        })
      ]).then(() => {
        this.showMessage('Analysis copied to clipboard!', 'success');
      }).catch(err => {
        // Fallback to text only
        navigator.clipboard.writeText(text).then(() => {
          this.showMessage('Analysis copied to clipboard!', 'success');
        }).catch(err2 => {
          console.error('Failed to copy analysis:', err2);
          this.showMessage('Failed to copy analysis', 'error');
        });
      });
    }
    
    // Toggle analysis edit mode
    toggleAnalysisEdit() {
      const contentDiv = document.getElementById('analysis-content');
      const editTextarea = document.getElementById('analysis-content-edit');
      const editBtn = document.getElementById('edit-analysis-btn');
      
      if (editTextarea.style.display === 'none') {
        // Switch to edit mode - show HTML source
        const html = contentDiv.innerHTML;
        editTextarea.value = html;
        contentDiv.style.display = 'none';
        editTextarea.style.display = 'block';
        editBtn.textContent = 'Save';
        editBtn.style.background = '#FF9800';
      } else {
        // Switch back to view mode - render HTML
        const html = editTextarea.value;
        contentDiv.innerHTML = html;
        contentDiv.style.display = 'block';
        editTextarea.style.display = 'none';
        editBtn.textContent = 'Edit';
        editBtn.style.background = '#2196F3';
      }
    }
    
    // Add URL to Anki
    async addUrlToAnki() {
      const urlDisplay = document.getElementById('loop-url');
      const loopUrl = urlDisplay.textContent;
      
      // Get video title if available
      const videoTitle = document.querySelector('h1')?.textContent || 'Bilibili Video';
      
      // Send message to content script to add URL to Anki
      window.postMessage({
        type: 'BILIBILI_ANKI_REQUEST',
        action: 'addUrlToAnki',
        videoTitle: videoTitle,
        loopUrl: loopUrl,
        startTime: this.startTime,
        endTime: this.endTime
      }, '*');
    }
    
    // Loading state management methods
    setAnalyzeLoading(isLoading) {
      const analyzeBtn = document.getElementById('analyze-btn');
      const analyzeText = document.getElementById('analyze-text');
      const analyzeLoading = document.getElementById('analyze-loading');
      
      if (isLoading) {
        analyzeText.style.opacity = '0';
        analyzeLoading.style.display = 'block';
        analyzeBtn.disabled = true;
        analyzeBtn.style.cursor = 'not-allowed';
        analyzeBtn.style.background = '#ccc';
      } else {
        analyzeText.style.opacity = '1';
        analyzeLoading.style.display = 'none';
        analyzeBtn.disabled = false;
        analyzeBtn.style.cursor = 'pointer';
        analyzeBtn.style.background = '#2196F3';
      }
    }
    
    setAnkiLoading(isLoading) {
      const ankiBtn = document.getElementById('anki-btn');
      const ankiText = document.getElementById('anki-text');
      const ankiLoading = document.getElementById('anki-loading');
      
      if (isLoading) {
        ankiText.style.opacity = '0';
        ankiLoading.style.display = 'block';
        ankiBtn.disabled = true;
        ankiBtn.style.cursor = 'not-allowed';
        ankiBtn.style.background = '#ccc';
      } else {
        ankiText.style.opacity = '1';
        ankiLoading.style.display = 'none';
        ankiBtn.disabled = false;
        ankiBtn.style.cursor = 'pointer';
        ankiBtn.style.background = '#FF9800';
      }
    }
    
    // Clean up HTML content to remove excessive spacing
    cleanHtmlContent(html) {
      // Create a temporary div to parse and clean the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // Remove excessive whitespace and normalize spacing
      const cleanElement = (element) => {
        // Remove empty text nodes and excessive whitespace
        for (let i = element.childNodes.length - 1; i >= 0; i--) {
          const node = element.childNodes[i];
          if (node.nodeType === Node.TEXT_NODE) {
            // Normalize whitespace in text nodes
            node.textContent = node.textContent.replace(/\s+/g, ' ').trim();
            if (node.textContent === '') {
              node.remove();
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            cleanElement(node);
          }
        }
      };
      
      cleanElement(tempDiv);
      
      // Get the cleaned HTML
      return tempDiv.innerHTML;
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
    } else if (event.data.type === 'BILIBILI_ANALYZE_RESPONSE') {
      const { apiKey, text } = event.data;
      videoController.handleAnalyzeResponse(apiKey, text);
    } else if (event.data.type === 'BILIBILI_ANKI_RESPONSE') {
      const { success, message } = event.data;
      videoController.setAnkiLoading(false);
      if (success) {
        videoController.showMessage('Card added to Anki successfully!', 'success');
      } else {
        videoController.showMessage(message || 'Failed to add to Anki. Please check if AnkiConnect is installed.', 'error');
      }
    }
  });
  
})(); 