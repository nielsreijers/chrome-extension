facebookNewFeedMessageboxHandler = {
    findElements:
        function (addedNode) {
            if (addedNode.querySelectorAll == undefined) {
                // not an html node (probably text)
                return []
            } else {
                let FB_CLASS_MESSAGE = "h9e7qa53";
                let FB_QUERY_MESSAGE = ".h9e7qa53 > span:nth-child(2)";
                let FB_QUERY_MESSAGE_LINK = ".h9e7qa53 > span:nth-child(2) a";

                let textElements = checkMessageText() ? Array.from(addedNode.querySelectorAll(FB_QUERY_MESSAGE)) : [];
                let linkElements = checkMessageUrls() ? Array.from(addedNode.querySelectorAll(FB_QUERY_MESSAGE_LINK)) : [];

                // A message may or may not include a link.
                // If they do we only want to keep the link, and discard the surrounding element.
                let filteredElements = filterElementsWithLinks(textElements, linkElements, t => findParentElementWithClass(t, FB_CLASS_MESSAGE), l => findParentElementWithClass(l, FB_CLASS_MESSAGE));

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
            var replyToId = null;
            // The element can be either a <a> link, or text in a <div>
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
            let FB_CLASS_MESSAGE = "h9e7qa53";
            let message = findParentElementWithClass(e, FB_CLASS_MESSAGE);
            if (message != null && message.nextElementSibling != null) {
                if (message.nextElementSibling.querySelector('.vliegtuig-widget-div') == null) {
                    // Don't add a widget if it's already there. This happens for links that
                    // show both the url as a text, and the box with a preview and title.
                    message.nextElementSibling.prepend(tag);
                }
            } else {
                e.prepend(tag);
            }
        }
};
