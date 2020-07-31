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
    icon.setAttribute("src", iconEmpty.url);
    icon.setAttribute("height", "16");
    icon.setAttribute("width", "16");
    icon.setAttribute("alt", "check");
    icon.onclick = () => handle_icon_clicked();
    icon.onmouseenter = () => handle_icon_mouseenter_icon(linkdata);
    icon.onmouseleave = () => handle_icon_mouseleave_icon();
    // TODO: placement needs some tweaking

    let d = document.createElement("div");
    d.appendChild(icon);

    d.classList.add("vliegtuig-icon-div");
    d.classList.add(iconEmpty.cssClass);
    showOrHideIconDiv(d);
    linkdata.evaluationPromise.then(evaluation => { 
        icon.setAttribute("src", evaluation.icon.url);
        d.classList.remove(iconEmpty.cssClass);
        d.classList.add(evaluation.icon.cssClass);
        showOrHideIconDiv(d);
    });

    return d;
}

function showOrHideIconDiv(iconDiv) {
    tagIcons.forEach(i => {
        if (iconDiv.classList.contains(i.cssClass)) {
            iconDiv.style.display = getSetting(i.settingName) ? "block" : "none";
        }
    });
}

var handlers = null;
function getHandlers() {
    // Lazy load because the handlers may not have been loaded when this file is run.
    if (handlers == null) {
        if (window.location.href.startsWith('https://www.facebook.com')) {
            handlers = [facebookFeedMessageboxHandler,
                        facebookFeedPostHandler];
        } else if (window.location.href.startsWith('https://www.messenger.com')) {
            handlers = [facebookMessengerHandler];
        } else {
            handlers = [];
        }        
    }
    return handlers;
}

function tagLinks(addedNode) {
    getHandlers().forEach(h => {
        elements = h.findLinkElements(addedNode);
        elements = getUnmarkedElementsAndMark(elements);
        elements.map(h.elementToLinkData)
                .filter(linkdata => urlFilter(linkdata.url))
                .forEach(l => {
                    console.log("adding tag for " + l.url);
                    tag = makeLinkTag(l);
                    h.addTagToElement(tag, l.element);
                });
    });
}

// ----------------- Initialisation -----------------
// Create an Observer to monitor DOM changes and add
// our icon to any links found in conversations.
loadSettings().then(() => {
    let domObserver = new MutationObserver(mutations => {
        for(let mutation of mutations) {
            for(let addedNode of mutation.addedNodes) {
                tagLinks(addedNode);
            }
        }
    });
    domObserver.observe(document, { childList: true, subtree: true });
});

// Update icon visibility if settings change
chrome.storage.sync.onChanged.addListener(function(changes, namespace) {
    for (var key in changes) {
        if (isSettingsKey(key)) {
            reloadSettings().then(() => {
                Array.from(document.getElementsByClassName("vliegtuig-icon-div")).forEach(showOrHideIconDiv);
            });
        }
    }
});
