// ----------------- Get data from Cofacts -----------------
var _cofactsPromisePerUrl = {}
function cofactsGetURLEvaluationPromise(url) {
    return _getCofactsDataPromise(url).then(data => _cofactsDataToEvaluation(data, url));
}

function _getCofactsDataPromise(url) {
    // Use a temporary Heroku app as a proxy to avoid CORS errors
    return fetch(`https://pure-meadow-03854.herokuapp.com/cofacts?text=${encodeURIComponent(url)}`).then(r => r.json()).then(d => d.data);
}

function _cofactsDataToEvaluation(data, url) {   
    let site = getSiteFromUrl(url);
    let noMatchFound = {
        icon:iconQuestionmark,
        unicodeSymbol:"❔",
        imageUrl: URL_QUESTIONMARK_IMAGE,
        alt:"not found",
        text:`no matching articles were found in Cofacts.`,
        dataFoundFor:site,
        infoLink: null
    }

    let edges = data.ListArticles.edges
    if (edges.length == 0) {
        return noMatchFound;
    }

    // Todo, find best matching article and test if it's similar enough
    let article = edges[0].node;
    let infoLink = `https://cofacts.g0v.tw/article/${article.id}`
    // For now just check the article is for the same site
    if (article.hyperlinks.filter(hyperlink => getSiteFromUrl(hyperlink.url) == getSiteFromUrl(url)).length == 0) {
        return noMatchFound
    }

    rumorCount = article.articleReplies.filter(reply => reply.reply.type == "RUMOR").length;
    notRumorCount = article.articleReplies.filter(reply => reply.reply.type == "NOT_RUMOR").length;
    // notArticleCount = article.articleReplies.filter(reply => reply.reply.type == "NOT_ARTICLE").length;
    opinionatedCount = article.articleReplies.filter(reply => reply.reply.type == "OPINIONATED").length;

    if (rumorCount > 0) {
        return {
            icon:iconRed,
            unicodeSymbol:"⚠",
            imageUrl: URL_WARNINGSIGN_IMAGE,
            alt:"unsafe",
            text:`this article is marked as misinformation in Cofacts. Proceed with caution.`,
            dataFoundFor:url,
            infoLink: infoLink
        };       
    } else if (opinionatedCount > 0) {
        return {
            icon:iconOpinion,
            unicodeSymbol:"💬",
            imageUrl: URL_WARNINGSIGN_IMAGE,
            alt:"unsafe",
            text:`this article is marked as containing a personal perspective in Cofacts. Proceed with caution.`,
            dataFoundFor:url,
            infoLink: infoLink
        };
    } else if (notRumorCount > 0) {
        return {
            icon:iconGreen,
            unicodeSymbol:"✔",
            imageUrl: URL_OK_IMAGE,
            alt:"safe",
            text:`this article is marked as true information in Cofacts. It should be safe.`,
            dataFoundFor:url,
            infoLink: infoLink
        };
    } else {
        return {
            icon:iconGrey,
            unicodeSymbol:"➗",
            imageUrl: URL_QUESTIONMARK_IMAGE,
            alt:"not rated",
            text:`this article is known in Cofacts, but has not yet been rated.`,
            site:site
        };
    }
}
