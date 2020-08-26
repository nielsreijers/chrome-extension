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

function _handle_textarea_input() {
    // Pin the popup when the user start editing the reply
    popoverPinned = true;
    myPopover.closeButton.innerText = "×";
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
            myPopover.evalDataFoundForPleaseCheckMessage.style.display = "none";
            myPopover.evalProposedReplyDiv.style.display = "none";
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

        myPopover.sendReplyImageCheckboxSpan.style.display = isDebugMode() ? "inline-block" : "none";
        if (widgetdata.source == widgetSource.FEEDPOST) {
            myPopover.sendReplyTr.style.display = "none";
        } else {
            myPopover.sendReplyTr.style.display = "table-row";
            if (widgetdata.replyToType == null) {
                myPopover.sendReplyButton.disabled = true;
                myPopover.sendReplyText.innerText = "We can only auto-reply to this from the messenger.com or facebook.com/messages view.";
                myPopover.sendReplyButton.onclick = () => { };
            } else {
                myPopover.sendReplyButton.disabled = false;
                if (widgetdata.replyToType == 'user') {
                    var text = isDebugMode() ? `Directly send this as a reply to user with id ${widgetdata.replyToId}:`
                                           : `Directly send this reply.`;
                } else if (widgetdata.replyToType == 'group') {
                    var text = isDebugMode() ? `Directly send this as a reply to group with id ${widgetdata.replyToId}:`
                                           : `Directly send this reply to the group.`;
                } else {
                    var text = "Something went wrong...";
                }
                myPopover.sendReplyText.innerText = text;
                myPopover.sendReplyButton.onclick = () => {
                    widgetdata.evaluationPromise.then(evaluation => _sendReply(widgetdata, myPopover.evalProposedReply.value, evaluation.imageUrl));
                };
            }
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
    myPopover.sendReplyText.innerText = widgetdata.replyToType == 'feedpost'
                                            ? "The reply was posted."
                                            : "The reply was sent.";
}



// ----------------- Initialisation -----------------
// Add the popover to the DOM and connect its events.
var myPopover = null
fetch(chrome.extension.getURL("twisc/popover-template.html")).then(r => r.text()).then(t => {
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
        copyReplyButton: document.getElementById("VLIEGTUIG_COPY_REPLY_BUTTON"),
        sendReplyTr: document.getElementById("VLIEGTUIG_SEND_REPLY_TR"),
        sendReplyText: document.getElementById("VLIEGTUIG_SEND_REPLY_TEXT"),
        sendReplyButton: document.getElementById("VLIEGTUIG_SEND_REPLY_BUTTON"),
        sendReplyImageCheckbox: document.getElementById("VLIEGTUIG_SEND_REPLY_IMAGE_CHECKBOX"),
        sendReplyImageCheckboxSpan: document.getElementById("VLIEGTUIG_SEND_REPLY_IMAGE_CHECKBOX_SPAN"),
        twiscLogo: document.getElementById("VLIEGTUIG_TWISC_LOGO")
    };
    myPopover.twiscLogo.src = chrome.extension.getURL("twisc/images/twisc.png");
    myPopover.mainDiv.onmouseenter = _handle_popover_mouseenter;
    myPopover.evalProposedReply.oninput = _handle_textarea_input;
    myPopover.mainDiv.onmouseleave = _handle_popover_mouseleave;
    myPopover.closeButton.onclick = _handle_close_clicked;
    myPopover.closeButton.innerText = '';
    myPopover.copyReplyButton.onclick = () => {
        /* Select the text field */
        myPopover.evalProposedReply.select();
        myPopover.evalProposedReply.setSelectionRange(0, 99999); /*For mobile devices*/
        document.execCommand("copy");
    };
});

