// ----------------- Get data from Cofacts -----------------
var _cofactsPromisePerUrl = {}
function cofactsGetEvaluationPromise(content, contentType) {
    return _getCofactsDataPromise(content).then(data => _cofactsDataToEvaluation(data, content, contentType));
}

function _getCofactsDataPromise(content) {
    // Use a temporary Heroku app as a proxy to avoid CORS errors
    return fetch(`https://pure-meadow-03854.herokuapp.com/cofacts?text=${encodeURIComponent(content)}`).then(r => r.json()).then(d => d.data);
}

const _cofactsReplyTypes = {
    RUMOR: "RUMOR",
    NOT_RUMOR: "NOT_RUMOR",
    OPINIONATED: "OPINIONATED",
    NOT_ARTICLE: "NOT_ARTICLE"
}

function _cofactsMakeLongText(reply) {
    return `My plugin found this on Cofacts.g0v.tw: \n------------------\n${reply.text}\n${reply.reference}\n------------------\n`;
}

function _cofactsDataToEvaluation(data, content, contentType) {
    // Todo, find best matching article and test if it's similar enough
    let edges = data.ListArticles.edges.filter (edge => edge.node.ismatch)
    if (edges.length == 0) {
        return {
            icon:iconUnknown,
            unicodeSymbol:"❔",
            imageUrl: URL_QUESTIONMARK_IMAGE,
            alt:"not found",
            shortText:`No matches were found in Cofacts.`,
            longText: null,
            dataFoundFor: content,
            infoLink: null,
            showReplyButton: false
        };
    }
    let article = edges[0].node;
    let dataFoundFor = article.text;
    let infoLink = `https://cofacts.g0v.tw/article/${article.id}`

    let rumorCount = article.articleReplies.filter(reply => reply.reply.type == _cofactsReplyTypes.RUMOR).length;
    let notRumorCount = article.articleReplies.filter(reply => reply.reply.type == _cofactsReplyTypes.NOT_RUMOR).length;
    let opinionatedCount = article.articleReplies.filter(reply => reply.reply.type == _cofactsReplyTypes.OPINIONATED).length;

    if (rumorCount > 0) {
        let reply = article.articleReplies.find(reply => reply.reply.type == _cofactsReplyTypes.RUMOR).reply;
        return {
            icon:iconRed,
            unicodeSymbol:"⚠",
            imageUrl: URL_WARNINGSIGN_IMAGE,
            alt:"unsafe",
            shortText:`This content is marked as misinformation in Cofacts. Proceed with caution.`,
            longText: _cofactsMakeLongText(reply),
            dataFoundFor:dataFoundFor,
            infoLink: infoLink,
            showReplyButton: true
        };       
    } else if (opinionatedCount > 0) {
        let reply = article.articleReplies.find(reply => reply.reply.type == _cofactsReplyTypes.OPINIONATED).reply;
        return {
            icon:iconOpinion,
            unicodeSymbol:"💬",
            imageUrl: URL_WARNINGSIGN_IMAGE,
            alt:"unsafe",
            shortText:`This content is marked as containing a personal perspective in Cofacts. Proceed with caution.`,
            longText: _cofactsMakeLongText(reply),
            dataFoundFor:dataFoundFor,
            infoLink: infoLink,
            showReplyButton: true
        };
    } else if (notRumorCount > 0) {
        let reply = article.articleReplies.find(reply => reply.reply.type == _cofactsReplyTypes.NOT_RUMOR).reply;
        return {
            icon:iconGreen,
            unicodeSymbol:"✔",
            imageUrl: URL_OK_IMAGE,
            alt:"safe",
            shortText:`This content is marked as true information in Cofacts. It should be safe.`,
            longText: _cofactsMakeLongText(reply),
            dataFoundFor:dataFoundFor,
            infoLink: infoLink,
            showReplyButton: true
        };
    } else {
        return {
            icon:iconNotRated,
            unicodeSymbol:"➗",
            imageUrl: URL_QUESTIONMARK_IMAGE,
            alt:"not rated",
            shortText:`This content is known in Cofacts, but has not yet been rated.`,
            longText: null,
            dataFoundFor:dataFoundFor,
            infoLink: infoLink,
            showReplyButton: false
        };
    }
}
