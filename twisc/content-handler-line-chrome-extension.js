lineChromeExtensionHandler = {
    findElements:
        function (addedNode) {
            if (addedNode.querySelectorAll == undefined) {
                // not an html node (probably text)
                return []
            } else {
                let LINE_QUERY_MESSAGE = ".mdRGT07MsgText";
                let LINE_QUERY_MESSAGE_LINK = ".mdRGT07MsgText a";

                let textElements = checkMessageText() ? Array.from(addedNode.querySelectorAll(LINE_QUERY_MESSAGE)) : [];
                let linkElements = checkMessageUrls() ? Array.from(addedNode.querySelectorAll(LINE_QUERY_MESSAGE_LINK)) : [];

                // A message may or may not include a link.
                // If they do we only want to keep the link, and discard the surrounding element.
                return filterElementsWithLinks(textElements, linkElements, t => t, l => l.parentElement.parentElement);
            }
        },
    elementToWidgetData:
        function (e) {
            var replyToType = null;
            var replyToId = null;

            // The element can be either a <a> link, or text in a <span>
            if (e.tagName=="A") {                
                var content = e.href;
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
            let LINE_CLASS_MESSAGE_TOP = "mdRGT07Body";
            let LINE_QUERY_MESSAGE_OPTIONS = ".mdRGT07Opt";

            let parent = findParentElementWithClass(e, LINE_CLASS_MESSAGE_TOP);
            if (parent != null) {
                let opt = parent.querySelector(LINE_QUERY_MESSAGE_OPTIONS);
                if (opt != null) {
                    opt.prepend(tag);
                    return;
                }
            }
            // fallback
            e.parentNode.append(tag);
        }
};
