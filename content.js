// ----------------- debug stuff -----------------
function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

// // Usage!
// sleep(500).then(() => {
//     // Do something after the sleep!
// });


// ----------------- helpers -----------------
function findParentElementWithClass(e, partialClass) {
    while (e != null) {
        c = e.className
        // Search up to find the top level of this message
        if (c != undefined && c.includes(partialClass)) {
            return e;
        }
        e = e.parentElement;
    }
    return null;
}

performanceCounters = {};
function measurePerformance(countername, f) {
    let start = performance.now();
    let result = f();
    let stop = performance.now();

    if (!performanceCounters.hasOwnProperty(countername)) {
        performanceCounters[countername] = stop - start;
    } else {
        performanceCounters[countername] += stop - start;        
    }

    return result;
}

function capitalise(s) {
    return s[0].toUpperCase() + s.substr(1)
}

function uncapitalise(s) {
    return s[0].toLowerCase() + s.substr(1)
}

// ----------------- Initialisation -----------------


// // Listener to communicate with extension popup (not really using it right now, but may be useful later)
// chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
//     if (request.action == "getTexts") {
//         sendResponse(Array.prototype.map.call(getConversationTexts(document)), x => x.innerText);
//     } else if (request.action == "getLinks") {
//         sendResponse(Array.prototype.map.call(getConversationLinks(document), x => x.href));
//     } else if (request.action == "markLinks") {
//         markLinks(document);
//     } else {
//         sendResponse({}); // Send nothing..
//     }
// });


