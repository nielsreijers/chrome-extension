// ----------------- Get data from Newsguard -----------------
var _newsguardPromisePerUrl = {}
function newsguardGetEvaluationPromise(content, contentType) {
    if (contentType == contentTypes.URL) {
        let url = content;

        if (_newsguardPromisePerUrl[url] == undefined) {
             _newsguardPromisePerUrl[url] = _getNewsGuardDataPromise(url).then(data => _newsGuardDataToEvaluation(data, url));
        }
        return _newsguardPromisePerUrl[url];
    } else {
        return new Promise((resolve) => resolve({
            icon: iconUnknown,
            unicodeSymbol: "❔",
            imageUrl:  URL_QUESTIONMARK_IMAGE,
            alt: "not found",
            shortText: `NewsGuard cannot check post/message texts, only links.`,
            longText: null,
            dataFoundFor: content,
            infoLink: null,
            showReplyButton: false
        }));
    }
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
            shortText: `${site} is not in NewsGuard's database.`,
            longText: null,
            dataFoundFor: site,
            infoLink: null,
            showReplyButton: false
        };
    } else if (data.rank == 'N') {
        return {
            icon: iconRed,
            unicodeSymbol: "⚠",
            imageUrl:  URL_WARNINGSIGN_IMAGE,
            alt: "unsafe",
            shortText: `${site} gets a score of ${data.score} in NewsGuard's database. Proceed with caution.`,
            longText: null,
            dataFoundFor: site,
            infoLink: null,
            showReplyButton: true
        };
    } else if (data.rank == 'P' && data.score == 0) {
        return {
            icon: iconNotRated,
            unicodeSymbol: "➗",
            imageUrl:  URL_QUESTIONMARK_IMAGE,
            alt: "not rated",
            shortText: `${site} is in NewsGuard's database, but does not get a score since it publishes content from its users that it does not vet.`,
            longText: null,
            dataFoundFor: site,
            infoLink: null,
            showReplyButton: false
        };
    } else if (data.rank == 'T') {
        return {
            icon: iconGreen,
            unicodeSymbol: "✔",
            imageUrl:  URL_OK_IMAGE,
            alt: "safe",
            shortText: `${site} gets a score of ${data.score} in NewsGuard's database. It should be safe.`,
            longText: null,
            dataFoundFor: site,
            infoLink: null,
            showReplyButton: true
        };
    } else {
        return {
            icon: iconNotRated,
            unicodeSymbol: "❔",
            imageUrl:  URL_QUESTIONMARK_IMAGE,
            alt: "unsure",
            shortText: `${site} gets rank ${data.rank} and a score of ${data.score} in NewsGuard's database.`,
            longText: null,
            dataFoundFor: site,
            infoLink: null,
            showReplyButton: false
        };
    }
}
