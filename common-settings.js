var _settings;

function loadSettings() {
    return _loadSettingsPromise;
}

var _loadSettingsPromise;
function reloadSettings() {
    _loadSettingsPromise = new Promise((resolve) => {
            chrome.storage.sync.get("VLIEGTUIG_SETTINGS", function(data) {
                _settings = data.VLIEGTUIG_SETTINGS;
                if (_settings == undefined || _settings.__proto__ != {}.__proto__) {
                    _settings = {}
                }
                _settings = _defaultSettingsWhereEmpty(_settings);
                resolve();
        });
    });
    return _loadSettingsPromise;
}

function getSetting(settingName) {
    return _settings[settingName];
}

function setSetting(settingName, value) {
    _settings[settingName] = value;
    _saveSettings();
}

// Fill in defaults if some settings have not been set yet.
function _defaultSettingsWhereEmpty(s) {
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

function _saveSettings() {
    chrome.storage.sync.set({ VLIEGTUIG_SETTINGS: _settings });
}

function isSettingsKey(key) {
    return key == 'VLIEGTUIG_SETTINGS';
}


// ----------------- Initialisation -----------------
reloadSettings();
