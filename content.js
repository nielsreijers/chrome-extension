getTexts = function(tab) {
    return Array.prototype.map.call(document.querySelectorAll("._5yl5 > span"), x => x.innerText)
}

getLinks = function(tab) {
    return Array.prototype.map.call(document.querySelectorAll("._5yl5 > span > a"), x => x.href)
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("de post. de post. wat brengt vandaag de post?")
    if (request.action == "getTexts") {
        sendResponse(getTexts());
    } else if (request.action == "getLinks") {
        sendResponse(getLinks());
    } else {
        sendResponse({}); // Send nothing..
    }
});
