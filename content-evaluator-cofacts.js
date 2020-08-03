// ----------------- Get data from Cofacts -----------------
var _cofactsPromisePerUrl = {}
function cofactsGetEvaluationPromise(content, contentType) {
    return _getCofactsDataPromise(content).then(data => _cofactsDataToEvaluation(data, content, contentType));
}

function _getCofactsDataPromise(content) {
    // Use a temporary Heroku app as a proxy to avoid CORS errors
    return fetch(`https://pure-meadow-03854.herokuapp.com/cofacts?text=${encodeURIComponent(content)}`).then(r => r.json()).then(d => d.data);
}

function _cofactsCheckIfRelevant(article, content, contentType) {
    // For now just check the article is for the same site
    // Should move these checks to the server and do some TdIdf check (like Aunt Meiyu) for contentTypes.TEXT
    if (contentType == contentTypes.URL) {
        if (article.hyperlinks.filter(hyperlink => getSiteFromUrl(hyperlink.url) == getSiteFromUrl(url)).length == 0) {
            return _cofactsNoMatchFoundEvaluation
        }
    }
    return true;
}

function _cofactsDataToEvaluation(data, content, contentType) {
    // Todo, find best matching article and test if it's similar enough
    let edges = data.ListArticles.edges.filter (edge => _cofactsCheckIfRelevant(edge, content, contentType))
    if (edges.length == 0) {
        return {
            icon:iconUnknown,
            unicodeSymbol:"❔",
            imageUrl: URL_QUESTIONMARK_IMAGE,
            alt:"not found",
            text:`No matches were found in Cofacts.`,
            dataFoundFor:content,
            infoLink: null
        };
    }
    let article = edges[0].node;
    let infoLink = `https://cofacts.g0v.tw/article/${article.id}`

    // Type could also be NOT_ARTICLE, but I'm not sure what that's used for.
    let rumorCount = article.articleReplies.filter(reply => reply.reply.type == "RUMOR").length;
    let notRumorCount = article.articleReplies.filter(reply => reply.reply.type == "NOT_RUMOR").length;
    let opinionatedCount = article.articleReplies.filter(reply => reply.reply.type == "OPINIONATED").length;

    let dataFoundFor = article.text;

    if (rumorCount > 0) {
        return {
            icon:iconRed,
            unicodeSymbol:"⚠",
            imageUrl: URL_WARNINGSIGN_IMAGE,
            alt:"unsafe",
            text:`This content is marked as misinformation in Cofacts. Proceed with caution.`,
            dataFoundFor:dataFoundFor,
            infoLink: infoLink
        };       
    } else if (opinionatedCount > 0) {
        return {
            icon:iconOpinion,
            unicodeSymbol:"💬",
            imageUrl: URL_WARNINGSIGN_IMAGE,
            alt:"unsafe",
            text:`This content is marked as containing a personal perspective in Cofacts. Proceed with caution.`,
            dataFoundFor:dataFoundFor,
            infoLink: infoLink
        };
    } else if (notRumorCount > 0) {
        return {
            icon:iconGreen,
            unicodeSymbol:"✔",
            imageUrl: URL_OK_IMAGE,
            alt:"safe",
            text:`This content is marked as true information in Cofacts. It should be safe.`,
            dataFoundFor:dataFoundFor,
            infoLink: infoLink
        };
    } else {
        return {
            icon:iconNotRated,
            unicodeSymbol:"➗",
            imageUrl: URL_QUESTIONMARK_IMAGE,
            alt:"not rated",
            text:`This content is known in Cofacts, but has not yet been rated.`,
            dataFoundFor:dataFoundFor,
            infoLink: infoLink
        };
    }
}
