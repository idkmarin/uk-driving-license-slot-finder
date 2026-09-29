document.addEventListener('DOMContentLoaded', async () => {
    const refNumber = document.getElementById('refNumber');
    const checkCode = document.getElementById('checkCode');
    const testCentres = document.getElementById('testCentres');
    const dateRange = document.getElementById('dateRange');
    const refreshInterval = document.getElementById('refreshInterval');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const saveBtn = document.getElementById('saveBtn');
    const clearLogsBtn = document.getElementById('clearLogsBtn');
    const statusText = document.getElementById('statusText');
    const statusIndicator = document.getElementById('statusIndicator');
    const logContainer = document.getElementById('logContainer');
    const slotsContainer = document.getElementById('slotsContainer');

    // Load saved settings
    const settings = await chrome.storage.local.get(['settings', 'isMonitoring', 'logs', 'foundSlots']);
    if (settings.settings) {
        refNumber.value = settings.settings.refNumber || '';
        checkCode.value = settings.settings.checkCode || '';
        testCentres.value = settings.settings.testCentres || '';
        dateRange.value = settings.settings.dateRange || '30';
        refreshInterval.value = settings.settings.refreshInterval || '5';
    }

    // Update UI based on monitoring status
    updateMonitoringStatus(settings.isMonitoring || false);

    // Load logs and found slots
    if (settings.logs) {
        displayLogs(settings.logs);
    }
    if (settings.foundSlots) {
        displayFoundSlots(settings.foundSlots);
    }

    // Save settings
    saveBtn.addEventListener('click', async () => {
        const newSettings = {
            refNumber: refNumber.value,
            checkCode: checkCode.value,
            testCentres: testCentres.value,
            dateRange: parseInt(dateRange.value),
            refreshInterval: parseInt(refreshInterval.value)
        };
        await chrome.storage.local.set({ settings: newSettings });
        addLog('Settings saved', 'success');
    });

    // Start monitoring
    startBtn.addEventListener('click', async () => {
        if (!refNumber.value || !checkCode.value) {
            addLog('Please enter DVLA reference number and check code', 'error');
            return;
        }

        const newSettings = {
            refNumber: refNumber.value,
            checkCode: checkCode.value,
            testCentres: testCentres.value.split(',').map(c => c.trim()),
            dateRange: parseInt(dateRange.value),
            refreshInterval: parseInt(refreshInterval.value)
        };

        await chrome.storage.local.set({ 
            settings: newSettings,
            isMonitoring: true 
        });

        // Send message to background script to start monitoring
        chrome.runtime.sendMessage({ 
            action: 'startMonitoring',
            settings: newSettings
        }, (response) => {
            if (response.success) {
                addLog('Monitoring started', 'success');
                updateMonitoringStatus(true);
            }
        });
    });

    // Stop monitoring
    stopBtn.addEventListener('click', async () => {
        await chrome.storage.local.set({ isMonitoring: false });
        chrome.runtime.sendMessage({ action: 'stopMonitoring' }, (response) => {
            addLog('Monitoring stopped', 'info');
            updateMonitoringStatus(false);
        });
    });

    // Clear logs
    clearLogsBtn.addEventListener('click', async () => {
        await chrome.storage.local.set({ logs: [] });
        logContainer.innerHTML = '<p class="log-entry">Logs cleared</p>';
    });

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'updateStatus') {
            updateMonitoringStatus(request.isMonitoring);
            sendResponse({ received: true });
        }
        if (request.action === 'newLog') {
            addLog(request.message, request.type);
            sendResponse({ received: true });
        }
        if (request.action === 'slotFound') {
            displayFoundSlots([request.slot]);
            sendResponse({ received: true });
        }
    });

    function updateMonitoringStatus(isMonitoring) {
        if (isMonitoring) {
            statusText.textContent = '✓ Monitoring Active';
            statusIndicator.classList.remove('inactive');
            statusIndicator.classList.add('active');
            startBtn.disabled = true;
            stopBtn.disabled = false;
        } else {
            statusText.textContent = '✗ Not Monitoring';
            statusIndicator.classList.remove('active');
            statusIndicator.classList.add('inactive');
            startBtn.disabled = false;
            stopBtn.disabled = true;
        }
    }

    function addLog(message, type = 'info') {
        const entry = document.createElement('p');
        entry.className = `log-entry ${type}`;
        const timestamp = new Date().toLocaleTimeString();
        entry.textContent = `[${timestamp}] ${message}`;
        
        logContainer.insertBefore(entry, logContainer.firstChild);
        
        // Keep only last 50 logs
        while (logContainer.children.length > 50) {
            logContainer.removeChild(logContainer.lastChild);
        }

        // Save to storage
        chrome.storage.local.get(['logs'], (result) => {
            const logs = result.logs || [];
            logs.unshift({ message, type, timestamp });
            chrome.storage.local.set({ logs: logs.slice(0, 100) });
        });
    }

    function displayLogs(logs) {
        logContainer.innerHTML = '';
        logs.forEach(log => {
            const entry = document.createElement('p');
            entry.className = `log-entry ${log.type}`;
            entry.textContent = `[${log.timestamp}] ${log.message}`;
            logContainer.appendChild(entry);
        });
    }

    function displayFoundSlots(slots) {
        if (!slots || slots.length === 0) {
            slotsContainer.innerHTML = '<p>No slots found yet</p>';
            return;
        }

        slotsContainer.innerHTML = '';
        const uniqueSlots = [...new Set(slots.map(s => JSON.stringify(s)))].map(s => JSON.parse(s));
        
        uniqueSlots.forEach(slot => {
            const slotDiv = document.createElement('div');
            slotDiv.className = 'slot-item';
            slotDiv.innerHTML = `
                <strong>${slot.centre}</strong>
                <p><strong>Date:</strong> ${slot.date}</p>
                <p><strong>Time:</strong> ${slot.time || 'TBA'}</p>
                <p><strong>Found:</strong> ${slot.foundAt}</p>
            `;
            slotsContainer.appendChild(slotDiv);
        });
    }
});
