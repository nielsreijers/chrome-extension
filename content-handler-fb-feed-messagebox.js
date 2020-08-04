facebookFeedMessageboxHandler = {
    findLinkElements:
        function (addedNode) {
            if (addedNode.querySelectorAll == undefined) {
                // not an html node (probably text)
                return []
            } else {
                let FB_QUERY_MESSAGE = "._5yl5 > span"
                let FB_QUERY_MESSAGE_LINK = "._5yl5 > span > a";

                // Find all plain messages (without picture box). This will contain messages with just text, and messages with a link embedded in it.
                // We want to select the <a> link for messages that have them, and the surrounding <span> for messages that don't.
                let all_plain_messages = Array.from(addedNode.querySelectorAll(FB_QUERY_MESSAGE));
                // Find the <a> links in plain messages
                let plain_message_links = Array.from(addedNode.querySelectorAll(FB_QUERY_MESSAGE_LINK));
                // And find the parent element (with class _5yl5) for those links
                let plain_message_links_parents = plain_message_links.map(l => l.parentElement.parentElement);
                // Remove these from the list of plain messages.
                let plain_messages_without_link = all_plain_messages.filter(m => !plain_message_links_parents.includes(m));

                // In addition, a link with a preview picture may appear in the messages.
                // This is a <a> link already with recognisable class.
                let FB_QUERY_MESSAGE_A_WITH_PICTURE_BOX = "._5rw4";
                let picture_box_links = Array.from(addedNode.querySelectorAll(FB_QUERY_MESSAGE_A_WITH_PICTURE_BOX));

                return plain_message_links.concat(plain_messages_without_link).concat(picture_box_links);
            }
        },
    elementToWidgetData:
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
            console.log(e)
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

