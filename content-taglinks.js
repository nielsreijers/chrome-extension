// ----------------- Add our icon before links -----------------
// handlers for different cases are defined in separate files.
MARKED_LINK_ATTRIBUTE = "VLIEGTUIG_MARKED";
function getUnmarkedElementsAndMark(elements) {
    let newElements = elements.filter(e => e.getAttribute(MARKED_LINK_ATTRIBUTE) == null);
    newElements.forEach(e => e.setAttribute(MARKED_LINK_ATTRIBUTE, true));
    return newElements;
}

function makeLinkTag(linkdata) {
    let icon = document.createElement("img");
    icon.setAttribute("src", iconImgEmpty);
    icon.setAttribute("height", "24");
    icon.setAttribute("width", "24");
    icon.setAttribute("alt", "check");
    icon.onclick = () => handle_icon_clicked();
    icon.onmouseenter = () => handle_icon_mouseenter_icon(linkdata);
    icon.onmouseleave = () => handle_icon_mouseleave_icon();
    linkdata.evaluationPromise.then(evaluation => icon.setAttribute("src", evaluation.icon));
    // TODO: placement needs some tweaking

    let d = document.createElement("div");
    d.setAttribute("class", "vliegtuig-icon-div");
    d.appendChild(icon);

    return d;
}

function tagLinks(parent) {
    handlers = [contentFbMessageboxHandler];
    handlers.forEach(h => {
        elements = h.findLinkElements(parent);
        elements = getUnmarkedElementsAndMark(elements);
        linkdatas = elements.map(h.elementToLinkData);
        linkdatas.forEach(l => {
            tag = makeLinkTag(l);
            h.addTagToElement(tag, l.element);
            console.log("added tag for " + l.url);
        });
    });
}

// ----------------- Initialisation -----------------
// Create an Observer to monitor DOM changes and add
// our icon to any links found in conversations.
let domObserver = new MutationObserver(mutations => {
    for(let mutation of mutations) {
        for(let addedNode of mutation.addedNodes) {
            tagLinks(addedNode);
        }
    }
});
domObserver.observe(document, { childList: true, subtree: true });