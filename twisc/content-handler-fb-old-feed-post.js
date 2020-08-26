facebookOldFeedPostHandler = {
    findElements:
        function (addedNode) {
            if (addedNode.parentElement == null || addedNode.parentElement == undefined) {
                // not an html node (probably text)
                return []
            } else {
                let FB_CLASS_FEED_POST = "_1dwg";

                let FB_QUERY_FEED_POST_TEXT = "._5pbx";
                // Posts with links come in different styles. So far I've found:
                // A: Preview image with info box
                // B: large font url
                // C: small font url, may or may not be be combined with A
                let FB_QUERY_FEED_POST_WITH_LINK_A = "._3ekx > a";
                let FB_QUERY_FEED_POST_WITH_LINK_B = "._58jw > p > a";
                let FB_QUERY_FEED_POST_WITH_LINK_C = "._5pbx > p > a";

                let textElements = checkPostText() ? Array.from(addedNode.parentElement.querySelectorAll(FB_QUERY_FEED_POST_TEXT)) : [];
                let query = [FB_QUERY_FEED_POST_WITH_LINK_A, FB_QUERY_FEED_POST_WITH_LINK_B, FB_QUERY_FEED_POST_WITH_LINK_C].join(',');
                let linkElements = checkPostUrls() ? Array.from(addedNode.parentElement.querySelectorAll(query)) : [];

                // A message may or may not include a link.
                // If they do we only want to keep the link, and discard the surrounding element.
                return filterElementsWithLinks(textElements, linkElements, t => findParentElementWithClass(t, FB_CLASS_FEED_POST), l => findParentElementWithClass(l, FB_CLASS_FEED_POST));
            }
        },
    elementToWidgetData:
        function (e) {
            var replyToType = null;
            var replyToId = _findFeedPostId(e);
            if (replyToId != null) {
                replyToType = 'feedpost';
            };
            if (e.tagName=="A") {
                var content = stripFacebookExtras(e.href);
                var contentType = contentTypes.URL;
            } else {
                var content = e.textContent;
                var contentType = contentTypes.TEXT;
            }
            let evaluationPromise = getEvaluationPromise(content, contentType);
            return {
                source:widgetSource.FEEDPOST,
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
            if (e.tagName=="A") {
                FB_CLASS_POST_CONTENTS = "_1dwg";
                FB_CLASS_POST_WITH_LINK_A = "_3ekx";
                let parent = findParentElementWithClass(e, FB_CLASS_POST_CONTENTS);
                if (parent != null) {
                    let typeALinks = parent.getElementsByClassName(FB_CLASS_POST_WITH_LINK_A);
                    if (typeALinks.length > 0) {
                        let typeALink = typeALinks[0];
                        // Don't add a widget if it's already there. This happens for links that
                        // show both the url as a text, and the box with a preview and title.
                        if (typeALink.querySelector(".vliegtuig-widget-div") == null) {
                            typeALink.append(tag);
                        }
                        return;
                    }
                }

                // If we can't find a type A box to add the widget to, then just add it after the link
                e.parentElement.append(tag);
            } else {
                e.insertBefore(tag, e.firstChild);
            }
        }
};

function _findFeedPostId(e) {
    let FB_CLASS_FEEDPOST = '_5pcb';
    let FB_QUERY_COMMENT_FORM_IN_FEEDPORT = '.commentable_item';

    let postElement = findParentElementWithClass(e, FB_CLASS_FEEDPOST);
    if (postElement != null) {
        let formElement=postElement.querySelector(FB_QUERY_COMMENT_FORM_IN_FEEDPORT);
        if (formElement != null ) {
            let hiddenInputWithPostId = formElement.querySelector('[name=ft_ent_identifier]');
            if (hiddenInputWithPostId != null) {
                return hiddenInputWithPostId.value;
            }
        }
    }
    return null;
}