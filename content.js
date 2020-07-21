FB_CLASS_MESSAGE_SPAN = "_5yl5"
MARKED_LINK_ATTRIBUTE = "VLIEGTUIG_MARKED"
POPOVER_ID = "VLIEGTUIG_POPOVER"
POPOVER_CONTENT_ID = "VLIEGTUIG_POPOVER_CONTENT"
POPOVER_CLOSE_BUTTON_ID = "VLIEGTUIG_POPOVER_CLOSE_BUTTON"

getConversationTexts = function(parent) {
    if (parent.querySelectorAll == undefined) {
        // not an html node (probably text)
        return []
    } else {
        return parent.querySelectorAll(`.${FB_CLASS_MESSAGE_SPAN} > span`)        
    }
}

getConversationLinks = function(parent) {
    if (parent.querySelectorAll == undefined) {
        // not an html node (probably text)
        return []
    } else {
        return parent.querySelectorAll(`.${FB_CLASS_MESSAGE_SPAN} > span > a`)
    }
}

getUnmarkedConversationLinksAndMark = function(parent) {
    var linkElements = getConversationLinks(parent);
    var unmarkedElements = Array.prototype.filter.call(linkElements, e => e.getAttribute(MARKED_LINK_ATTRIBUTE) == null);
    unmarkedElements.forEach(e => e.setAttribute(MARKED_LINK_ATTRIBUTE, true));
    return unmarkedElements;
}

popoverPinned = false;
showPopoverUntilClosed = function() {
    getPopoverElement().style.display = "block";
    popoverPinned = true;
    document.getElementById(POPOVER_CLOSE_BUTTON_ID).innerText = "×";

}
hidePopover = function() {
    getPopoverElement().style.display = "none";
    popoverPinned = false;
    document.getElementById(POPOVER_CLOSE_BUTTON_ID).innerText = "";
}

hidePopoverTimer = null;
showPopoverWhileHoveringWithHalfSecondDelay = function() {
    if (hidePopoverTimer != null) {
        clearTimeout(hidePopoverTimer);
        hidePopoverTimer = null;
    }
    getPopoverElement().style.display = "block";
}
hidePopoverAfterHalfSecond = function() {
    if (!popoverPinned) {
        hidePopoverTimer = setTimeout(function() {
            getPopoverElement().style.display = "none";
            hidePopoverTimer = null;
        }, 500);
    }    
}

markLinks = function(parent) {
    iconImg = chrome.runtime.getURL('images/check-t.png');
    getUnmarkedConversationLinksAndMark(parent).forEach(a => {
        var elem = document.createElement("img");
        elem.setAttribute("src", iconImg);
        elem.setAttribute("height", "24");
        elem.setAttribute("width", "24");
        elem.setAttribute("alt", "Flower");
        elem.onclick = showPopoverUntilClosed;
        elem.onmouseenter = showPopoverWhileHoveringWithHalfSecondDelay;
        elem.onmouseleave = hidePopoverAfterHalfSecond;
        // TODO: placement needs some tweaking
        a.parentElement.appendChild(elem);
        console.log("added icon to " + a.href);
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
            popover_content.onmouseenter = showPopoverWhileHoveringWithHalfSecondDelay;
            popover_content.onmouseleave = hidePopoverAfterHalfSecond;
                closebutton = document.createElement("span");
                closebutton.setAttribute("class", "vliegtuig-close");
                closebutton.setAttribute("id", POPOVER_CLOSE_BUTTON_ID);
                closebutton.onclick = function() {
                    hidePopover();
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

// Listener to communicate with extension popup
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == "getTexts") {
        sendResponse(Array.prototype.map.call(getConversationTexts(document)), x => x.innerText);
    } else if (request.action == "getLinks") {
        sendResponse(Array.prototype.map.call(getConversationLinks(document), x => x.href));
    } else if (request.action == "markLinks") {
        markLinks(document);
    } else {
        sendResponse({}); // Send nothing..
    }
});

// Observer to monitor DOM changes and add our icon to any links found in conversations
let domObserver = new MutationObserver(mutations => {
    for(let mutation of mutations) {
        for(let addedNode of mutation.addedNodes) {
            markLinks(addedNode);
        }
    }
});
domObserver.observe(document, { childList: true, subtree: true });