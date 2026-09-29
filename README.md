# UK Driving License Slot Finder - Chrome Extension

🚗 **Automatically monitor and find available UK driving license test booking slots across multiple test centres!**

## Features

✨ **Key Features:**
- 🔄 **Automatic Refresh** - Continuously monitors for available slots at configurable intervals (1-60 minutes)
- 📍 **Multiple Test Centres** - Monitor slots at multiple UK test centres simultaneously
- 📅 **Date Range Filtering** - Set your preferred date range (up to 90 days)
- 🔔 **Real-time Notifications** - Get instant desktop notifications when slots are found
- 📋 **Activity Log** - Track all monitoring activity with detailed logs
- 💾 **Persistent Storage** - Saves all settings and found slots
- 🎯 **Smart Checking** - Efficient monitoring without overwhelming the system

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer Mode** (toggle in top-right corner)
4. Click **Load unpacked** and select the extension folder
5. The extension will now appear in your Chrome toolbar

## How to Use

### Step 1: Configure Settings
1. Click the extension icon in your toolbar
2. Enter your **DVLA Reference Number** and **Check Code**
3. Enter the test centres you want to monitor (comma-separated)
   - Example: `London, Manchester, Birmingham`
4. Set your preferred date range (days from now)
5. Set the refresh interval (how often to check, in minutes)
6. Click **Save Settings**

### Step 2: Start Monitoring
1. Click the **Start Monitoring** button
2. The status indicator will turn green and show "Monitoring Active"
3. The extension will automatically check at your specified interval
4. Check the Activity Log to see when checks are happening

### Step 3: Monitor Results
- Found slots appear in the **Available Slots Found** section
- Desktop notifications will alert you immediately
- All found slots are saved for reference
- Review the Activity Log for detailed information

## Important Notes

⚠️ **API Implementation Required**

This extension currently needs integration with the GOV.UK booking system. The `scrapeTestCentreSlots()` function in `background.js` is a placeholder and needs to be implemented based on:

1. The current GOV.UK booking website structure
2. Available APIs (if any)
3. Website scraping capabilities (if APIs are not available)

**Before using this extension**, you need to:
- Reverse-engineer the GOV.UK booking system API or website
- Implement the slot-checking logic in `background.js`
- Handle authentication properly
- Respect the website's rate limits and terms of service

### Potential Implementation Approaches:

**Option 1: Official API** (if available)
- Check if GOV.UK provides an official API for slot checking
- Implement API calls with proper authentication

**Option 2: Web Scraping** (with caution)
- Use the extension's content scripts to scrape the website
- Implement proper rate limiting
- Respect robots.txt and terms of service

**Option 3: Selenium/Puppeteer Integration**
- Use headless browser automation for more reliable scraping
- May require additional setup

## Files Structure

```
├── manifest.json          # Extension configuration
├── popup.html             # Extension UI
├── popup.css              # Extension styling
├── popup.js               # Popup logic and UI updates
├── background.js          # Background monitoring logic
└── images/                # Extension icons (needs to be created)
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Settings

| Setting | Description | Default |
|---------|-------------|----------|
| DVLA Reference Number | Your DVLA booking reference | - |
| Check Code | Your personal check code | - |
| Test Centres | Comma-separated list of centres | - |
| Preferred Date Range | Days to look ahead (1-90) | 30 |
| Refresh Interval | Minutes between checks (1-60) | 5 |

## Permissions

The extension requires:
- **storage** - To save settings and found slots
- **alarms** - For scheduled checks
- **notifications** - To alert you of found slots
- **activeTab** - For content script injection
- **scripting** - To interact with gov.uk website

## Legal Notice

⚖️ **Important:** 
- Use this extension responsibly and ethically
- Respect the GOV.UK website's terms of service and rate limits
- Don't overload the website with requests
- Some automated access may violate terms of service
- Always check the current legal and ToS status before use

## Troubleshooting

### Extension not finding slots?
- Verify your DVLA Reference Number and Check Code are correct
- Check that test centre names match those on GOV.UK exactly
- Review the Activity Log for error messages
- Try manually checking the GOV.UK website

### Monitoring keeps stopping?
- Check your browser's extension settings
- Ensure the extension has permission to run in background
- Try restarting Chrome

### High CPU/Memory usage?
- Increase the refresh interval
- Monitor fewer test centres
- Check for browser console errors

## Contributing

Found an issue or have improvements? Feel free to:
1. Report bugs
2. Suggest features
3. Submit pull requests with improvements

## Disclaimer

This extension is provided as-is. Users are responsible for:
- Ensuring compliance with GOV.UK terms of service
- Proper use of automation tools
- Any consequences of using this extension

Use at your own risk and always check the latest terms and conditions of the GOV.UK booking service.

---

**Happy hunting! 🎉** May you find the perfect slot for your driving test!
