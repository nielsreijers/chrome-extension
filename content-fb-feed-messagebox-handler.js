facebookFeedMessageboxHandler = {
    findLinkElements:
        function (addedNode) {
            if (addedNode.querySelectorAll == undefined) {
                // not an html node (probably text)
                return []
            } else {
                let FB_QUERY_MESSAGE_LINK = "._5yl5 > span > a";
                let FB_QUERY_MESSAGE_A_WITH_PICTURE_BOX = "._5rw4";
                return (Array.from(addedNode.querySelectorAll(FB_QUERY_MESSAGE_LINK)).concat
                       (Array.from(addedNode.querySelectorAll(FB_QUERY_MESSAGE_A_WITH_PICTURE_BOX))))
            }
        },
    elementToLinkData:
        function (e) {
            var reply_to_type = null;
            var reply_to_id = findFantaTab('user', e);
            if (reply_to_id!=null) {
                reply_to_type = 'user';
            } else {
                reply_to_id = findFantaTab('thread', e);
                if (reply_to_id!=null) {
                    reply_to_type = 'group';
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
            let FB_CLASS_TO_APPEND_ICON_PARENT = "_5wd4";
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

function findFantaTab(tabType, messageElement) {
    let re = new RegExp(`fantaTabMain-${tabType}:([0-9]+)`);
    var e = messageElement;
    while (e != null) {
        let c = e.getAttribute("class");
        let match = re.exec(c);
        if (match != null) {
            return match[1];
        }
        e = e.parentElement;
    }
    return null;    
}

