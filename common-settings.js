var _settings;

let SETTING_EVALUATOR = "evaluator"
let SETTING_DEBUG = "debug"

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
    if (_settings.hasOwnProperty(settingName)) {
        return _settings[settingName];
    }
    return null;
}

function setSetting(settingName, value) {
    _settings[settingName] = value;
    _saveSettings();
}

// Fill in defaults if some settings have not been set yet.
function _defaultSettingsWhereEmpty(s) {
    widgetIcons.forEach(icon => {
        if (!s.hasOwnProperty(icon.settingName)) {
            s[icon.settingName] = true;
        }        
    });
    if (!s.hasOwnProperty(SETTING_EVALUATOR)) {
        s[SETTING_EVALUATOR] = 'newsguard';
    }
    if (!s.hasOwnProperty(SETTING_DEBUG)) {
        s[SETTING_DEBUG] = false;
    }
    return s;
}

function _saveSettings() {
    chrome.storage.sync.set({ VLIEGTUIG_SETTINGS: _settings });
}

function isSettingsKey(key) {
    return key == 'VLIEGTUIG_SETTINGS';
}

function isDebugMode() {
    return getSetting(SETTING_DEBUG);
}


// ----------------- Initialisation -----------------
reloadSettings();
