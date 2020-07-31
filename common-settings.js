var __settings;

function loadSettings() {
    return loadSettingsPromise;
}

var loadSettingsPromise;
function reloadSettings() {
    loadSettingsPromise = new Promise((resolve) => {
            chrome.storage.sync.get("VLIEGTUIG_SETTINGS", function(data) {
                __settings = data.VLIEGTUIG_SETTINGS;
                if (__settings == undefined || __settings.__proto__ != {}.__proto__) {
                    __settings = {}
                }
                __settings = defaultSettingsWhereEmpty(__settings);
                resolve();
        });
    });
    return loadSettingsPromise;
}

function getSetting(settingName) {
    return __settings[settingName];
}

function setSetting(settingName, value) {
    __settings[settingName] = value;
    saveSettings();
}

// Fill in defaults if some settings have not been set yet.
function defaultSettingsWhereEmpty(s) {
    if (!s.hasOwnProperty('show-icon-empty')) {
        s['show-icon-empty'] = true;
    }
    if (!s.hasOwnProperty('show-icon-green')) {
        s['show-icon-green'] = true;
    }
    if (!s.hasOwnProperty('show-icon-red')) {
        s['show-icon-red'] = true;
    }
    if (!s.hasOwnProperty('show-icon-grey')) {
        s['show-icon-grey'] = true;
    }
    if (!s.hasOwnProperty('show-icon-questionmark')) {
        s['show-icon-questionmark'] = true;
    }
    return s;
}

function saveSettings() {
    chrome.storage.sync.set({ VLIEGTUIG_SETTINGS: __settings });
}

function isSettingsKey(key) {
    return key == 'VLIEGTUIG_SETTINGS';
}


// ----------------- Initialisation -----------------
reloadSettings();
