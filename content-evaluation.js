// ----------------- Get data from Newsguard -----------------
var popupContentPerUrl = {}
var debug_delay = 4000 // to test if we show the right content if it takes a while to fetch data from NewsGuard and the user points at a different link in the meantime
function getURLEvaluationPromise(url) {
    if (popupContentPerUrl[url] == undefined) {
         // popupContentPerUrl[url] = new Promise(resolve => {
         //     let content = document.createElement("div");
         //     content.innerText = `NewsGuard data for ${url} goes here...`;
         //     sleep(debug_delay).then(() => resolve(content));
         //     debug_delay /= 2;
         // });
         popupContentPerUrl[url] = getNewsGuardDataPromise(url).then(data => newsGuardDataToEvaluation(data, url));
    }
    return popupContentPerUrl[url];
}

function getNewsGuardDataPromise(url) {
    return fetch(`https://api.newsguardtech.com/check?url=${encodeURIComponent(url)}`).then(r => r.json());
}

function getSiteFromUrl(url) {
    let trim = (s, prefix) => { if (s.startsWith(prefix)) { return s.substring(prefix.length); } else { return s; } };
    url = trim(url, 'https://');
    url = trim(url, 'http://');
    url = trim(url, 'www.');
    if (url.endsWith('/')) {
        url = url.substring(0, url.length - 1);
    }
    if (url.indexOf('/', url.indexOf('.')) != -1) {
        // strip anything after the hostname
        url = url.substring(0, url.indexOf('/', url.indexOf('.')));
    }
    return url;
}

function newsGuardDataToEvaluation(data, url) {   
    if (data.identifier != null) {
        var url = data.identifier;
    } else {
        var url = url;
    }
    site = getSiteFromUrl(url);

    if (data.rank == null) {
        return {
            icon:iconImgQuestionmark,
            unicodeSymbol:"❔",
            imageUrl: URL_QUESTIONMARK_IMAGE,
            alt:"not found",
            text:`${site} is not in NewsGuard's database.`,
            site:site
        };
    } else if (data.rank == 'P' && data.score == 0) {
        return {
            icon:iconImgGrey,
            unicodeSymbol:"➗",
            imageUrl: URL_QUESTIONMARK_IMAGE,
            alt:"not rated",
            text:`${site} is in NewsGuard's database, but does not get a score since it publishes content from its users that it does not vet.`,
            site:site
        };
    } else if (data.rank == 'T') {
        return {
            icon:iconImgGreen,
            unicodeSymbol:"✔",
            imageUrl: URL_OK_IMAGE,
            alt:"safe",
            text:`${site} gets a score of ${data.score} in NewsGuard's database. It should be safe.`,
            site:site
        };
    } else if (data.rank == 'N') {
        return {
            icon:iconImgRed,
            unicodeSymbol:"⚠",
            imageUrl: URL_WARNINGSIGN_IMAGE,
            alt:"unsafe",
            text:`${site} gets a score of ${data.score} in NewsGuard's database. Proceed with caution.`,
            site:site
        };
    } else {
        return {
            icon:iconImgQuestionmark,
            unicodeSymbol:"❔",
            imageUrl: URL_QUESTIONMARK_IMAGE,
            alt:"unsure",
            text:`${site} gets rank ${data.rank} and a score of ${data.score} in NewsGuard's database.`,
            site:site
        };
    }
}
