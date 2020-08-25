facebookNewFeedPostHandler = {
    findElements:
        function (addedNode) {
            if (addedNode.parentElement == null || addedNode.parentElement == undefined) {
                // not an html node (probably text)
                return []
            } else {
                let FB_CLASS_BLOCK = "sjgh65i0";
                let FB_CLASS_FEED_POST_TEXT = "ii04i59q";

                let FB_QUERY_FEED_POST_TEXT = ".ii04i59q";
                let FB_QUERY_FEED_POST_WITH_LINK_A = "a.py34i1dx";
                let FB_QUERY_FEED_POST_WITH_LINK_B = "a > div > div > div > .sqxagodl";

                // textElements don't seem to have a class that's unique to text in feed posts,
                // but not in message popup boxes.
                // Because we only want to select text on the feed, and not text in messages,
                // we filter by looking for a class that is on every 'block' in the main feed.
                // (could be a post, or one of the intro/photos/friends/etc. blocks to the left)
                let textElements = checkPostText() ? Array.from(addedNode.parentElement.querySelectorAll(FB_QUERY_FEED_POST_TEXT))
                                                          .filter(e => findParentElementWithClass(e, FB_CLASS_BLOCK) != null) : [];
                let linkElements_a = checkPostUrls() ? Array.from(addedNode.parentElement.querySelectorAll(FB_QUERY_FEED_POST_WITH_LINK_A)) : [];
                let linkElements_b = checkPostUrls() ? Array.from(addedNode.parentElement.querySelectorAll(FB_QUERY_FEED_POST_WITH_LINK_B)).map(e => e.parentElement.parentElement.parentElement.parentElement) : [];
                let linkElements = linkElements_a.concat(linkElements_b);

                // A message may or may not include a link.
                // If they do we only want to keep the link, and discard the surrounding element.
                return filterElementsWithLinks(textElements, linkElements, t => t, l => findParentElementWithClass(l, FB_CLASS_FEED_POST_TEXT));
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
                // If the link is in the description box that appears below a preview image,
                // then place the widget inside the span that's found inside the <a>
                let span = e.querySelector('div > div > div.sqxagodl > span')
                if (span != null) {
                    span.insertBefore(tag, span.firstChild);
                } else {
                    e.insertBefore(tag, e.firstChild);
                }
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