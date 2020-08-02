facebookFeedPostHandler = {
    findLinkElements:
        function (addedNode) {
            if (addedNode.parentElement == null || addedNode.parentElement == undefined) {
                // not an html node (probably text)
                return []
            } else {
                let FB_QUERY_FEED_POST_WITH_LINK_A = "._3ekx > a"
                let FB_QUERY_FEED_POST_WITH_LINK_B = "._58jw > p > a"

                return Array.from(addedNode.parentElement.querySelectorAll(FB_QUERY_FEED_POST_WITH_LINK_A)).concat(
                       Array.from(addedNode.parentElement.querySelectorAll(FB_QUERY_FEED_POST_WITH_LINK_B)));
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
    addTagToElement:
        function (tag, e) {
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