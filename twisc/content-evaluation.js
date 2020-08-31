const contentTypes = {
    URL: 'url',
    TEXT: 'text'
}

function fetchFromBackgroundPage(message) {
    message.contentScriptQuery = 'twiscFetch';
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message,
            result => {
                if (result.ok) {
                    resolve(result.data);
                } else {
                    reject(result.error);
                }
            });
    });
}

function isLinkToCheck(url) {
    url = stripFacebookExtras(url);
    return url.startsWith('http')                           // Filter out local links like "/<facebook id>"
           && !url.startsWith('https://www.facebook.com')   // Filter out links to facebook, messenger and cofacts
           && !url.startsWith('https://www.messenger.com')
           && !url.startsWith('https://cofacts.g0v.tw')
           ;
}

function _isContentToEvaluate(content, contentType) {
    if (contentType == contentTypes.URL) {
        return isLinkToCheck(content)
    } else {
        return content.length > 10
                && content != 'Thumbs-up sign'
                && content != 'You unsent a message';
    }
}

function getEvaluationPromise(content, contentType) {
    if (_isContentToEvaluate(content, contentType)) {
        if (getSetting(SETTING_EVALUATOR) == evaluator.COFACTS) {
            return cofactsGetEvaluationPromise(content, contentType);
        } else {
            return newsguardGetEvaluationPromise(content, contentType);
        }
    } else {
        return null;
    }
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

function evaluationToReplyMessageText(evaluation) {
    if (evaluation.longText != null) {
        var message = evaluation.longText;
    } else {
        var message = "My extension found that " + uncapitalise(evaluation.shortText);
    }

    if (evaluation.infoLink) {
        message += `\nMore information can be found here: ${evaluation.infoLink}`;
    }
    return message;
}