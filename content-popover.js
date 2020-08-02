// ----------------- Manage popover -----------------
function _openPopover(linkdata) {
    myPopover.mainDiv.style.display = "block";
    _setPopupContentForLink(linkdata);
}

function _hidePopover() {
    myPopover.mainDiv.style.display = "none";
}

var _hidePopoverTimer = null;
function _startHidePopoverTimer() {
    _hidePopoverTimer = setTimeout(function() {
        _hidePopover();
        _hidePopoverTimer = null;
    }, 500);
}

function _stopHidePopoverTimer() {
    if (_hidePopoverTimer != null) {
        clearTimeout(_hidePopoverTimer);
        _hidePopoverTimer = null;
    }    
}

var popoverPinned = false;
function handle_widget_mouseenter(linkdata) {
    if (!popoverPinned) {
        _stopHidePopoverTimer();
        _openPopover(linkdata);
    }
}

function handle_widget_clicked() {
    popoverPinned = true;
    myPopover.closeButton.innerText = "×";
}

function handle_widget_mouseleave() {
    if (!popoverPinned) {
        _startHidePopoverTimer();
    }    
}

function _handle_popover_mouseenter() {
    if (!popoverPinned) {
        if (_hidePopoverTimer != null) {
            clearTimeout(_hidePopoverTimer);
            _hidePopoverTimer = null;
        }
    }
}

function _handle_popover_mouseleave() {
    if (!popoverPinned) {
        _startHidePopoverTimer();
    }    
}

function _handle_close_clicked() {
    _hidePopover();
    popoverPinned = false;
    myPopover.closeButton.innerText = "";
}



// ----------------- Show evaluation in popover -----------------
var _current_url = ""
function _setPopupContentForLink(linkdata) {
    if (_current_url == linkdata.url) {
        // already set for this URL. skipping.
        return;
    }

    _current_url = linkdata.url;
    _setPopupContentInner(linkdata, null);
    linkdata.evaluationPromise
        .then(evaluation => {
            if (_current_url == linkdata.url) {
                // only set if this is still the url we want to see
                // (user may have selected a different one while the eval was loading)
                _setPopupContentInner(linkdata, evaluation);            
            } 
        }).catch(error => {
            myPopover.title.innerText = "Something went wrong...";
            myPopover.evalIcon.src = iconError.url;
            myPopover.evalIcon.alt = "error";
            myPopover.evalText.innerText = error;
            myPopover.evalInfoLinkDiv.style.display = "none";
            myPopover.sendReplyDiv.style.display = "none";
        });
}

function _setPopupContentInner(linkdata, evaluation) {
    if (evaluation == null) {
        myPopover.title.innerText = "Loading...";
        myPopover.evalIcon.src = iconQuestionmark.url;
        myPopover.evalIcon.alt = "loading";
        myPopover.evalText.innerText = linkdata.url;
        myPopover.evalInfoLinkDiv.style.display = "none";
        myPopover.sendReplyDiv.style.display = "none";
    } else {
        myPopover.title.innerText = evaluation.dataFoundFor;
        myPopover.evalIcon.src = evaluation.icon.url;
        myPopover.evalIcon.alt = evaluation.alt;
        myPopover.evalText.innerText = "We found that " + evaluation.text;
        myPopover.sendReplyDiv.style.display = "block";

        if (evaluation.infoLink == null) {
            myPopover.evalInfoLinkDiv.style.display = "none";
        } else {
            myPopover.evalInfoLinkDiv.style.display = "block";     
            myPopover.evalInfoLinkA.href = evaluation.infoLink;       
        }

        if (linkdata.reply_to_type == null) {
            myPopover.sendReplyText.innerText = "Can't auto-reply because the id to reply to could not be found.";
            myPopover.sendReplyControls.style.display = "none";
            myPopover.sendReplyButton.onclick = () => { };
        } else {
            if (linkdata.reply_to_type == 'user') {
                var text = isDebugMode() ? `Send this as a reply to user with id ${linkdata.reply_to_id}:`
                                       : `Send this as a reply:`;
            } else if (linkdata.reply_to_type == 'group') {
                var text = isDebugMode() ? `Send this as a reply to group with id ${linkdata.reply_to_id}:`
                                       : `Send this as a reply:`;
            } else if (linkdata.reply_to_type == 'feedpost') {
                var text = isDebugMode() ? `Post this as a comment to post with id ${linkdata.reply_to_id}:`
                                       : `Post this as a comment:`;
            } else {
                var text = "Something went wrong...";
            }
            myPopover.sendReplyText.innerText = text;
            let preview = evaluationToMessageText(evaluation);
            myPopover.sendReplyPreview.innerText = `"${preview}"`;
            myPopover.sendReplyControls.style.display = "block";
            myPopover.sendReplyImageCheckbox.parentElement.style.display = isDebugMode() ? "inline-block" : "none";
            myPopover.sendReplyButton.onclick = () => {
                linkdata.evaluationPromise.then(evaluation => _sendReply(linkdata, evaluation));
            };
        }
    }
}

function _sendReply(linkdata, evaluation) {
    includeImage = myPopover.sendReplyImageCheckbox.checked;
    facebookSendOrPostReply (linkdata, evaluation, includeImage);
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
        evalInfoLinkDiv: document.getElementById("VLIEGTUIG_EVAL_INFOLINK_DIV"),
        evalInfoLinkA: document.getElementById("VLIEGTUIG_EVAL_INFOLINK_A"),
        sendReplyDiv: document.getElementById("VLIEGTUIG_SEND_REPLY_DIV"),
        sendReplyText: document.getElementById("VLIEGTUIG_SEND_REPLY_TEXT"),
        sendReplyPreview: document.getElementById("VLIEGTUIG_SEND_REPLY_PREVIEW"),
        sendReplyControls: document.getElementById("VLIEGTUIG_SEND_REPLY_CONTROLS"),
        sendReplyButton: document.getElementById("VLIEGTUIG_SEND_REPLY_BUTTON"),
        sendReplyImageCheckbox: document.getElementById("VLIEGTUIG_SEND_REPLY_CHECKBOX"),
        twiscLogo: document.getElementById("VLIEGTUIG_TWISC_LOGO")
    };
    myPopover.twiscLogo.src = chrome.extension.getURL("images/twisc.png");
    myPopover.mainDiv.onmouseenter = _handle_popover_mouseenter;
    myPopover.mainDiv.onmouseleave = _handle_popover_mouseleave;
    myPopover.closeButton.onclick = _handle_close_clicked;
    myPopover.closeButton.innerText = '';
});

