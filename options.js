function _addInput(imgSrc, settingName, txt) {
    let iconsDiv = document.getElementById('VLIEGTUIG_SETTINGS_ICONS_TO_ADD');

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
    iconsDiv.append(div);
}

function handleEvaluatorClick(e) {
    for (var e of document.getElementsByName("evaluator")) {
        if (e.checked == true) {
            setSetting(SETTING_EVALUATOR, e.value);
        }
    }
}

loadSettings().then(() => {
    _addInput(iconGreen.url, iconGreen.settingName, ': content rated as safe');
    _addInput(iconOpinion.url, iconOpinion.settingName, ': content rated as containing a personal perspective');
    _addInput(iconRed.url, iconRed.settingName, ': content rated as potentially unsafe');
    _addInput(iconUnknown.url, iconUnknown.settingName, ': content for which no information is available');
    _addInput(iconNotRated.url, iconNotRated.settingName, ': content that is known but not (yet) rated');
    _addInput(iconError.url, iconError.settingName, ': shown when an error occurs');
    _addInput(iconLoading.url, iconLoading.settingName, ': shown while loading');

    // Set currently selected evaluator
    for (var e of document.getElementsByName("evaluator")) {
        if (getSetting(SETTING_EVALUATOR) == e.value) {
            e.checked = true;
        }
        e.onclick = () => handleEvaluatorClick();
    }
});
