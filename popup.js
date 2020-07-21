addTextsList = function(parent, list) {
    parent.innerHTML = "";
    ul = document.createElement("ul");
    parent.appendChild(ul);

    list.forEach(t => {
        var li = document.createElement("li");
        var textnode = document.createTextNode(t);
        li.appendChild(textnode);
        ul.appendChild(li);
    });
}

document.getElementById('scanButton').onclick = function(element) {
    chrome.tabs.getSelected(null, function(tab) {
        textsDiv = document.getElementById('textsList');
        linksDiv = document.getElementById('linksList');

        // Send a request to the content script.
        chrome.tabs.sendMessage(tab.id, {action: "getTexts"}, null, function(response) {
            addTextsList(textsDiv, response);
        });
        chrome.tabs.sendMessage(tab.id, {action: "getLinks"}, null, function(response) {
            addTextsList(linksDiv, response);
        });
    });
};

document.getElementById('markButton').onclick = function(element) {
    chrome.tabs.getSelected(null, function(tab) {

        // Send a request to the content script.
        chrome.tabs.sendMessage(tab.id, {action: "markLinks"}, null, function(response) {
        });
    });
}

