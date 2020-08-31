chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.contentScriptQuery == 'twiscFetch') {
            if (request.backend == 'cofacts') {
                let content = request.content;
                let hash = request.hash;
                let uriencodedContent = encodeURIComponent(content);
                // Use a temporary Heroku app as a proxy to avoid CORS errors
                var url = `https://pure-meadow-03854.herokuapp.com/cofacts?hash=${hash}`;
                var headers = { text: uriencodedContent };
            } else if (request.backend == 'newsguard') {
                var url = `https://api.newsguardtech.com/check?url=${encodeURIComponent(request.url)}`;
                headers = {};
            }
            console.log('fetching')
            console.log(url)
            fetch(url, { headers: headers })
                .then(r => r.json())
                .then(data => sendResponse({ ok: true, data: data }))
                .catch(error => sendResponse({ ok: false, error: error }));
            return true; // Will respond asynchronously.
        }
});
