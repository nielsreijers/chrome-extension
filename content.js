FB_CLASS_MESSAGE_SPAN = "_5yl5"
MARKED_LINK_ATTRIBUTE = "VLIEGTUIG_MARKED"
POPOVER_ID = "VLIEGTUIG_POPOVER"
POPOVER_CONTENT_ID = "VLIEGTUIG_POPOVER_CONTENT"
POPOVER_CLOSE_BUTTON_ID = "VLIEGTUIG_POPOVER_CLOSE_BUTTON"



// ----------------- debug stuff -----------------
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

// // Usage!
// sleep(500).then(() => {
//     // Do something after the sleep!
// });



// ----------------- get texts and links from conversations found in (a subtree of) the DOM -----------------
function getConversationTexts(parent) {
    if (parent.querySelectorAll == undefined) {
        // not an html node (probably text)
        return []
    } else {
        return parent.querySelectorAll(`.${FB_CLASS_MESSAGE_SPAN} > span`)        
    }
}

function getConversationLinks(parent) {
    if (parent.querySelectorAll == undefined) {
        // not an html node (probably text)
        return []
    } else {
        return parent.querySelectorAll(`.${FB_CLASS_MESSAGE_SPAN} > span > a`)
    }
}

function getUnmarkedConversationLinksAndMark(parent) {
    let linkElements = getConversationLinks(parent);
    let unmarkedElements = Array.prototype.filter.call(linkElements, e => e.getAttribute(MARKED_LINK_ATTRIBUTE) == null);
    unmarkedElements.forEach(e => e.setAttribute(MARKED_LINK_ATTRIBUTE, true));
    return unmarkedElements;
}



// ----------------- Manage popover -----------------
function getPopoverElement() {
    var popover = document.getElementById(POPOVER_ID);
    if (popover == null) {
        popover = document.createElement("div");
        popover.setAttribute("id", POPOVER_ID)
        popover.setAttribute("class", "vliegtuig-modal");
            let popover_outer_content = document.createElement("div");
            popover_outer_content.setAttribute("class", "vliegtuig-modal-content");
            popover_outer_content.onmouseenter = handle_icon_mouseenter;
            popover_outer_content.onmouseleave = handle_icon_mouseleave;
                let closebutton = document.createElement("span");
                closebutton.setAttribute("class", "vliegtuig-close");
                closebutton.setAttribute("id", POPOVER_CLOSE_BUTTON_ID);
                closebutton.onclick = handle_close_clicked;
                let popover_inner_content = document.createElement("div");
                popover_inner_content.setAttribute("id", POPOVER_CONTENT_ID);
                popover_outer_content.prepend(popover_inner_content);
                popover_outer_content.prepend(closebutton);
            popover.prepend(popover_outer_content);
        document.body.prepend(popover);
    }
    return popover;
}

function openPopup(url) {
    getPopoverElement().style.display = "block";
    setPopupContentForUrl(url);
}

function hidePopup() {
    getPopoverElement().style.display = "none";
}

function handle_icon_mouseenter(url) {
    if (!popoverPinned) {
        if (hidePopoverTimer != null) {
            clearTimeout(hidePopoverTimer);
            hidePopoverTimer = null;
        }
        openPopup(url);
    }
}

var popoverPinned = false;
function handle_icon_clicked(url) {
    popoverPinned = true;
    document.getElementById(POPOVER_CLOSE_BUTTON_ID).innerText = "×";
}

var hidePopoverTimer = null;
function handle_icon_mouseleave() {
    if (!popoverPinned) {
        hidePopoverTimer = setTimeout(function() {
            getPopoverElement().style.display = "none";
            hidePopoverTimer = null;
        }, 500);
    }    
}

function handle_close_clicked() {
    hidePopup();
    popoverPinned = false;
    document.getElementById(POPOVER_CLOSE_BUTTON_ID).innerText = "";
}



// ----------------- Add our icon before links -----------------
let iconImg = chrome.runtime.getURL('images/check-t.png');
function markLink(link) {
    let url = link.innerText;
    let elem = document.createElement("img");
    elem.setAttribute("src", iconImg);
    elem.setAttribute("height", "24");
    elem.setAttribute("width", "24");
    elem.setAttribute("alt", "check");
    elem.onclick = () => handle_icon_clicked(url);
    elem.onmouseenter = () => handle_icon_mouseenter(url);
    elem.onmouseleave = () => handle_icon_mouseleave();
    // TODO: placement needs some tweaking
    link.parentElement.appendChild(elem);
    console.log("added icon to " + url);
}

function markLinks(parent) {
    getUnmarkedConversationLinksAndMark(parent).forEach(markLink);
}

// Observer to monitor DOM changes and add our icon to any links found in conversations
let domObserver = new MutationObserver(mutations => {
    for(let mutation of mutations) {
        for(let addedNode of mutation.addedNodes) {
            markLinks(addedNode);
        }
    }
});
domObserver.observe(document, { childList: true, subtree: true });



// ----------------- Put content in popup -----------------
var current_url = ""
function setPopupContentForUrl(url) {
    if (current_url == url) {
        // already set for this URL. skipping.
        return;
    }

    current_url = url;
    let contentDiv = document.getElementById(POPOVER_CONTENT_ID);
    contentDiv.innerText = "loading " + url;
    getContentPromiseForURL(url).then(content => {
        if (current_url == url) {
            // Only set the content if this is still the URL we want to show the data for.
            contentDiv.innerText = "";
            contentDiv.appendChild(content);
        }
    });
}


// ----------------- Get popup content -----------------
var popupContentPerUrl = {}
var debug_delay = 4000 // to test if we show the right content if it takes a while to fetch data from NewsGuard and the user points at a different link in the meantime
function getContentPromiseForURL(url) {
    if (popupContentPerUrl[url] == undefined) {
         popupContentPerUrl[url] = new Promise(resolve => {
             let content = document.createElement("div");
             content.innerText = `NewsGuard data for ${url} goes here...`;
             sleep(debug_delay).then(() => resolve(content));
             debug_delay /= 2;
         });
    }
    return popupContentPerUrl[url];
}



// ----------------- Listener to communicate with extension popup -----------------
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
