let iconGreen = {
    url: chrome.runtime.getURL('images/check-t-green.png'),
    cssClass: 'vliegtuig-icon-green',
    settingName: 'show-icon-green'
};
let iconOpinion = {
    url: chrome.runtime.getURL('images/check-t-opinion.png'),
    cssClass: 'vliegtuig-icon-opinion',
    settingName: 'show-icon-opinion'
};
let iconRed = {
    url: chrome.runtime.getURL('images/check-t-red.png'),
    cssClass: 'vliegtuig-icon-red',
    settingName: 'show-icon-red'
};
let iconQuestionmark = {
    url: chrome.runtime.getURL('images/check-t-questionmark.png'),
    cssClass: 'vliegtuig-icon-questionmark',
    settingName: 'show-icon-questionmark'
};
let iconGrey = {
    url: chrome.runtime.getURL('images/check-t-grey.png'),
    cssClass: 'vliegtuig-icon-grey',
    settingName: 'show-icon-grey'
};
let iconEmpty = {
    url: chrome.runtime.getURL('images/check-t-empty.png'),
    cssClass: 'vliegtuig-icon-empty',
    settingName: 'show-icon-empty'
};
let iconError = {
    url: chrome.runtime.getURL('images/check-t-error.svg'),
    cssClass: 'vliegtuig-icon-error',
    settingName: 'show-icon-error'
};
widgetIcons = [iconGreen, iconOpinion, iconRed, iconQuestionmark, iconGrey, iconEmpty, iconError]

// These are just here to test sending images.
// Should use some more informative graphic in the final version.
let URL_WARNINGSIGN_IMAGE = chrome.runtime.getURL('images/red-warning.jpg');
let URL_OK_IMAGE = chrome.runtime.getURL('images/green-check-mark.jpg');
let URL_QUESTIONMARK_IMAGE = chrome.runtime.getURL('images/big-questionmark.png');
