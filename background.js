let monitoringActive = false;
let alarmName = 'checkSlotsAlarm';

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
    console.log('Driving License Slot Finder installed');
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startMonitoring') {
        startMonitoring(request.settings);
        sendResponse({ success: true });
    } else if (request.action === 'stopMonitoring') {
        stopMonitoring();
        sendResponse({ success: true });
    }
});

// Alarm listener for periodic checks
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === alarmName) {
        checkForSlots();
    }
});

function startMonitoring(settings) {
    monitoringActive = true;
    chrome.storage.local.set({ isMonitoring: true });
    
    // Store settings
    chrome.storage.local.set({ monitoringSettings: settings });
    
    // Create alarm for periodic checks
    chrome.alarms.create(alarmName, { 
        delayInMinutes: settings.refreshInterval,
        periodInMinutes: settings.refreshInterval 
    });
    
    sendMessageToPopup({
        action: 'updateStatus',
        isMonitoring: true
    });
    
    sendMessageToPopup({
        action: 'newLog',
        message: `Monitoring started with ${settings.testCentres.length} test centre(s)`,
        type: 'success'
    });
    
    // Perform first check immediately
    checkForSlots();
}

function stopMonitoring() {
    monitoringActive = false;
    chrome.alarms.clear(alarmName);
    chrome.storage.local.set({ isMonitoring: false });
    
    sendMessageToPopup({
        action: 'updateStatus',
        isMonitoring: false
    });
}

async function checkForSlots() {
    const result = await chrome.storage.local.get(['monitoringSettings']);
    if (!result.monitoringSettings) return;

    const settings = result.monitoringSettings;
    
    sendMessageToPopup({
        action: 'newLog',
        message: `Checking ${settings.testCentres.length} test centre(s)...`,
        type: 'info'
    });

    for (const centre of settings.testCentres) {
        try {
            // This is a placeholder - in real implementation, you'd scrape the gov.uk website
            // The actual implementation depends on the current structure of the gov.uk booking system
            const slots = await scrapeTestCentreSlots(
                centre,
                settings.refNumber,
                settings.checkCode,
                settings.dateRange
            );

            if (slots.length > 0) {
                sendMessageToPopup({
                    action: 'newLog',
                    message: `✓ Found ${slots.length} slot(s) at ${centre}!`,
                    type: 'success'
                });

                // Show notification
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'images/icon128.png',
                    title: '🎉 Driving License Slot Found!',
                    message: `Available slot(s) found at ${centre}! Check the extension for details.`,
                    priority: 2
                });

                // Store found slots
                slots.forEach(slot => {
                    sendMessageToPopup({
                        action: 'slotFound',
                        slot: {
                            centre,
                            date: slot.date,
                            time: slot.time,
                            foundAt: new Date().toLocaleString()
                        }
                    });
                });

                // Save to storage
                chrome.storage.local.get(['foundSlots'], (result) => {
                    let foundSlots = result.foundSlots || [];
                    foundSlots = foundSlots.concat(slots.map(slot => ({
                        centre,
                        date: slot.date,
                        time: slot.time,
                        foundAt: new Date().toLocaleString()
                    })));
                    chrome.storage.local.set({ foundSlots });
                });
            }
        } catch (error) {
            sendMessageToPopup({
                action: 'newLog',
                message: `Error checking ${centre}: ${error.message}`,
                type: 'error'
            });
        }
    }
}

async function scrapeTestCentreSlots(centre, refNumber, checkCode, dateRange) {
    // IMPORTANT: This is a placeholder implementation
    // The actual implementation needs to:
    // 1. Access the GOV.UK booking system (https://www.gov.uk/book-your-driving-test)
    // 2. Log in with DVLA credentials
    // 3. Check available slots for the specified test centre and date range
    // 4. Parse the HTML/JSON response to extract slot information
    
    // Example structure (adapt to actual gov.uk API/website structure):
    /*
    const response = await fetch('https://www.gov.uk/api/slots', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            reference: refNumber,
            checkCode: checkCode,
            testCentre: centre,
            dateRange: dateRange
        })
    });
    
    const data = await response.json();
    return data.availableSlots || [];
    */
    
    // For now, return empty array
    return [];
}

function sendMessageToPopup(message) {
    chrome.runtime.sendMessage(message).catch(() => {
        // Popup might not be open, that's okay
    });
}

// Cleanup on extension unload
chrome.runtime.onSuspend.addListener(() => {
    if (monitoringActive) {
        stopMonitoring();
    }
});
