var _settings;

let SETTING_EVALUATOR = "evaluator"
let SETTING_DEBUG = "debug"

let SETTING_CHECK_POST_CONTENT = "check_post_content";
let SETTING_CHECK_MESSAGE_CONTENT = "check_message_content";

let SETTING_HASH_SALT = "hash_salt";

const contentToCheck = {
    NONE: 'none',
    URLS_ONLY: 'urlsOnly',
    URLS_AND_TEXT: 'urlsAndText'
}

const evaluator = {
    NEWSGUARD: 'newsguard',
    COFACTS: 'cofacts'
}

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
        s[SETTING_EVALUATOR] = evaluator.NEWSGUARD;
    }
    if (!s.hasOwnProperty(SETTING_DEBUG)) {
        s[SETTING_DEBUG] = false;
    }
    if (!s.hasOwnProperty(SETTING_CHECK_POST_CONTENT)) {
        s[SETTING_CHECK_POST_CONTENT] = contentToCheck.URLS_AND_TEXT;
    }
    if (!s.hasOwnProperty(SETTING_CHECK_MESSAGE_CONTENT)) {
        s[SETTING_CHECK_MESSAGE_CONTENT] = contentToCheck.URLS_ONLY;
    }
    if (!s.hasOwnProperty(SETTING_HASH_SALT)) {
        s[SETTING_HASH_SALT] = Math.random().toString();
    }

    return s;
}

function _resetDefaultSettings() {
    _settings=_defaultSettingsWhereEmpty({})
    _saveSettings()
}

function checkPostUrls() {
    return getSetting(SETTING_CHECK_POST_CONTENT) != contentToCheck.NONE;
}
function checkPostText() {
    return getSetting(SETTING_CHECK_POST_CONTENT) == contentToCheck.URLS_AND_TEXT;
}
function checkMessageUrls() {
    return getSetting(SETTING_CHECK_MESSAGE_CONTENT) != contentToCheck.NONE;
}
function checkMessageText() {
    return getSetting(SETTING_CHECK_MESSAGE_CONTENT) == contentToCheck.URLS_AND_TEXT;
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
