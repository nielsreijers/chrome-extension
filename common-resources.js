let iconGreen = {
    url: chrome.runtime.getURL('images/check-t-green.png'),
    cssClass: 'vliegtuig-icon-green',
    settingName: 'show-icon-green',
    settingDefault: true
};
let iconOpinion = {
    url: chrome.runtime.getURL('images/check-t-opinion.png'),
    cssClass: 'vliegtuig-icon-opinion',
    settingName: 'show-icon-opinion',
    settingDefault: true
};
let iconRed = {
    url: chrome.runtime.getURL('images/check-t-red.png'),
    cssClass: 'vliegtuig-icon-red',
    settingName: 'show-icon-red',
    settingDefault: true
};
let iconNotRated = {
    url: chrome.runtime.getURL('images/check-t-notrated.png'),
    cssClass: 'vliegtuig-icon-notrated',
    settingName: 'show-icon-notrated',
    settingDefault: true
};
let iconUnknown = {
    url: chrome.runtime.getURL('images/check-t-unknown.png'),
    cssClass: 'vliegtuig-icon-unknown',
    settingName: 'show-icon-unknown',
    settingDefault: false
};
let iconLoading = {
    url: chrome.runtime.getURL('images/check-t-loading.gif'),
    cssClass: 'vliegtuig-icon-loading',
    settingName: 'show-icon-loading',
    settingDefault: false
};
let iconError = {
    url: chrome.runtime.getURL('images/check-t-error.svg'),
    cssClass: 'vliegtuig-icon-error',
    settingName: 'show-icon-error',
    settingDefault: true
};

widgetIcons = [iconGreen, iconOpinion, iconRed, iconNotRated, iconUnknown, iconLoading, iconError]

// These are just here to test sending images.
// Should use some more informative graphic in the final version.
let URL_WARNINGSIGN_IMAGE = chrome.runtime.getURL('images/red-warning.jpg');
let URL_OK_IMAGE = chrome.runtime.getURL('images/green-check-mark.jpg');
let URL_QUESTIONMARK_IMAGE = chrome.runtime.getURL('images/big-questionmark.png');
