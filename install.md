# Installation Guide for Bilibili Language Learning Loop Extension

## Quick Installation Steps

### 1. Download the Extension
- Download all files from this repository
- Make sure you have all these files in a folder:
  - `manifest.json`
  - `popup.html`
  - `popup.js`
  - `content.js`
  - `background.js`
  - `styles.css`
  - `injected.js`

### 2. Install in Chrome
1. Open Chrome browser
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right corner)
4. Click "Load unpacked"
5. Select the folder containing all the extension files
6. The extension should now appear in your extensions list

### 3. Setup API Keys
1. Click the extension icon in your Chrome toolbar
2. Go to the "Settings" section
3. Enter your OpenAI API key (get one from https://platform.openai.com/)
4. Set your preferred Anki deck name
5. Click "Save Settings"

### 4. Optional: Setup Anki Integration
1. Install Anki on your computer
2. Download AnkiConnect addon from https://foosoft.github.io/anki-connect/
3. Install the addon in Anki (Tools > Add-ons > Install Add-on)
4. Restart Anki

## Testing the Extension

### Test Video Looping
1. Go to any Bilibili video (e.g., https://www.bilibili.com/video/BV1nYyXYTEx6)
2. Click the extension icon
3. Enter start time (e.g., 10) and end time (e.g., 30)
4. Click "Start Loop"
5. You should see a blue indicator and the video should loop

### Test Language Learning
1. While on a Bilibili video, click the extension icon
2. Enter some Chinese text in the "Chinese Text" field
3. Click "Analyze with ChatGPT"
4. You should see analysis with pinyin, Vietnamese translation, etc.
5. Click "Add to Anki" to create a flashcard (if AnkiConnect is installed)

## Troubleshooting

### Extension Not Working
- Make sure you're on a Bilibili video page
- Check Chrome DevTools console for errors
- Try refreshing the page after installing the extension

### Video Loop Not Working
- Wait for the video to fully load before starting the loop
- Check if the video element is detected (look for console messages)
- Try different start/end times

### ChatGPT Analysis Fails
- Verify your OpenAI API key is correct
- Check if you have sufficient API credits
- Ensure stable internet connection

### Anki Integration Issues
- Make sure Anki is running
- Verify AnkiConnect is installed and enabled
- Check if AnkiConnect is accessible on localhost:8765

## Advanced Features

### URL Parameters for Auto-Loop
You can add URL parameters to automatically start looping:
```
https://www.bilibili.com/video/BV1nYyXYTEx6?loop_start=10&loop_end=30
```

### Floating Control Panel
When you hover over the video, a floating control panel will appear with:
- Start/End time inputs
- Playback speed control
- Start/Stop buttons
- Real-time status display

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Look at the Chrome DevTools console for error messages
3. Make sure all files are present and properly loaded
4. Try reinstalling the extension

## File Structure
```
extension-folder/
├── manifest.json      # Extension configuration
├── popup.html        # Extension popup interface
├── popup.js          # Popup functionality
├── content.js        # Content script for video control
├── background.js     # Background service worker
├── styles.css        # Extension styles
├── injected.js       # Enhanced video controller
├── README.md         # Detailed documentation
└── install.md        # This installation guide
```

---

**Happy Learning! 🎓📚** 