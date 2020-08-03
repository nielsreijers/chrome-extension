facebookMessengerHandler = {
    findLinkElements:
        function (addedNode) {
            if (addedNode.querySelectorAll == undefined) {
                // not an html node (probably text)
                return []
            } else {
                // A message may or may not include a link
                let FB_QUERY_MESSAGE = "._58nk";
                let FB_QUERY_MESSAGE_LINK = "._58nk > a";

                let all_messages = Array.from(addedNode.querySelectorAll(FB_QUERY_MESSAGE));
                let message_links = Array.from(addedNode.querySelectorAll(FB_QUERY_MESSAGE_LINK));
                let message_links_parents = message_links.map(l => l.parentElement);
                let messages_without_link = all_messages.filter(m => !message_links_parents.includes(m));

                return message_links.concat(messages_without_link);
            }
        },
    elementToWidgetData:
        function (e) {
            var reply_to_type = null;
            var reply_to_id = null;

            let location = window.location.href;
            // Can be either "https://www.messenger.com/t/<username or group id>"
            // or            "https://www.facebook.com/messages/t/<username or group id>"
            let usernameOrGroupId = location.substr(location.lastIndexOf('/')+1);

            if (_isMessengerGroupChat()) {
                reply_to_type = 'group';
                reply_to_id = usernameOrGroupId;
            } else {
                reply_to_id = _facebookUserNameToId(usernameOrGroupId)
                if (reply_to_id!=null) {
                    reply_to_type = 'user';
                }
            }

            // The element can be either a <a> link, or text in a <span>
            if (e.tagName=="A") {
                var content = stripFacebookExtras(e.href);
                var contentType = contentTypes.URL;
            } else {
                var content = e.textContent;
                var contentType = contentTypes.TEXT;
            }

            let evaluationPromise = getEvaluationPromise(content, contentType);
            return {
                element:e,
                content:content,
                contentType:contentType,
                reply_to_type:reply_to_type,
                reply_to_id:reply_to_id,
                evaluationPromise:evaluationPromise
            }
        },
    addWidgetToElement:
        function (tag, e) {
            let FB_CLASS_TO_APPEND_ICON_PARENT = "_o46";
            let FB_QUERY_TO_APPEND_ICON_CHILD = "._2u_d";

            // Search up to find the top level of this message
            var parent = findParentElementWithClass(e, FB_CLASS_TO_APPEND_ICON_PARENT);

            // Then there should be a child with this class,
            // which contains the more (three dots), and forward buttons.
            var child = null;
            if (parent != null) {
                if ((child = parent.querySelector(FB_QUERY_TO_APPEND_ICON_CHILD)) != null) {
                    // Don't add a widget if it's already there. This happens for links that
                    // show both the url as a text, and the box with a preview and title.
                    if (child.querySelector(".vliegtuig-widget-div") == null) {
                        child.prepend(tag);
                    }
                }
            }
        }
};

function _isMessengerGroupChat() {
    let FB_QUERY_MESSENGER_CHAT_HEADER = '._673w';
    let FB_CLASS_MESSENGER_GROUP_CHAT = "_1_fz";
    return document.querySelectorAll(FB_QUERY_MESSENGER_CHAT_HEADER)[0].getAttribute("class").includes(FB_CLASS_MESSENGER_GROUP_CHAT);
}

function _facebookUserNameToId(username) {
    for (var id in shortProfiles) {
        if (shortProfiles[id].vanity == username) {
            return id;
        }
    }
    // Refresh short profiles and try again.
    // Not sure if this is necessary, it doesn't seem to change.
    // But just in case.
    shortProfiles = _getShortProfiles()
    for (var id in shortProfiles) {
        if (shortProfiles[id].vanity == username) {
            return id;
        }
    }
    return null;
}

shortProfiles = {}
function _getShortProfiles() {
    var innerhtml = document.body.innerHTML
    var start = innerhtml.indexOf('shortProfiles');
    if (start == -1) {
        return null;
    }
    start = innerhtml.indexOf('{', start);
    end = start+1;
    depth = 1;
    while (depth != 0 && end < innerhtml.length) {
        if (innerhtml[end] == "{") {
            depth++;
        }
        if (innerhtml[end] == "}") {
            depth--;
        }
        end++;
    }
    return JSON.parse(innerhtml.substring(start, end));
}
