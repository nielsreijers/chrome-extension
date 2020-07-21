getTexts = function(tab) {
    return Array.prototype.map.call(document.querySelectorAll("._5yl5 > span"), x => x.innerText)
}

getLinks = function(tab) {
    return Array.prototype.map.call(document.querySelectorAll("._5yl5 > span > a"), x => x.href)
}

markLinks = function (argument) {
    console.log("HALLO");
    document.querySelectorAll("._5yl5 > span > a").forEach(a => {
        var elem = document.createElement("img");
        elem.setAttribute("src", "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQ7MFCy44fuadGhTjogQ7XbiLE7GyJ648e8Vw&usqp=CAU");
        elem.setAttribute("height", "24");
        elem.setAttribute("width", "24");
        elem.setAttribute("alt", "Flower");
        a.parentElement.appendChild(elem);
        console.log("added image for " + a.href);
    });
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("de post. de post. wat brengt vandaag de post?")
    if (request.action == "getTexts") {
        sendResponse(getTexts());
    } else if (request.action == "getLinks") {
        sendResponse(getLinks());
    } else if (request.action == "markLinks") {
        markLinks();
    } else {
        sendResponse({}); // Send nothing..
    }
});
