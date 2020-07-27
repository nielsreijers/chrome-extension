facebookMessengerHandler = {
    findLinkElements:
        function (addedNode) {
            if (addedNode.querySelectorAll == undefined) {
                // not an html node (probably text)
                return []
            } else {
                let FB_CLASS_MESSAGE_A_WITH_PICTURE_BOX = "_5rw4";
                let FB_QUERY_MESSAGE_A_WITH_PICTURE_BOX = "."+FB_CLASS_MESSAGE_A_WITH_PICTURE_BOX;
                let FB_QUERY_MESSAGE_LINK = "._58nk > a";

                // Picture boxes may be the top added node in messenger, and querySelectorAll only finds children,
                // but we don't want to search addedNode.parentElement because it may be a long list.
                // So check directly for the class.
                if (addedNode.getAttribute("class") != null
                        && addedNode.getAttribute("class").includes(FB_CLASS_MESSAGE_A_WITH_PICTURE_BOX)) {
                    return [addedNode];
                }

                return (Array.from(addedNode.querySelectorAll(FB_QUERY_MESSAGE_LINK)).concat
                       (Array.from(addedNode.querySelectorAll(FB_QUERY_MESSAGE_A_WITH_PICTURE_BOX))))
            }
        },
    elementToLinkData:
        function (e) {
            var reply_to_type = null;
            var reply_to_id = null;
            let FB_LOCATION_PREFIX = "https://www.messenger.com/t/";
            console.log("aap")
            console.log(isMessengerGroupChat())
            console.log(window.location.href)
            console.log(window.location.href.startsWith(FB_LOCATION_PREFIX))
            if (isMessengerGroupChat() && window.location.href.startsWith(FB_LOCATION_PREFIX)) {
                reply_to_type = 'group';
                reply_to_id = window.location.href.substr(FB_LOCATION_PREFIX.length);
            } else {
                username = window.location.href.substr(FB_LOCATION_PREFIX.length);
                reply_to_id = facebookUserNameToId(username)
                if (reply_to_id!=null) {
                    reply_to_type = 'user';
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
            }
        },
    addTagToElement:
        function (tag, e) {
            let FB_CLASS_TO_APPEND_ICON_PARENT = "_o46";
            let FB_QUERY_TO_APPEND_ICON_CHILD = "._2u_d";
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
                        e.prepend(tag);
                    }
                    return;
                }
                e = e.parentElement;
            }
        }
};

function isMessengerGroupChat() {
    let FB_QUERY_MESSENGER_CHAT_HEADER = '._673w';
    let FB_CLASS_MESSENGER_GROUP_CHAT = "_1_fz";
    return document.querySelectorAll(FB_QUERY_MESSENGER_CHAT_HEADER)[0].getAttribute("class").includes(FB_CLASS_MESSENGER_GROUP_CHAT);
}

function facebookUserNameToId(username) {
    for (var id in shortProfiles) {
        if (shortProfiles[id].vanity == username) {
            return id;
        }
    }
    // Refresh short profiles and try again.
    // Not sure if this is necessary, it doesn't seem to change.
    // But just in case.
    shortProfiles = getShortProfiles()
    for (var id in shortProfiles) {
        if (shortProfiles[id].vanity == username) {
            return id;
        }
    }
    return null;
}

shortProfiles = {}
function getShortProfiles() {
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
