// ----------------- Get data from Newsguard -----------------
var popupContentPerUrl = {}
var debug_delay = 4000 // to test if we show the right content if it takes a while to fetch data from NewsGuard and the user points at a different link in the meantime
function newsguardGetURLEvaluationPromise(url) {
    if (popupContentPerUrl[url] == undefined) {
         popupContentPerUrl[url] = _getNewsGuardDataPromise(url).then(data => _newsGuardDataToEvaluation(data, url));
    }
    return popupContentPerUrl[url];
}

function _getNewsGuardDataPromise(url) {
    return fetch(`https://api.newsguardtech.com/check?url=${encodeURIComponent(url)}`).then(r => r.json());
}

function _newsGuardDataToEvaluation(data, url) {   
    if (data.identifier != null) {
        var url = data.identifier;
    } else {
        var url = url;
    }
    site = getSiteFromUrl(url);

    if (data.rank == null) {
        return {
            icon:iconQuestionmark,
            unicodeSymbol:"❔",
            imageUrl: URL_QUESTIONMARK_IMAGE,
            alt:"not found",
            text:`${site} is not in NewsGuard's database.`,
            site:site
        };
    } else if (data.rank == 'P' && data.score == 0) {
        return {
            icon:iconGrey,
            unicodeSymbol:"➗",
            imageUrl: URL_QUESTIONMARK_IMAGE,
            alt:"not rated",
            text:`${site} is in NewsGuard's database, but does not get a score since it publishes content from its users that it does not vet.`,
            site:site
        };
    } else if (data.rank == 'T') {
        return {
            icon:iconGreen,
            unicodeSymbol:"✔",
            imageUrl: URL_OK_IMAGE,
            alt:"safe",
            text:`${site} gets a score of ${data.score} in NewsGuard's database. It should be safe.`,
            site:site
        };
    } else if (data.rank == 'N') {
        return {
            icon:iconRed,
            unicodeSymbol:"⚠",
            imageUrl: URL_WARNINGSIGN_IMAGE,
            alt:"unsafe",
            text:`${site} gets a score of ${data.score} in NewsGuard's database. Proceed with caution.`,
            site:site
        };
    } else {
        return {
            icon:iconQuestionmark,
            unicodeSymbol:"❔",
            imageUrl: URL_QUESTIONMARK_IMAGE,
            alt:"unsure",
            text:`${site} gets rank ${data.rank} and a score of ${data.score} in NewsGuard's database.`,
            site:site
        };
    }
}
