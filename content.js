

// ----------------- debug stuff -----------------
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

// // Usage!
// sleep(500).then(() => {
//     // Do something after the sleep!
// });




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


