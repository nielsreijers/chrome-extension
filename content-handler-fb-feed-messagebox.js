facebookFeedMessageboxHandler = {
    findLinkElements:
        function (addedNode) {
            if (addedNode.querySelectorAll == undefined) {
                // not an html node (probably text)
                return []
            } else {
                let FB_QUERY_MESSAGE_LINK = "._5yl5 > span > a";
                let FB_QUERY_MESSAGE_A_WITH_PICTURE_BOX = "._5rw4";
                let query = [FB_QUERY_MESSAGE_LINK, FB_QUERY_MESSAGE_A_WITH_PICTURE_BOX].join(',');
                return Array.from(addedNode.querySelectorAll(query));
            }
        },
    elementToLinkData:
        function (e) {
            var reply_to_type = null;
            var reply_to_id = _findFantaTab('user', e);
            if (reply_to_id!=null) {
                reply_to_type = 'user';
            } else {
                reply_to_id = _findFantaTab('thread', e);
                if (reply_to_id!=null) {
                    reply_to_type = 'group';
                }
            }
            url = stripFacebookExtras(e.href);
            evaluationPromise = getURLEvaluationPromise(url);
            return {
                element:e,
                url:url,
                reply_to_type:reply_to_type,
                reply_to_id:reply_to_id,
                evaluationPromise:evaluationPromise
            }
        },
    addWidgetToElement:
        function (tag, e) {
            let FB_CLASS_TO_APPEND_ICON_PARENT = "_5wd4";
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

function _findFantaTab(tabType, messageElement) {
    let re = new RegExp(`fantaTabMain-${tabType}:([0-9]+)`);
    var e = messageElement;

    fantaTabMain = findParentElementWithClass(messageElement, 'fantaTabMain-')
    if (fantaTabMain != null) {
        let c = fantaTabMain.getAttribute("class");
        let match = re.exec(c);
        if (match != null) {
            return match[1];
        }
    }
    return null;    
}

