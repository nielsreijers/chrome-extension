// ----------------- Add our icon before links -----------------
// handlers for different cases are defined in separate files.

function _makeWidget(linkdata) {
    let icon = document.createElement("img");
    icon.setAttribute("src", iconEmpty.url);
    icon.setAttribute("height", "16");
    icon.setAttribute("width", "16");
    icon.setAttribute("alt", "check");
    icon.onclick = () => handle_widget_clicked();
    icon.onmouseenter = () => handle_widget_mouseenter(linkdata);
    icon.onmouseleave = () => handle_widget_mouseleave();
    // TODO: placement needs some tweaking

    let d = document.createElement("div");
    d.appendChild(icon);

    d.classList.add("vliegtuig-widget-div");
    d.classList.add(iconEmpty.cssClass);
    _showOrHideIconDiv(d);
    linkdata.evaluationPromise.then(evaluation => { 
        icon.setAttribute("src", evaluation.icon.url);
        d.classList.remove(iconEmpty.cssClass);
        d.classList.add(evaluation.icon.cssClass);
        _showOrHideIconDiv(d);
    });

    return d;
}

function _showOrHideIconDiv(iconDiv) {
    widgetIcons.forEach(i => {
        if (iconDiv.classList.contains(i.cssClass)) {
            iconDiv.style.display = getSetting(i.settingName) ? "block" : "none";
        }
    });
}

var handlers = null;
function _getHandlers() {
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

MARKED_LINK_ATTRIBUTE = "VLIEGTUIG_MARKED";
function _isUnmarkedAndMark(e) {
    if (e.getAttribute(MARKED_LINK_ATTRIBUTE) == null) {
        e.setAttribute(MARKED_LINK_ATTRIBUTE, true);
        return true;
    } else {
        return false;
    }
}

function _scanDomAndAddWidgets(addedNode) {
    _getHandlers().forEach(h => {
        elements = h.findLinkElements(addedNode)
                    .filter(_isUnmarkedAndMark)
                    .map(h.elementToLinkData)
                    .filter(linkdata => urlFilter(linkdata.url))
                    .forEach(l => {
                        console.log("adding widget for " + l.url);
                        widget = _makeWidget(l);
                        h.addTagToElement(widget, l.element);
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
                _scanDomAndAddWidgets(addedNode);
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
                Array.from(document.getElementsByClassName("vliegtuig-widget-div")).forEach(_showOrHideIconDiv);
            });
        }
    }
});
