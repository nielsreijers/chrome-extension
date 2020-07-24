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
    return unmarkedElements.map(elementToLinkData);
}

function elementToLinkData(e) {
    var reply_to_type = null;
    var reply_to_id = findFacebookUserId(e);
    if (reply_to_id!=null) {
        reply_to_type='user';
    } else {
        reply_to_id = findFacebookGroupId(e);
        if (reply_to_id!=null) {
            reply_to_type='group';
        }
    }
    url = e.innerText;
    evaluationPromise = getURLEvaluationPromise(url);
    return {
        element:e,
        url:url,
        reply_to_type:reply_to_type,
        reply_to_id:reply_to_id,
        evaluationPromise:evaluationPromise
    };
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

function openPopover(linkdata) {
    getPopoverElement().style.display = "block";
    setPopupContentForUrl(linkdata);
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
function handle_icon_mouseenter_icon(linkdata) {
    if (!popoverPinned) {
        stopHidePopoverTimer();
        openPopover(linkdata);
    }
}

function handle_icon_clicked() {
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
function markLink(linkdata) {
    let elem = document.createElement("img");
    elem.setAttribute("src", iconImg);
    elem.setAttribute("height", "24");
    elem.setAttribute("width", "24");
    elem.setAttribute("alt", "check");
    elem.onclick = () => handle_icon_clicked();
    elem.onmouseenter = () => handle_icon_mouseenter_icon(linkdata);
    elem.onmouseleave = () => handle_icon_mouseleave_icon();
    // TODO: placement needs some tweaking
    linkdata.element.appendChild(elem);
    console.log("added icon to " + linkdata.url);
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
function setPopupContentForUrl(linkdata) {
    if (current_url == linkdata.url) {
        // already set for this URL. skipping.
        return;
    }

    current_url = linkdata.url;
    let contentDiv = document.getElementById(POPOVER_CONTENT_ID);
    contentDiv.innerText = "";
    contentDiv.appendChild(getContentDiv(iconImgEmpty, "loading", `loading ${linkdata.url}....`));
    
    linkdata.evaluationPromise.then(evaluation => {
        if (current_url == linkdata.url) {
            // Only set the content if this is still the URL we want to show the data for.
            contentDiv.innerText = "";
            contentDiv.appendChild(getContentDiv(evaluation.icon, evaluation.alt, evaluation.text));
            contentDiv.appendChild(getSendReplyButton(linkdata));
        }
    });
}


// ----------------- Get popup content -----------------
var popupContentPerUrl = {}
var debug_delay = 4000 // to test if we show the right content if it takes a while to fetch data from NewsGuard and the user points at a different link in the meantime
function getURLEvaluationPromise(url) {
    if (popupContentPerUrl[url] == undefined) {
         // popupContentPerUrl[url] = new Promise(resolve => {
         //     let content = document.createElement("div");
         //     content.innerText = `NewsGuard data for ${url} goes here...`;
         //     sleep(debug_delay).then(() => resolve(content));
         //     debug_delay /= 2;
         // });
         popupContentPerUrl[url] = getNewsGuardDataPromise(url).then(data => newsGuardDataToEvaluation(data, url));
    }
    return popupContentPerUrl[url];
}

function newsGuardDataToEvaluation(data, url) {    
    if (data.rank == null) {
        return {
            icon:iconImgQuestionmark,
            alt:"not found",
            text:`${url} is not in NewsGuard's database.`
        };
    } else if (data.rank == 'P' && data.score == 0) {
        return {
            icon:iconImgGrey,
            alt:"not rated",
            text:`${data.identifier} is in NewsGuard's database, but does not get a score since it publishes content from its users that it does not vet.`
        };
    } else if (data.rank == 'T') {
        return {
            icon:iconImgGreen,
            alt:"safe",
            text:`${data.identifier} gets a score of ${data.score} in NewsGuard's database. It should be safe.`
        };
    } else if (data.rank == 'N') {
        return {
            icon:iconImgRed,
            alt:"unsafe",
            text:`${data.identifier} gets a score of ${data.score} in NewsGuard's database. Proceed with caution.`
        };
    } else {
        return {
            icon:iconImgQuestionmark,
            alt:"unsure",
            text:`${data.identifier} gets rank ${data.rank} and a score of ${data.score} in NewsGuard's database.`
        };
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

function getSendReplyButton(linkdata) {
    if (linkdata.reply_to_type == 'user') {
        b = document.createElement("button");
        b.innerText = "send reply to user with id " + linkdata.reply_to_id;
        b.onclick = () => {
            sendFbMessageToUser("reply to " + linkdata.url, linkdata.reply_to_id);
        };
        return b;
    } else if (linkdata.reply_to_type == 'group') {
        b = document.createElement("button");
        b.innerText = "send reply to group with id " + linkdata.reply_to_id;
        b.onclick = () => {
            sendFbMessageToGroup("reply to " + linkdata.url, linkdata.reply_to_id);
        };
        return b;
    } else {
        s = document.createElement("span");
        s.innerText = "user not found";
        return s;
    }
}

// ----------------- Get data from Newsguard -----------------
function getNewsGuardDataPromise(url) {
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





// ----------------- Sending Facebook messages -----------------
function sendFbMessage(params) {
    const http = new XMLHttpRequest();
    const url = 'https://mbasic.facebook.com/messages/send/';
    http.open("POST", url);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    http.withCredentials = true;
    // http.onreadystatechange = e => {
    //     console.log("VLIEGTUIG");
    //     console.log(e);
    //     console.log(http.responseText);
    // };
    // fb_dtsg is the token that identifies the current user.
    // There are usually 3 elements with a token found in the document, but they all seem to work.
    params['fb_dtsg'] = document.getElementsByName("fb_dtsg")[0].value;

    // convert object to list -- to enable .map
    let data = Object.entries(params);
    // encode every parameter (unpack list into 2 variables)
    data = data.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    // combine into string
    let b = data.join('&');

    http.send(b);
    return http;
}

function sendFbMessageToUser(message, friend_id) {
    let params = {}
    params['body'] = message;
    params[`ids[${friend_id}]`] = friend_id;
    sendFbMessage(params);
}
// var h = sendFbMessageToUser('zwarte pieten', 100001293926477);

function sendFbMessageToGroup(message, thread_id) {
    let params = {}
    params['body'] = message;
    params['tids'] = `cid.g.${thread_id}`;
    sendFbMessage(params);
}
// var h = sendFbMessageToGroup('zwarte pieten', 3217309048308227);

function findFantaTab(tabType, messageElement) {
    re = new RegExp(`fantaTabMain-${tabType}:([0-9]+)`);
    e = messageElement;
    while (e != null) {
        c = e.getAttribute("class");
        match = re.exec(c);
        if (match != null) {
            return match[1];
        }
        e = e.parentElement;
    }
    return null;    
}

function findFacebookUserId(messageElement) {
    return findFantaTab('user', messageElement);
}

function findFacebookGroupId(messageElement) {
    return findFantaTab('thread', messageElement);
}
