const contentTypes = {
    URL: 'url',
    TEXT: 'text'
}

function getEvaluationPromise(content, contentType) {
    // TODO: use newsguard or cofact based on settings.
    if (getSetting(SETTING_EVALUATOR) == 'cofacts') {
        return cofactsGetEvaluationPromise(content, contentType);
    } else {
        return newsguardGetEvaluationPromise(content, contentType);
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