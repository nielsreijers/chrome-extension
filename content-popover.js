// ----------------- Manage popover -----------------
function _openPopover(widgetdata) {
    myPopover.mainDiv.style.display = "block";
    _setPopupContentForLink(widgetdata);
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
function handle_widget_mouseenter(widgetdata) {
    if (!popoverPinned) {
        _stopHidePopoverTimer();
        _openPopover(widgetdata);
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
function _setPopupContentForLink(widgetdata) {
    if (_current_url == widgetdata.content) {
        // already set for this URL. skipping.
        return;
    }

    _current_url = widgetdata.content;
    _setPopupContentInner(widgetdata, null);
    widgetdata.evaluationPromise
        .then(evaluation => {
            if (_current_url == widgetdata.content) {
                // only set if this is still the url we want to see
                // (user may have selected a different one while the eval was loading)
                _setPopupContentInner(widgetdata, evaluation);            
            } 
        })
        .catch(error => {
            myPopover.title.innerText = "Something went wrong...";
            myPopover.evalIcon.src = iconError.url;
            myPopover.evalIcon.alt = "error";
            myPopover.evalShortText.innerText = error;
            myPopover.evalInfoLinkDiv.style.display = "none";
            myPopover.sendReplyDiv.style.display = "none";
        });
}

function _removeWhitespace(s) {
    return s.replace(/\n/g, "").replace(/\r/g, "").replace(/\t/g, "").replace(/ /g, "")
}

function _setPopupContentInner(widgetdata, evaluation) {
    let searchTerm = widgetdata.content.replace('\n',' ');
    if (evaluation == null) {
        myPopover.title.innerText = "Loading...";
        myPopover.evalIcon.src = iconLoading.url;
        myPopover.evalIcon.alt = "loading";
        myPopover.evalShortText.innerText = searchTerm;
        myPopover.evalInfoLinkDiv.style.display = "none";
        myPopover.evalDataFoundForDiv.style.display = "none";
        myPopover.evalProposedReplyDiv.style.display = "none";
        myPopover.sendReplyDiv.style.display = "none";
    } else {
        myPopover.title.innerText = searchTerm;
        myPopover.evalIcon.src = evaluation.icon.url;
        myPopover.evalIcon.alt = evaluation.alt;
        myPopover.evalShortText.innerText = evaluation.shortText;

        // Show link for more information if it's available
        if (evaluation.infoLink == null) {
            myPopover.evalInfoLinkDiv.style.display = "none";
        } else {
            myPopover.evalInfoLinkDiv.style.display = "inline-block";     
            myPopover.evalInfoLinkA.href = evaluation.infoLink;       
        }

        // Show the article we match with.
        // For NewsGuard it's always correct, but Cofacts may return an unrelated article,
        // so the user needs to check.
        if (_removeWhitespace(evaluation.dataFoundFor) == _removeWhitespace(widgetdata.content)
                || getSetting(SETTING_EVALUATOR) == 'newsguard') {
            myPopover.evalDataFoundForDiv.style.display = "none";
            myPopover.evalDataFoundForPleaseCheckMessage.style.display = "none";
        } else {
            myPopover.evalDataFoundForDiv.style.display = "block";
            myPopover.evalDataFoundForPleaseCheckMessage.style.display = "inline-block";
            myPopover.evalDataFoundFor.innerText = evaluation.dataFoundFor;
        }

        // Show the proposed reply if there is one
        if (!evaluation.showReplyButton) {
            myPopover.evalProposedReplyDiv.style.display = "none";
        } else {
            myPopover.evalProposedReplyDiv.style.display = "block";
            let proposedReply = evaluationToReplyMessageText(evaluation);
            myPopover.evalProposedReply.value = proposedReply
        }

        myPopover.sendReplyDiv.style.display = "block";
        if (!evaluation.showReplyButton || widgetdata.reply_to_type == null) {
            if (!evaluation.showReplyButton) {
                myPopover.sendReplyText.innerText = "Can't auto-reply because no match could not be found.";                
            } else {
                myPopover.sendReplyText.innerText = "Can't auto-reply because the id to reply to could not be found.";
            }
            myPopover.sendReplyControls.style.display = "none";
            myPopover.sendReplyButton.onclick = () => { };
        } else {
            if (widgetdata.reply_to_type == 'user') {
                var text = isDebugMode() ? `Send this as a reply to user with id ${widgetdata.reply_to_id}:`
                                       : `Send this reply to the user:`;
            } else if (widgetdata.reply_to_type == 'group') {
                var text = isDebugMode() ? `Send this as a reply to group with id ${widgetdata.reply_to_id}:`
                                       : `Send this reply to the group:`;
            } else if (widgetdata.reply_to_type == 'feedpost') {
                var text = isDebugMode() ? `Post this as a comment to post with id ${widgetdata.reply_to_id}:`
                                       : `Post this reply as a comment:`;
            } else {
                var text = "Something went wrong...";
            }
            myPopover.sendReplyText.innerText = text;
            myPopover.sendReplyControls.style.display = "inline-block";
            myPopover.sendReplyImageCheckboxSpan.style.display = isDebugMode() ? "inline-block" : "none";
            myPopover.sendReplyButton.onclick = () => {
                widgetdata.evaluationPromise.then(evaluation => _sendReply(widgetdata, myPopover.evalProposedReply.value, evaluation.imageUrl));
            };
        }
    }
}

function _sendReply(widgetdata, message, imageUrl) {
    includeImage = myPopover.sendReplyImageCheckbox.checked;
    if (!includeImage) {
        // We have no useful images to send yet.
        // This is just here in case we ever get an evaluator that can produce some nice graphics for an evaluation
        imageUrl = null;
    }
    facebookSendOrPostReply (widgetdata, message, imageUrl);
    myPopover.sendReplyText.innerText = widgetdata.reply_to_type == 'feedpost'
                                            ? "The reply was posted."
                                            : "The reply was sent.";
    myPopover.sendReplyControls.style.display = "none";
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
        evalShortText: document.getElementById("VLIEGTUIG_EVAL_SHORTTEXT"),
        evalDataFoundForDiv: document.getElementById("VLIEGTUIG_EVAL_DATAFOUNDFOR_DIV"),
        evalDataFoundFor: document.getElementById("VLIEGTUIG_EVAL_DATAFOUNDFOR_TEXT"),
        evalDataFoundForPleaseCheckMessage: document.getElementById("VLIEGTUIG_EVAL_DATAFOUNDFOR_PLEASE_CHECK_MESSAGE"),
        evalProposedReplyDiv: document.getElementById("VLIEGTUIG_EVAL_PROPOSED_REPLY_DIV"),
        evalProposedReply: document.getElementById("VLIEGTUIG_EVAL_PROPOSED_REPLY_TEXT"),
        evalInfoLinkDiv: document.getElementById("VLIEGTUIG_EVAL_INFOLINK_DIV"),
        evalInfoLinkA: document.getElementById("VLIEGTUIG_EVAL_INFOLINK_A"),
        sendReplyDiv: document.getElementById("VLIEGTUIG_SEND_REPLY_DIV"),
        sendReplyText: document.getElementById("VLIEGTUIG_SEND_REPLY_TEXT"),
        sendReplyControls: document.getElementById("VLIEGTUIG_SEND_REPLY_CONTROLS"),
        sendReplyButton: document.getElementById("VLIEGTUIG_SEND_REPLY_BUTTON"),
        sendReplyImageCheckbox: document.getElementById("VLIEGTUIG_SEND_REPLY_IMAGE_CHECKBOX"),
        sendReplyImageCheckboxSpan: document.getElementById("VLIEGTUIG_SEND_REPLY_IMAGE_CHECKBOX_SPAN"),
        twiscLogo: document.getElementById("VLIEGTUIG_TWISC_LOGO")
    };
    myPopover.twiscLogo.src = chrome.extension.getURL("images/twisc.png");
    myPopover.mainDiv.onmouseenter = _handle_popover_mouseenter;
    myPopover.mainDiv.onmouseleave = _handle_popover_mouseleave;
    myPopover.closeButton.onclick = _handle_close_clicked;
    myPopover.closeButton.innerText = '';
});

