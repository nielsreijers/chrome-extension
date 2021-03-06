facebookOldFeedMessageboxHandler = {
    findElements:
        function (addedNode) {
            if (addedNode.querySelectorAll == undefined) {
                // not an html node (probably text)
                return []
            } else {
                let FB_QUERY_MESSAGE = "._5yl5 > span";
                let FB_QUERY_MESSAGE_LINK = "._5yl5 > span > a";

                let textElements = checkMessageText() ? Array.from(addedNode.querySelectorAll(FB_QUERY_MESSAGE)) : [];
                let linkElements = checkMessageUrls() ? Array.from(addedNode.querySelectorAll(FB_QUERY_MESSAGE_LINK)) : [];

                // A message may or may not include a link.
                // If they do we only want to keep the link, and discard the surrounding element.
                let filteredElements = filterElementsWithLinks(textElements, linkElements, t => t, l => l.parentElement.parentElement);


                // In addition, a link with a preview picture may appear in the messages.
                // This is a <a> link already with recognisable class.
                let FB_QUERY_MESSAGE_A_WITH_PICTURE_BOX = "._5rw4";
                let picture_box_links = Array.from(addedNode.querySelectorAll(FB_QUERY_MESSAGE_A_WITH_PICTURE_BOX));

                return filteredElements.concat(picture_box_links);
            }
        },
    elementToWidgetData:
        function (e) {
            var replyToType = null;
            var replyToId = _findFantaTab('user', e);
            if (replyToId!=null) {
                replyToType = 'user';
            } else {
                replyToId = _findFantaTab('thread', e);
                if (replyToId!=null) {
                    replyToType = 'group';
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
                source:widgetSource.FEEDMESSAGE,
                element:e,
                content:content,
                contentType:contentType,
                replyToType:replyToType,
                replyToId:replyToId,
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

