// ----------------- Add our icon before links -----------------
// handlers for different cases are defined in separate files.

function _makeWidget(widgetdata) {
    let icon = document.createElement("img");
    icon.setAttribute("src", iconLoading.url);
    icon.setAttribute("height", "16");
    icon.setAttribute("width", "16");
    icon.setAttribute("alt", "check");
    icon.onclick = () => handle_widget_clicked();
    icon.onmouseenter = () => handle_widget_mouseenter(widgetdata);
    icon.onmouseleave = () => handle_widget_mouseleave();
    // TODO: placement needs some tweaking

    let d = document.createElement("div");
    d.appendChild(icon);

    d.classList.add("vliegtuig-widget-div");
    d.classList.add(iconLoading.cssClass);
    _showOrHideIconDiv(d);
    widgetdata.evaluationPromise.then(evaluation => { 
        icon.setAttribute("src", evaluation.icon.url);
        d.classList.remove(iconLoading.cssClass);
        d.classList.add(evaluation.icon.cssClass);
        _showOrHideIconDiv(d);
    }).catch(error => {
        icon.setAttribute("src", iconError.url);
    });

    return d;
}

function _showOrHideIconDiv(iconDiv) {
    widgetIcons.forEach(i => {
        if (iconDiv.classList.contains(i.cssClass)) {
            iconDiv.style.display = getSetting(i.settingName) ? "inline-block" : "none";
        }
    });
}

var handlers = null;
function _getHandlers() {
    // Lazy load because the handlers may not have been loaded when this file is run.
    if (handlers == null) {
        if (window.location.href.startsWith('https://www.messenger.com') || window.location.href.startsWith('https://www.facebook.com/messages')) {
            handlers = [facebookMessengerHandler];
        } else if (window.location.href.startsWith('https://www.facebook.com')) {
            handlers = [facebookFeedMessageboxHandler,
                        facebookFeedPostHandler];
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
    measurePerformance('_scanDomAndAddWidgets', () => {
        _getHandlers().forEach(h => {
            elements = h.findElements(addedNode)
                        .filter(_isUnmarkedAndMark)
                        .map(h.elementToWidgetData)
                        .filter(widgetdata => widgetdata.evaluationPromise != null) // promise==null if the element shouldn't be evaluated (trusted site, too short, etc.) This is determined in getEvaluationPromise().
                        .forEach(widgetdata => {
                            console.log("adding widget for " + widgetdata.content);
                            widget = _makeWidget(widgetdata);
                            h.addWidgetToElement(widget, widgetdata.element);
                        });
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
