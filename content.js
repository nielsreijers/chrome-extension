FB_CLASS_MESSAGE_SPAN = "_5yl5"
MARKED_LINK_ATTRIBUTE = "VLIEGTUIG_MARKED"
POPOVER_ID = "VLIEGTUIG_POPOVER"
POPOVER_CONTENT_ID = "VLIEGTUIG_POPOVER_CONTENT"

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
        elem.onclick = function() {
            getPopoverElement().style.display = "block"
        }
        a.parentElement.appendChild(elem);
    });
}

getPopoverElement = function() {
    var popover = document.getElementById(POPOVER_ID);
    if (popover == null) {
        popover = document.createElement("div");
        popover.setAttribute("id", POPOVER_ID)
        popover.setAttribute("class", "vliegtuig-modal");
            popover_content = document.createElement("div");
            popover_content.setAttribute("class", "vliegtuig-modal-content");
            popover_content.setAttribute("id", POPOVER_CONTENT_ID);
                closebutton = document.createElement("span");
                closebutton.innerText = "×";
                closebutton.setAttribute("class", "vliegtuig-close");
                closebutton.onclick = function() {
                      popover.style.display = "none";
                }
                p = document.createElement("p");
                p.innerText = "Some text in the popover..";
                popover_content.prepend(p);
                popover_content.prepend(closebutton);
            popover.prepend(popover_content);
        document.body.prepend(popover);
    }
    return popover;
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

