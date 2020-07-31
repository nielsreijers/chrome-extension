var settings;

function loadSettings() {
    return loadSettingsPromise;
}

var loadSettingsPromise;
function reloadSettings() {
    loadSettingsPromise = new Promise((resolve) => {
            chrome.storage.sync.get("VLIEGTUIG_SETTINGS", function(data) {
                console.log("sync.get callback")
                console.log(data.VLIEGTUIG_SETTINGS)
                settings = data.VLIEGTUIG_SETTINGS;
                if (settings == undefined || settings.__proto__ != {}.__proto__) {
                    settings = {}
                }
                settings = defaultSettingsWhereEmpty(settings);
                console.log(settings)
                console.log("sync.get callback done")
                resolve(settings);
        });
    });    
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
    chrome.storage.sync.set({ VLIEGTUIG_SETTINGS: settings });
}


// ----------------- Initialisation -----------------
reloadSettings();
