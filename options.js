function _addIconCheckbox(imgSrc, settingName, txt) {
    let parentDiv = document.getElementById('VLIEGTUIG_SETTINGS_ICONS_TO_ADD');

    let div = document.createElement("div");

    let checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("class", "vliegtuig-checkbox");
    checkbox.checked = getSetting(settingName);
    checkbox.onchange = () => {
        setSetting(settingName, checkbox.checked);
    };

    let icon = document.createElement("img");
    icon.setAttribute("src", imgSrc);
    icon.setAttribute("width", 16);
    icon.setAttribute("height", 16);

    let span = document.createElement("span");
    span.innerText = txt;

    div.append(checkbox, icon, span);
    parentDiv.append(div);
}

function _addContentToCheckCombobox(settingName, txt) {
    let parentDiv = document.getElementById('VLIEGTUIG_SETTINGS_CONTENT_TO_CHECK');

    let div = document.createElement("div");

    let span = document.createElement("span");
    span.classList.add("w3-quarter");
    span.innerText = txt;

    let select = document.createElement("select");

    addOption = (optionValue, optionText) => {
        let option = document.createElement("option");
        option.setAttribute("value", optionValue);
        option.innerText = optionText;
        select.append(option);
    }
    addOption(contentToCheck.NONE, "None");
    addOption(contentToCheck.URLS_ONLY, "Links only");
    addOption(contentToCheck.URLS_AND_TEXT, settingName == SETTING_CHECK_POST_CONTENT ? "Links and post text" : "Links and message text");

    select.value = getSetting(settingName);
    select.onchange = () => {
        setSetting(settingName, select.value);
    };

    div.append(span, select);
    parentDiv.append(div);
}

function handleEvaluatorClick(e) {
    for (var e of document.getElementsByName("evaluator")) {
        if (e.checked == true) {
            setSetting(SETTING_EVALUATOR, e.value);
        }
    }
}

loadSettings().then(() => {
    _addIconCheckbox(iconGreen.url, iconGreen.settingName, ': content rated as safe');
    _addIconCheckbox(iconOpinion.url, iconOpinion.settingName, ': content rated as containing a personal perspective');
    _addIconCheckbox(iconRed.url, iconRed.settingName, ': content rated as potentially unsafe');
    _addIconCheckbox(iconNotRated.url, iconNotRated.settingName, ': content that is known in NewsGuard or Cofacts, but not (yet) rated');
    _addIconCheckbox(iconUnknown.url, iconUnknown.settingName, ': content for which no match was found');
    _addIconCheckbox(iconLoading.url, iconLoading.settingName, ': shown while loading');
    _addIconCheckbox(iconError.url, iconError.settingName, ': shown when an error occurs');

    _addContentToCheckCombobox(SETTING_CHECK_MESSAGE_CONTENT, 'Messages:');
    _addContentToCheckCombobox(SETTING_CHECK_POST_CONTENT, 'Facebook posts:');


    // Set currently selected evaluator
    for (var e of document.getElementsByName("evaluator")) {
        if (getSetting(SETTING_EVALUATOR) == e.value) {
            e.checked = true;
        }
        e.onclick = () => handleEvaluatorClick();
    }
});
