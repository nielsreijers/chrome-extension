facebookNewFeedMessageboxHandler = {
    findElements:
        function (addedNode) {
            if (addedNode.querySelectorAll == undefined) {
                // not an html node (probably text)
                return []
            } else {
                let FB_CLASS_MESSAGE_OUT = "h9e7qa53";
                let FB_QUERY_MESSAGE_OUT = ".h9e7qa53 > span:nth-child(2)";
                let FB_QUERY_MESSAGE_OUT_LINK = ".h9e7qa53 > span:nth-child(2) a";

                let textElements_out = checkMessageText() ? Array.from(addedNode.querySelectorAll(FB_QUERY_MESSAGE_OUT)) : [];
                let linkElements_out = checkMessageUrls() ? Array.from(addedNode.querySelectorAll(FB_QUERY_MESSAGE_OUT_LINK)) : [];
                // A message may or may not include a link.
                // If they do we only want to keep the link, and discard the surrounding element.
                let filteredElements_out = filterElementsWithLinks(textElements_out, linkElements_out, t => findParentElementWithClass(t, FB_CLASS_MESSAGE_OUT), l => findParentElementWithClass(l, FB_CLASS_MESSAGE_OUT));


                let FB_CLASS_MESSAGE_IN = "jn8vp64t";
                let FB_QUERY_MESSAGE_IN = ".jn8vp64t > div:nth-child(2)";
                let FB_QUERY_MESSAGE_IN_LINK = ".jn8vp64t > div:nth-child(2) a";

                let textElements_in = checkMessageText() ? Array.from(addedNode.querySelectorAll(FB_QUERY_MESSAGE_IN)) : [];
                let linkElements_in = checkMessageUrls() ? Array.from(addedNode.querySelectorAll(FB_QUERY_MESSAGE_IN_LINK)) : [];
                // A message may or may not include a link.
                // If they do we only want to keep the link, and discard the surrounding element.
                let filteredElements_in = filterElementsWithLinks(textElements_in, linkElements_in, t => findParentElementWithClass(t, FB_CLASS_MESSAGE_IN), l => findParentElementWithClass(l, FB_CLASS_MESSAGE_IN));


                return filteredElements_out.concat(filteredElements_in);
            }
        },
    elementToWidgetData:
        function (e) {
            var replyToType = null;
            var replyToId = null;

            let messageBox = findParentElementWithClass(e, 'iqfcb0g7');
            if (messageBox != null) {
                linkToProfile = messageBox.querySelector('a.d2edcug0');
                if (linkToProfile != null) {
                    let re = new RegExp(`\/([0-9]+)\/`);
                    let match = re.exec(linkToProfile.href);
                    if (match != null) {
                        replyToType = 'user';
                        replyToId = match[1];
                    }
                }
            }

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
            let FB_CLASS_MESSAGE_OUT = "h9e7qa53";
            let FB_CLASS_MESSAGE_IN = "jn8vp64t";

            var message = findParentElementWithClass(e, FB_CLASS_MESSAGE_OUT);
            if (message != null && message.nextElementSibling != null) {
                if (message.nextElementSibling.querySelector('.vliegtuig-widget-div') == null) {
                    // Don't add a widget if it's already there. This happens for links that
                    // show both the url as a text, and the box with a preview and title.
                    message.nextElementSibling.prepend(tag);
                    return;
                }
            }

            var message = findParentElementWithClass(e, FB_CLASS_MESSAGE_IN);
            if (message != null && message.nextElementSibling != null) {
                if (message.nextElementSibling.querySelector('.vliegtuig-widget-div') == null) {
                    // Don't add a widget if it's already there. This happens for links that
                    // show both the url as a text, and the box with a preview and title.
                    message.nextElementSibling.prepend(tag);
                    return;
                }
            }

            e.prepend(tag);
        }
};
