# Gmail Summarizer

A Chrome extension that adds a summarize button to Gmail's toolbar.

## Features

- Adds a "Summarize Email" button to Gmail's toolbar when viewing an email
- Currently shows an alert when clicked (placeholder for future summarization functionality)

## Installation

1. Clone this repository or download as ZIP
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the folder containing this extension
5. The extension is now installed and will activate when you open Gmail

## Usage

1. Open Gmail in Chrome
2. Open any email
3. You should see a new "Summarize" button in the toolbar
4. Click the button to show an alert

## Development

This extension uses:
- Manifest V3
- Content scripts for injecting the button into Gmail's interface
- MutationObserver to handle Gmail's dynamic DOM updates

## License

MIT 