// ----------------- Get data from Newsguard -----------------
var _newsguardPromisePerUrl = {}
function newsguardGetEvaluationPromise(content, contentType) {
    let url = content;

    if (_newsguardPromisePerUrl[url] == undefined) {
         _newsguardPromisePerUrl[url] = _getNewsGuardDataPromise(url).then(data => _newsGuardDataToEvaluation(data, url));
    }
    return _newsguardPromisePerUrl[url];
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
    var site = getSiteFromUrl(url);
    site = capitalise(site);

    if (data.rank == null) {
        return {
            icon: iconUnknown,
            unicodeSymbol: "❔",
            imageUrl:  URL_QUESTIONMARK_IMAGE,
            alt: "not found",
            text: `${site} is not in NewsGuard's database.`,
            dataFoundFor: site,
            infoLink: null
        };
    } else if (data.rank == 'N') {
        return {
            icon: iconRed,
            unicodeSymbol: "⚠",
            imageUrl:  URL_WARNINGSIGN_IMAGE,
            alt: "unsafe",
            text: `${site} gets a score of ${data.score} in NewsGuard's database. Proceed with caution.`,
            dataFoundFor: site,
            infoLink: null
        };
    } else if (data.rank == 'P' && data.score == 0) {
        return {
            icon: iconNotRated,
            unicodeSymbol: "➗",
            imageUrl:  URL_QUESTIONMARK_IMAGE,
            alt: "not rated",
            text: `${site} is in NewsGuard's database, but does not get a score since it publishes content from its users that it does not vet.`,
            dataFoundFor: site,
            infoLink: null
        };
    } else if (data.rank == 'T') {
        return {
            icon: iconGreen,
            unicodeSymbol: "✔",
            imageUrl:  URL_OK_IMAGE,
            alt: "safe",
            text: `${site} gets a score of ${data.score} in NewsGuard's database. It should be safe.`,
            dataFoundFor: site,
            infoLink: null
        };
    } else {
        return {
            icon: iconNotRated,
            unicodeSymbol: "❔",
            imageUrl:  URL_QUESTIONMARK_IMAGE,
            alt: "unsure",
            text: `${site} gets rank ${data.rank} and a score of ${data.score} in NewsGuard's database.`,
            dataFoundFor: site,
            infoLink: null
        };
    }
}
