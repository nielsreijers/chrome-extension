FB_CLASS_MESSAGE_SPAN = "_5yl5"
MARKED_LINK_ATTRIBUTE = "VLIEGTUIG"

getConversationTexts = function() {
    return document.querySelectorAll(`.${FB_CLASS_MESSAGE_SPAN} > span`)
}

getConversationLinks = function() {
    return document.querySelectorAll(`.${FB_CLASS_MESSAGE_SPAN} > span > a`)
}

getUnmarkedConversationLinksAndMark = function() {
    var linkElements = getConversationLinks();
    var unmarkedElements = Array.prototype.filter.call(linkElements, e => e.getAttribute(MARKED_LINK_ATTRIBUTE) == null);
    unmarkedElements.forEach(e => e.setAttribute(MARKED_LINK_ATTRIBUTE, true));
    return unmarkedElements;
}

markLinks = function () {
    iconImg = chrome.runtime.getURL('images/check-t.png');
    getUnmarkedConversationLinksAndMark().forEach(a => {
        var elem = document.createElement("img");
        elem.setAttribute("src", iconImg);
        elem.setAttribute("height", "24");
        elem.setAttribute("width", "24");
        elem.setAttribute("alt", "Flower");
        a.parentElement.appendChild(elem);
    });
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == "getTexts") {
        sendResponse(Array.prototype.map.call(getConversationTexts()), x => x.innerText);
    } else if (request.action == "getLinks") {
        sendResponse(Array.prototype.map.call(getConversationLinks(), x => x.href));
    } else if (request.action == "markLinks") {
        markLinks();
    } else {
        sendResponse({}); // Send nothing..
    }
});
