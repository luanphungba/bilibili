# Bilibili Language Learning Loop Extension

A Chrome extension for looping Bilibili videos with integrated language learning features. Perfect for learning Mandarin Chinese through video content with ChatGPT analysis and Anki integration.

## Features

### 🎬 Video Loop Control
- **Persistent Control Panel**: Always-visible control panel on the right side of the video
- **Start/Stop Loop**: Control video looping with custom start and end times
- **Playback Speed Control**: Adjust video speed for better learning
- **Visual Indicator**: See loop status with a floating indicator on the page
- **URL Parameters**: Auto-loop when page loads with URL parameters (`?loop_start=10&loop_end=30`)

### 📚 Language Learning
- **Chinese Text Analysis**: Input Chinese text for comprehensive analysis
- **ChatGPT Integration**: Get pinyin, Vietnamese translation, grammar notes, and vocabulary
- **Structured Output**: Clear sections for pronunciation, translation, grammar, and usage

### 🗂️ Anki Integration
- **Automatic Card Creation**: Add analyzed content directly to Anki
- **Custom Deck Support**: Specify your preferred Anki deck name
- **Rich Card Content**: Include text, analysis, and video loop links

## Installation

### Prerequisites
1. **Chrome Browser**: Version 88 or higher
2. **OpenAI API Key**: Get your API key from [OpenAI Platform](https://platform.openai.com/)
3. **AnkiConnect** (Optional): Install [AnkiConnect](https://foosoft.github.io/anki-connect/) for Anki integration

### Install Extension
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the extension folder
5. The extension icon should appear in your Chrome toolbar

### Setup AnkiConnect (Optional)
1. Install Anki on your computer
2. Download [AnkiConnect](https://foosoft.github.io/anki-connect/) addon
3. Install the addon in Anki (Tools > Add-ons > Install Add-on)
4. Restart Anki

## Usage

### Basic Video Looping
1. Navigate to any Bilibili video (e.g., https://www.bilibili.com/video/BV1nYyXYTEx6)
2. A control panel will appear on the right side of the video
3. Enter start and end times in seconds
4. Select playback speed if desired
5. Click "Start Loop" to begin looping
6. Click "Stop Loop" to stop
7. Use "Hide Panel" to minimize the control panel

### Language Learning Workflow
1. **Loop a video segment** that contains Chinese text you want to learn
2. **Input the Chinese text** in the control panel's text area
3. **Click "Analyze"** to get comprehensive analysis with ChatGPT
4. **Review the analysis** including pinyin, Vietnamese translation, and grammar notes
5. **Click "Add to Anki"** to create a flashcard (if AnkiConnect is installed)

### Settings Configuration
1. **OpenAI API Key**: Enter your API key for ChatGPT analysis
2. **Anki Deck Name**: Specify your preferred deck name (default: "Chinese Learning")
3. **Save Settings**: Click "Save Settings" to store your preferences

### URL Parameters for Auto-Loop
You can add URL parameters to automatically start looping when the page loads:
```
https://www.bilibili.com/video/BV1nYyXYTEx6?loop_start=10&loop_end=30
```

### Persistent Control Panel
A control panel is always visible on the right side of the video with:
- Start/End time inputs
- Playback speed control
- Start/Stop buttons
- Chinese text input and analysis
- Real-time status display
- Hide/Show toggle functionality

## Features in Detail

### Video Loop Control
- **Precise Timing**: Set exact start and end times in seconds
- **Real-time Monitoring**: Checks video position every 100ms
- **Visual Feedback**: Blue indicator shows current loop status
- **Multiple Video Support**: Works with various Bilibili video player layouts

### ChatGPT Analysis
The extension provides structured analysis including:
- **Pinyin**: Chinese pronunciation in pinyin
- **Vietnamese Translation**: Complete translation to Vietnamese
- **Grammar Notes**: Key grammar points and explanations
- **Vocabulary**: Important words and their meanings
- **Usage Examples**: Contextual usage examples

### Anki Integration
- **Automatic Card Creation**: Creates cards with front (Chinese text) and back (analysis)
- **Rich Content**: Includes HTML formatting for better readability
- **Tags**: Automatically tags cards with "bilibili" and "chinese-learning"
- **Deck Management**: Supports custom deck names

## Technical Details

### File Structure
```
loop-bilibili/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── content.js            # Content script for video control
├── background.js         # Background service worker
├── styles.css            # Extension styles
└── README.md            # This file
```

### Permissions
- **activeTab**: Access to current tab for video control
- **storage**: Save user settings and preferences
- **scripting**: Inject scripts for video manipulation
- **host_permissions**: Access to Bilibili and OpenAI APIs

### API Integration
- **OpenAI ChatGPT API**: For text analysis and language learning
- **AnkiConnect API**: For Anki card creation (local HTTP server)

## Troubleshooting

### Extension Not Working
1. **Check Permissions**: Ensure the extension has permission to access Bilibili
2. **Refresh Page**: Reload the Bilibili page after installing the extension
3. **Developer Console**: Check for errors in Chrome DevTools console

### Video Loop Not Working
1. **Video Element**: The extension looks for video elements with specific selectors
2. **Page Load**: Wait for the video to fully load before starting the loop
3. **Bilibili Updates**: The extension may need updates if Bilibili changes their player structure

### ChatGPT Analysis Fails
1. **API Key**: Verify your OpenAI API key is correct
2. **API Quota**: Check if you have sufficient API credits
3. **Network**: Ensure stable internet connection

### Anki Integration Issues
1. **AnkiConnect**: Verify AnkiConnect is installed and running
2. **Anki Running**: Make sure Anki is open and running
3. **Port 8765**: AnkiConnect runs on localhost:8765 by default

## Development

### Local Development
1. Clone the repository
2. Load as unpacked extension in Chrome
3. Make changes to files
4. Click "Reload" in chrome://extensions/ to apply changes

### Building for Distribution
1. Create a ZIP file of the extension folder
2. Upload to Chrome Web Store (requires developer account)
3. Or distribute the ZIP file directly

## Contributing

Feel free to contribute to this project by:
- Reporting bugs
- Suggesting new features
- Submitting pull requests
- Improving documentation

## License

This project is open source and available under the MIT License.

## Support

For support or questions:
1. Check the troubleshooting section above
2. Review the technical documentation
3. Open an issue on the project repository

---

**Happy Learning! 🎓📚** 