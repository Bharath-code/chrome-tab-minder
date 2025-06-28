# Focus Mode - Single Tab Manager

A beautiful Chrome extension that enforces single-tab focus mode with customizable timers to boost productivity and minimize distractions.

## Features

### Core Functionality
- **Single Tab Enforcement**: Automatically closes additional tabs and windows to maintain focus
- **Customizable Timer**: Set focus sessions with countdown display and notifications
- **Smart Whitelist**: Allow essential websites to bypass restrictions
- **Pinned Tab Respect**: Optionally preserve pinned tabs
- **Unsaved Work Protection**: Warns before closing tabs with potential unsaved work

### Design & User Experience
- **Beautiful Modern Interface**: Clean, professional design with smooth animations
- **Responsive Design**: Works perfectly across all screen sizes
- **Intuitive Controls**: Easy-to-use timer presets and custom durations
- **Visual Feedback**: Color-coded status indicators and hover effects
- **Accessibility**: Proper contrast ratios and keyboard navigation

### Advanced Features
- **Chrome Sync Integration**: Settings sync across devices
- **Statistics Tracking**: Monitor focus time, sessions completed, and productivity metrics
- **Customizable Presets**: Set your preferred timer durations
- **Data Export**: Export your focus data and settings
- **Edge Case Handling**: Smart management of popup windows and system tabs

## Installation

### From Chrome Web Store
1. Visit the Chrome Web Store (link coming soon)
2. Click "Add to Chrome"
3. Confirm the installation

### Manual Installation (Development)
1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The Focus Mode icon should appear in your toolbar

## Usage

### Getting Started
1. Click the Focus Mode icon in your Chrome toolbar
2. Toggle "Enable Focus Mode" to activate single-tab enforcement
3. Set a timer using the preset buttons (25m, 45m, 60m, 90m) or enter a custom duration
4. Click "Start Timer" to begin your focus session

### Customization
1. Right-click the extension icon and select "Options"
2. Configure your preferences:
   - Enable/disable tab closing when timer ends
   - Add websites to the whitelist
   - Customize timer presets
   - View productivity statistics

### Whitelist Management
Add essential websites that should always remain accessible:
- Gmail, Google Docs, work applications
- Reference sites, documentation
- Any site you need during focus sessions

## Settings

### General Settings
- **Close tab when timer ends**: Automatically close the current tab when focus time expires
- **Show warning before closing tabs**: Display confirmation before closing additional tabs
- **Respect pinned tabs**: Allow pinned tabs to remain open

### Timer Presets
Customize the four preset timer buttons with your preferred durations (1-480 minutes).

### Statistics
Track your productivity with detailed metrics:
- Total focus time across all sessions
- Number of completed focus sessions
- Total tabs closed by the extension
- Longest single focus session

## Technical Details

### Architecture
- **Manifest V3**: Uses the latest Chrome extension architecture
- **Service Worker**: Efficient background processing
- **Chrome Sync**: Settings synchronized across devices
- **Content Scripts**: Smart detection of unsaved work

### Permissions
- `tabs`: Monitor and manage browser tabs
- `windows`: Handle multiple browser windows
- `storage`: Save settings and statistics
- `notifications`: Show timer completion alerts
- `activeTab`: Access current tab information

### Browser Support
- Chrome 88+ (Manifest V3 requirement)
- Chromium-based browsers (Edge, Brave, etc.)

## Privacy & Security

### Data Handling
- **Local Storage**: All data stored locally in Chrome
- **No External Servers**: No data sent to external services
- **Chrome Sync Only**: Settings sync through Chrome's secure sync service
- **No Tracking**: Extension doesn't track or collect user behavior

### Permissions Usage
- Tab permissions used only for focus mode enforcement
- Storage permissions for saving user preferences
- Notification permissions for timer alerts only

## Contributing

### Development Setup
1. Clone the repository
2. Make your changes
3. Test thoroughly with "Load unpacked" in Chrome
4. Submit a pull request

### Icon Creation
The extension includes SVG placeholders for icons. For production:
1. Convert the SVG files in `/icons/` to PNG format
2. Ensure proper sizing: 16x16, 32x32, 48x48, 128x128 pixels
3. Optimize for crisp display at all sizes

### Testing Checklist
- [ ] Single tab enforcement works correctly
- [ ] Timer functions properly with notifications
- [ ] Whitelist respects specified websites
- [ ] Pinned tabs handled according to settings
- [ ] Settings persist across browser restarts
- [ ] UI responsive across different screen sizes
- [ ] Chrome sync works when signed in

## Support

### Troubleshooting
- **Extension not working**: Check if it's enabled in chrome://extensions/
- **Timer not appearing**: Ensure Focus Mode is enabled first
- **Settings not saving**: Check Chrome sync status
- **Whitelist not working**: Verify domain format (e.g., "gmail.com")

### Known Issues
- Very short timer durations (< 5 seconds) may not display properly
- Some system tabs (chrome:// pages) cannot be closed by extensions
- Browser startup tabs may briefly appear before being closed

## Changelog

### Version 1.0.0
- Initial release
- Single tab enforcement
- Customizable timer with presets
- Website whitelist functionality
- Statistics tracking
- Chrome sync integration
- Modern responsive design

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Chrome Extension Manifest V3
- Icons created with custom SVG designs
- UI inspired by modern productivity applications
- Color scheme based on accessible design principles