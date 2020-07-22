FB_CLASS_MESSAGE_SPAN = "_5yl5"
MARKED_LINK_ATTRIBUTE = "VLIEGTUIG_MARKED"
POPOVER_ID = "VLIEGTUIG_POPOVER"
POPOVER_CONTENT_ID = "VLIEGTUIG_POPOVER_CONTENT"
POPOVER_CLOSE_BUTTON_ID = "VLIEGTUIG_POPOVER_CLOSE_BUTTON"

let iconImg = chrome.runtime.getURL('images/check-t.png');
let iconImgGreen = chrome.runtime.getURL('images/check-t-green.png');
let iconImgRed = chrome.runtime.getURL('images/check-t-red.png');
let iconImgQuestionmark = chrome.runtime.getURL('images/check-t-questionmark.png');
let iconImgGrey = chrome.runtime.getURL('images/check-t-grey.png');
let iconImgEmpty = chrome.runtime.getURL('images/check-t-empty.png');



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
            popover_outer_content.setAttribute("class", "vliegtuig-modal-container");
            popover_outer_content.onmouseenter = handle_icon_mouseenter_content;
            popover_outer_content.onmouseleave = handle_icon_mouseleave_content;
                let closebutton = document.createElement("span");
                closebutton.setAttribute("class", "vliegtuig-close");
                closebutton.setAttribute("id", POPOVER_CLOSE_BUTTON_ID);
                closebutton.onclick = handle_close_clicked;
                popover_outer_content.prepend(closebutton);
                let popover_inner_content = document.createElement("div");
                popover_inner_content.setAttribute("id", POPOVER_CONTENT_ID);
                popover_inner_content.setAttribute("class", "vliegtuig-modal-content");
                popover_outer_content.prepend(popover_inner_content);
            popover.prepend(popover_outer_content);
        document.body.prepend(popover);
    }
    return popover;
}

function openPopover(url) {
    getPopoverElement().style.display = "block";
    setPopupContentForUrl(url);
}

function hidePopover() {
    getPopoverElement().style.display = "none";
}

var hidePopoverTimer = null;
function startHidePopoverTimer() {
    hidePopoverTimer = setTimeout(function() {
        hidePopover();
        hidePopoverTimer = null;
    }, 500);
}

function stopHidePopoverTimer() {
    if (hidePopoverTimer != null) {
        clearTimeout(hidePopoverTimer);
        hidePopoverTimer = null;
    }    
}

var popoverPinned = false;
function handle_icon_mouseenter_icon(url) {
    if (!popoverPinned) {
        stopHidePopoverTimer();
        openPopover(url);
    }
}

function handle_icon_clicked(url) {
    popoverPinned = true;
    document.getElementById(POPOVER_CLOSE_BUTTON_ID).innerText = "×";
}

function handle_icon_mouseleave_icon() {
    if (!popoverPinned) {
        startHidePopoverTimer();
    }    
}

function handle_icon_mouseenter_content() {
    if (!popoverPinned) {
        if (hidePopoverTimer != null) {
            clearTimeout(hidePopoverTimer);
            hidePopoverTimer = null;
        }
    }
}

function handle_icon_mouseleave_content() {
    if (!popoverPinned) {
        startHidePopoverTimer();
    }    
}

function handle_close_clicked() {
    hidePopover();
    popoverPinned = false;
    document.getElementById(POPOVER_CLOSE_BUTTON_ID).innerText = "";
}



// ----------------- Add our icon before links -----------------
function markLink(link) {
    let url = link.innerText;
    let elem = document.createElement("img");
    elem.setAttribute("src", iconImg);
    elem.setAttribute("height", "24");
    elem.setAttribute("width", "24");
    elem.setAttribute("alt", "check");
    elem.onclick = () => handle_icon_clicked(url);
    elem.onmouseenter = () => handle_icon_mouseenter_icon(url);
    elem.onmouseleave = () => handle_icon_mouseleave_icon();
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
    contentDiv.innerText = "";
    contentDiv.appendChild(getContentDiv(iconImgEmpty, "loading", `loading ${url}....`));
    
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
         // popupContentPerUrl[url] = new Promise(resolve => {
         //     let content = document.createElement("div");
         //     content.innerText = `NewsGuard data for ${url} goes here...`;
         //     sleep(debug_delay).then(() => resolve(content));
         //     debug_delay /= 2;
         // });
         popupContentPerUrl[url] = getNewsGuardData(url).then(data => newsGuardDataToContent(data, url));
    }
    return popupContentPerUrl[url];
}


function newsGuardDataToContent(data, url) {
    if (data.rank == null) {
        return getContentDiv(iconImgQuestionmark, "not found",
                             `${url} is not in NewsGuard's database.`);
    } else if (data.rank == 'P' && data.score == 0) {
        return getContentDiv(iconImgGrey, "not rated",
                             `${data.identifier} is in NewsGuard's database, but does not get a score since it publishes content from its users that it does not vet.`);
    } else if (data.rank == 'T') {
        return getContentDiv(iconImgGreen, "safe",
                             `${data.identifier} gets a score of ${data.score} in NewsGuard's database. It should be safe.`);
    } else if (data.rank == 'N') {
        return getContentDiv(iconImgRed, "unsafe",
                             `${data.identifier} gets a score of ${data.score} in NewsGuard's database. Proceed with caution.`);
    } else {
        return getContentDiv(iconImgQuestionmark, "unsure",
                             `${data.identifier} gets rank ${data.rank} and a score of ${data.score} in NewsGuard's database.`);
    }
}


function getContentDiv(image, alt, text) {
    let content = document.createElement("div");

    let img = document.createElement("img");
    img.setAttribute("src", image);
    img.setAttribute("alt", alt);
    content.appendChild(img);

    let span = document.createElement("span");
    span.innerText = text;
    content.appendChild(span);

    return content;
}


// ----------------- Get data from Newsguard -----------------
function getNewsGuardData(url) {
    return fetch(`https://api.newsguardtech.com/check?url=${encodeURIComponent(url)}`).then(r => r.json());
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
