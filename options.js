function addInput(imgSrc, settingName, txt) {
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

loadSettings().then(() => {
    addInput(iconGreen.url, iconGreen.settingName, ': links rated as safe');
    addInput(iconRed.url, iconRed.settingName, ': links rated as potentially unsafe');
    addInput(iconQuestionmark.url, iconQuestionmark.settingName, ': links for which no information is available');
    addInput(iconGrey.url, iconGrey.settingName, ': links that are not rated because it publishes content from its users that it does not vet');
    addInput(iconEmpty.url, iconEmpty.settingName, ': shown while the rating is being determined');
});
