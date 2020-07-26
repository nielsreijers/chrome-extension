FB_QUERY_MESSAGE_SPAN = "._5yl5 > span";
FB_QUERY_MESSAGE_LINK = "._5yl5 > span > a";
FB_QUERY_MESSAGE_A_WITH_PICTURE_BOX = "._5rw4";
FB_QUERY_TO_APPEND_ICON_CHILD = "._2u_d";
FB_CLASS_TO_APPEND_ICON_PARENT = "_5wd4";

MARKED_LINK_ATTRIBUTE = "VLIEGTUIG_MARKED";
POPOVER_ID = "VLIEGTUIG_POPOVER";
POPOVER_CLOSE_BUTTON_ID = "VLIEGTUIG_POPOVER_CLOSE_BUTTON";
POPOVER_TITLE_ID = "VLIEGTUIG_POPOVER_TITLE";
POPOVER_EVAL_ICON_ID = "VLIEGTUIG_EVAL_ICON";
POPOVER_EVAL_TEXT_ID = "VLIEGTUIG_EVAL_TEXT";
POPOVER_SEND_REPLY_DIV_ID = "VLIEGTUIG_SEND_REPLY_DIV";
POPOVER_SEND_REPLY_TEXT_ID = "VLIEGTUIG_SEND_REPLY_TEXT";
POPOVER_SEND_REPLY_BUTTON_ID = "VLIEGTUIG_SEND_REPLY_BUTTON";
POPOVER_SEND_REPLY_CHECKBOX_ID = "VLIEGTUIG_SEND_REPLY_CHECKBOX";

let iconImg = chrome.runtime.getURL('images/check-t.png');
let iconImgGreen = chrome.runtime.getURL('images/check-t-green.png');
let iconImgRed = chrome.runtime.getURL('images/check-t-red.png');
let iconImgQuestionmark = chrome.runtime.getURL('images/check-t-questionmark.png');
let iconImgGrey = chrome.runtime.getURL('images/check-t-grey.png');
let iconImgEmpty = chrome.runtime.getURL('images/check-t-empty.png');

let URL_WARNINGSIGN_IMAGE = 'https://media.gettyimages.com/vectors/warning-icon-vector-id925721224?s=612x612';
let URL_OK_IMAGE = 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTF4UpQQkRAzFSpRipVhixbKx4VxdEHZp-hBw&usqp=CAU';
let URL_QUESTIONMARK_IMAGE = 'https://lh3.googleusercontent.com/proxy/tBkVisJiVQg59DNEaVVVAfWEeL6C_FKdeiYT3Bs3tpJnbRUBH97hm9Yld1_Hiu_8g2iWZISua9jwAyR2X4U5GvFWilW0KiVQmzYgVMRKwnqOPd_KMJET7WLIYjs4Apjs';

// ----------------- debug stuff -----------------
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

// // Usage!
// sleep(500).then(() => {
//     // Do something after the sleep!
// });



// ----------------- get texts and links from conversations found in (a subtree of) the DOM -----------------
function stripFbLinkRedirect(url) {
    if (url.startsWith('https://l.facebook.com/l.php?u')) {
        let params = new URLSearchParams(url.substr(url.indexOf('?')+1));
        return decodeURIComponent(params.get('u'));
    } else {
        return url;
    }
}

function getConversationTexts(parent) {
    if (parent.querySelectorAll == undefined) {
        // not an html node (probably text)
        return []
    } else {
        return parent.querySelectorAll(FB_QUERY_MESSAGE_SPAN);
    }
}

function getConversationLinks(parent) {
    if (parent.querySelectorAll == undefined) {
        // not an html node (probably text)
        return []
    } else {
        let links = Array.from(parent.querySelectorAll(FB_QUERY_MESSAGE_LINK))
                        .concat(Array.from(parent.querySelectorAll(FB_QUERY_MESSAGE_A_WITH_PICTURE_BOX)))
        return links.filter(e => (!e.href.includes('https://www.facebook.com')       // Filter out links to facebook
                                   && e.href.startsWith('http')                      // Filter out local links like "/<facebook id>"
                                   && stripFbLinkRedirect(e.href).startsWith('http') // 
                                   ));;
    }
}

function getUnmarkedConversationLinksAndMark(parent) {
    let linkElements = getConversationLinks(parent);
    let unmarkedElements = linkElements.filter(e => e.getAttribute(MARKED_LINK_ATTRIBUTE) == null);
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
    url = stripFbLinkRedirect(e.href);
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
function openPopover(linkdata) {
    myPopover.mainDiv.style.display = "block";
    setPopupContentForLink(linkdata);
}

function hidePopover() {
    myPopover.mainDiv.style.display = "none";
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
    myPopover.closeButton.innerText = "×";
}

function handle_icon_mouseleave_icon() {
    if (!popoverPinned) {
        startHidePopoverTimer();
    }    
}

function handle_icon_mouseenter_popover() {
    if (!popoverPinned) {
        if (hidePopoverTimer != null) {
            clearTimeout(hidePopoverTimer);
            hidePopoverTimer = null;
        }
    }
}

function handle_icon_mouseleave_popover() {
    if (!popoverPinned) {
        startHidePopoverTimer();
    }    
}

function handle_close_clicked() {
    hidePopover();
    popoverPinned = false;
    myPopover.closeButton.innerText = "";
}



// ----------------- Add our icon before links -----------------
function appendIcon(icon, e) {
    while (e != null) {
        c = e.className
        // Search up to find the top level of this message
        if (c != undefined && c.includes(FB_CLASS_TO_APPEND_ICON_PARENT)) {
            // Then for messages I sent, there should be a child with this class,
            // which contains the more (three dots), and forward buttons.
            if (e.querySelector(FB_QUERY_TO_APPEND_ICON_CHILD) != null) {
                e = e.querySelector(FB_QUERY_TO_APPEND_ICON_CHILD);
            }
            if (e.querySelector(".vliegtuig-icon-div") == null) {
                // Don't add an icon if it's already there. This happens for links that
                // show both the url as a text, and the box with a preview and title.
                e.prepend(icon);
            }
            return;
        }
        e = e.parentElement;
    }
}

function markLink(linkdata) {
    let icon = document.createElement("img");
    icon.setAttribute("src", iconImgEmpty);
    icon.setAttribute("height", "24");
    icon.setAttribute("width", "24");
    icon.setAttribute("alt", "check");
    icon.onclick = () => handle_icon_clicked();
    icon.onmouseenter = () => handle_icon_mouseenter_icon(linkdata);
    icon.onmouseleave = () => handle_icon_mouseleave_icon();
    linkdata.evaluationPromise.then(evaluation => icon.setAttribute("src", evaluation.icon));
    // TODO: placement needs some tweaking

    let d = document.createElement("div");
    d.setAttribute("class", "vliegtuig-icon-div");
    d.appendChild(icon);

    appendIcon(d, linkdata.element);
    console.log("added icon to " + linkdata.url);
}

function markLinks(parent) {
    getUnmarkedConversationLinksAndMark(parent).forEach(markLink);
}



// ----------------- Put content in popup -----------------
var current_url = ""
function setPopupContentForLink(linkdata) {
    if (current_url == linkdata.url) {
        // already set for this URL. skipping.
        return;
    }

    current_url = linkdata.url;
    setPopupContentInner(linkdata, null);
    linkdata.evaluationPromise.then(evaluation => { setPopupContentInner(linkdata, evaluation); });
}

function setPopupContentInner(linkdata, evaluation) {
    if (evaluation == null) {
        myPopover.title.innerText = "Loading...";
        myPopover.evalIcon.src = iconImgQuestionmark;
        myPopover.evalIcon.alt = "loading";
        myPopover.evalText.innerText = linkdata.url;
        myPopover.sendReplyDiv.style.display = "none";
    } else {
        myPopover.title.innerText = evaluation.site;
        myPopover.evalIcon.src = evaluation.icon;
        myPopover.evalIcon.alt = evaluation.alt;
        myPopover.evalText.innerText = "We found that " + evaluation.text;
        myPopover.sendReplyDiv.style.display = "block";

        if (linkdata.reply_to_type == 'user' || linkdata.reply_to_type == 'group') {
            if (linkdata.reply_to_type == 'user') {
                var sendFunction = sendFbMessageToUser
                var text = `Send this rating as a reply to user with id ${linkdata.reply_to_id}.`;
            } else {
                var sendFunction = sendFbMessageToGroup
                var text = `Send this rating as a reply to group with id ${linkdata.reply_to_id}.`;            
            }
            myPopover.sendReplyText.innerText = text;
            myPopover.sendReplyButton.onclick = () => {
                linkdata.evaluationPromise.then(evaluation => sendFunction(evaluation, linkdata.reply_to_id));
            };
        } else {
            myPopover.sendReplyText.innerText = "user not found";
            myPopover.sendReplyButton.onclick = () => { };
        }
    }
}



// ----------------- Get data from Newsguard -----------------
function getNewsGuardDataPromise(url) {
    return fetch(`https://api.newsguardtech.com/check?url=${encodeURIComponent(url)}`).then(r => r.json());
}

function getSiteFromUrl(url) {
    let trim = (s, prefix) => { if (s.startsWith(prefix)) { return s.substring(prefix.length); } else { return s; } };
    url = trim(url, 'https://');
    url = trim(url, 'http://');
    url = trim(url, 'www.');
    if (url.endsWith('/')) {
        url = url.substring(0, url.length - 1);
    }
    if (url.indexOf('/', url.indexOf('.')) != -1) {
        // strip anything after the hostname
        url = url.substring(0, url.indexOf('/', url.indexOf('.')));
    }
    return url;
}

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
    if (data.identifier != null) {
        var url = data.identifier;
    } else {
        var url = url;
    }
    site = getSiteFromUrl(url);

    if (data.rank == null) {
        return {
            icon:iconImgQuestionmark,
            unicodeSymbol:"❔",
            imageUrl: URL_QUESTIONMARK_IMAGE,
            alt:"not found",
            text:`${url} is not in NewsGuard's database.`,
            site:site
        };
    } else if (data.rank == 'P' && data.score == 0) {
        return {
            icon:iconImgGrey,
            unicodeSymbol:"➗",
            imageUrl: URL_QUESTIONMARK_IMAGE,
            alt:"not rated",
            text:`${url} is in NewsGuard's database, but does not get a score since it publishes content from its users that it does not vet.`,
            site:site
        };
    } else if (data.rank == 'T') {
        return {
            icon:iconImgGreen,
            unicodeSymbol:"✔",
            imageUrl: URL_OK_IMAGE,
            alt:"safe",
            text:`${url} gets a score of ${data.score} in NewsGuard's database. It should be safe.`,
            site:site
        };
    } else if (data.rank == 'N') {
        return {
            icon:iconImgRed,
            unicodeSymbol:"⚠",
            imageUrl: URL_WARNINGSIGN_IMAGE,
            alt:"unsafe",
            text:`${url} gets a score of ${data.score} in NewsGuard's database. Proceed with caution.`,
            site:site
        };
    } else {
        return {
            icon:iconImgQuestionmark,
            unicodeSymbol:"❔",
            imageUrl: URL_QUESTIONMARK_IMAGE,
            alt:"unsure",
            text:`${url} gets rank ${data.rank} and a score of ${data.score} in NewsGuard's database.`,
            site:site
        };
    }
}



// ----------------- Sending Facebook messages -----------------
function sendFbMessage(params) {
    const http = new XMLHttpRequest();
    const url = 'https://mbasic.facebook.com/messages/send/';
    http.open("POST", url);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    http.withCredentials = true;
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
}

function sendFbMessageWithImage(params, imageUrl) {
    const http = new XMLHttpRequest();
    const url = 'https://upload.facebook.com/_mupload_/mbasic/messages/attachment/photo/';
    http.open("POST", url);
    http.withCredentials = true;

    let data = new FormData();
    for (let [key, value] of Object.entries(params)) {
        data.append(key, value);
    }
    // fb_dtsg is the token that identifies the current user.
    // There are usually 3 elements with a token found in the document, but they all seem to work.
    data.append('fb_dtsg', document.getElementsByName("fb_dtsg")[0].value);
    data.append('file1', "vliegtuig.jpg");

    fetch(imageUrl).then(r => r.blob()).then(image => {
        data.append('vliegtuig.jpg', image);
        http.send(data);
    });
}

function includeImage() {
    return myPopover.sendReplyCheckbox.checked;
}
function evaluationToMessageText(evaluation) {
    text = "My extension found that " + evaluation.text;
    if (!includeImage()) {
        // Include either unicode icon or a real image (which may later be replaced by an image of our score card).
        text += " " + evaluation.unicodeSymbol;
    }
    return text;
}

function sendFbMessageToUser(evaluation, friend_id) {
    let params = {}
    params['body'] = evaluationToMessageText(evaluation);
    params[`ids[${friend_id}]`] = friend_id;
    if (includeImage()) {
        sendFbMessageWithImage(params, evaluation.imageUrl);
    } else {
        sendFbMessage(params);        
    }
}

function sendFbMessageToGroup(evaluation, thread_id) {
    let params = {}
    params['body'] = evaluationToMessageText(evaluation);
    params['tids'] = `cid.g.${thread_id}`;
    if (includeImage()) {
        sendFbMessageWithImage(params, evaluation.imageUrl);
    } else {
        sendFbMessage(params);        
    }
}

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




// ----------------- Initialisation -----------------

// Add the popover to the DOM and connect its events.
var myPopover = null
fetch(chrome.extension.getURL("popover-template.html")).then(r => r.text()).then(t => {
    var tmp = document.createElement('div');
    tmp.innerHTML = t;

    let popOverDiv = tmp.firstChild
    popOverDiv.style.display = 'none';
    document.body.prepend(popOverDiv); // Don't include the <link> tag in popover-template.html since it's already loaded.

    myPopover = {
        mainDiv: popOverDiv,
        closeButton: document.getElementById(POPOVER_CLOSE_BUTTON_ID),
        title: document.getElementById(POPOVER_TITLE_ID),
        evalIcon: document.getElementById(POPOVER_EVAL_ICON_ID),
        evalText: document.getElementById(POPOVER_EVAL_TEXT_ID),
        sendReplyDiv: document.getElementById(POPOVER_SEND_REPLY_DIV_ID),
        sendReplyText: document.getElementById(POPOVER_SEND_REPLY_TEXT_ID),
        sendReplyButton: document.getElementById(POPOVER_SEND_REPLY_BUTTON_ID),
        sendReplyCheckbox: document.getElementById(POPOVER_SEND_REPLY_CHECKBOX_ID)
    };
    myPopover.mainDiv.onmouseenter = handle_icon_mouseenter_popover;
    myPopover.mainDiv.onmouseleave = handle_icon_mouseleave_popover;
    myPopover.closeButton.onclick = handle_close_clicked;
    myPopover.closeButton.innerText = '';
});

// Listener to communicate with extension popup (not really using it right now, but may be useful later)
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


// Create an Observer to monitor DOM changes and add our icon to any links found in conversations
let domObserver = new MutationObserver(mutations => {
    for(let mutation of mutations) {
        for(let addedNode of mutation.addedNodes) {
            markLinks(addedNode);
        }
    }
});
domObserver.observe(document, { childList: true, subtree: true });