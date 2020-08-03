facebookFeedPostHandler = {
    findLinkElements:
        function (addedNode) {
            if (addedNode.parentElement == null || addedNode.parentElement == undefined) {
                // not an html node (probably text)
                return []
            } else {
                // Posts with links come in different styles. So far I've found:
                // A: Preview image with info box
                // B: large font url
                // C: small font url, may or may not be be combined with A

                let FB_QUERY_FEED_POST_WITH_LINK_A = "._3ekx > a";
                let FB_QUERY_FEED_POST_WITH_LINK_B = "._58jw > p > a";
                let FB_QUERY_FEED_POST_WITH_LINK_C = "._5pbx > p > a";
                let query = [FB_QUERY_FEED_POST_WITH_LINK_A, FB_QUERY_FEED_POST_WITH_LINK_B, FB_QUERY_FEED_POST_WITH_LINK_C].join(',');
                return Array.from(addedNode.parentElement.querySelectorAll(query));
            }
        },
    elementToLinkData:
        function (e) {
            var reply_to_type = null;
            var reply_to_id = _findFeedPostId(e);
            if (reply_to_id != null) {
                reply_to_type = 'feedpost';
            };
            let url = stripFacebookExtras(e.href);
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