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



// ----------------- Show url evaluation in popover -----------------
var current_url = ""
function setPopupContentForLink(linkdata) {
    if (current_url == linkdata.url) {
        // already set for this URL. skipping.
        return;
    }

    current_url = linkdata.url;
    setPopupContentInner(linkdata, null);
    linkdata.evaluationPromise.then(evaluation => {
        if (current_url == linkdata.url) {
            // only set if this is still the url we want to see
            // (user may have selected a different one while the eval was loading)
            setPopupContentInner(linkdata, evaluation);            
        } 
    });
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

        if (linkdata.reply_to_type == null) {
            myPopover.sendReplyText.innerText = "Can't auto-reply because the id to reply to could not be found.";
            myPopover.sendReplyControls.style.display = "none";
            myPopover.sendReplyButton.onclick = () => { };
        } else {
            if (linkdata.reply_to_type == 'user') {
                var text = `Send this rating as a reply to user with id ${linkdata.reply_to_id}.`;
            } else if (linkdata.reply_to_type == 'group') {
                var text = `Send this rating as a reply to group with id ${linkdata.reply_to_id}.`;
            } else if (linkdata.reply_to_type == 'feedpost') {
                var text = `Post this rating as a comment to post with id ${linkdata.reply_to_id}.`;
            } else {
                var text = "Something went wrong...";
            }
            myPopover.sendReplyText.innerText = text;
            myPopover.sendReplyControls.style.display = "block";
            myPopover.sendReplyButton.onclick = () => {
                linkdata.evaluationPromise.then(evaluation => sendReply(linkdata, evaluation));
            };
        }
    }
}

function sendReply(linkdata, evaluation) {
    includeImage = myPopover.sendReplyCheckbox.checked;
    messageText = "My extension found that " + evaluation.text;

    facebookSendOrPostReply (
        messageText,
        includeImage ? evaluation.imageUrl : null,
        linkdata.reply_to_type,
        linkdata.reply_to_id);
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
        closeButton: document.getElementById("VLIEGTUIG_POPOVER_CLOSE_BUTTON"),
        title: document.getElementById("VLIEGTUIG_POPOVER_TITLE"),
        evalIcon: document.getElementById("VLIEGTUIG_EVAL_ICON"),
        evalText: document.getElementById("VLIEGTUIG_EVAL_TEXT"),
        sendReplyDiv: document.getElementById("VLIEGTUIG_SEND_REPLY_DIV"),
        sendReplyText: document.getElementById("VLIEGTUIG_SEND_REPLY_TEXT"),
        sendReplyControls: document.getElementById("VLIEGTUIG_SEND_REPLY_CONTROLS"),
        sendReplyButton: document.getElementById("VLIEGTUIG_SEND_REPLY_BUTTON"),
        sendReplyCheckbox: document.getElementById("VLIEGTUIG_SEND_REPLY_CHECKBOX")
    };
    myPopover.mainDiv.onmouseenter = handle_icon_mouseenter_popover;
    myPopover.mainDiv.onmouseleave = handle_icon_mouseleave_popover;
    myPopover.closeButton.onclick = handle_close_clicked;
    myPopover.closeButton.innerText = '';
});

