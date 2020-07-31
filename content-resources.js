let iconGreen = {
    url: chrome.runtime.getURL('images/check-t-green.png'),
    cssClass: 'vliegtuig-icon-green',
    settingName: 'show-icon-green'
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

icons = [iconGreen, iconRed, iconQuestionmark, iconGrey, iconEmpty]

let URL_WARNINGSIGN_IMAGE = chrome.runtime.getURL('images/red-warning.jpg');
let URL_OK_IMAGE = chrome.runtime.getURL('images/green-check-mark.jpg');
let URL_QUESTIONMARK_IMAGE = chrome.runtime.getURL('images/big-questionmark.png');
