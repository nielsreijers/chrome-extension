function sendFbMessage(params) {
    const http = new XMLHttpRequest();
    const url = 'https://mbasic.facebook.com/messages/send/';
    http.open("POST", url);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    http.withCredentials = true;
    // fb_dtsg is the token that identifies the current user.
    // There are usually 3 elements with a token found in the document, but they all seem to work.
    params['fb_dtsg'] = document.getElementsByName("fb_dtsg")[0].value;

    // convert object to list -- to enable .map
    let data = Object.entries(params);
    // encode every parameter (unpack list into 2 variables)
    data = data.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    // combine into string
    let b = data.join('&');

    http.send(b);
}

function sendFbMessageWithImage(params, imageUrl) {
    const http = new XMLHttpRequest();
    const url = 'https://upload.facebook.com/_mupload_/mbasic/messages/attachment/photo/';
    http.open("POST", url);
    http.withCredentials = true;

    let data = new FormData();
    for (let [key, value] of Object.entries(params)) {
        data.append(key, value);
    }
    // fb_dtsg is the token that identifies the current user.
    // There are usually 3 elements with a token found in the document, but they all seem to work.
    data.append('fb_dtsg', document.getElementsByName("fb_dtsg")[0].value);
    data.append('file1', "vliegtuig.jpg");

    fetch(imageUrl).then(r => r.blob()).then(image => {
        data.append('vliegtuig.jpg', image);
        http.send(data);
    });
}

function sendFbMessageToUser(message, imageUrl, friend_id) {
    let params = {}
    params['body'] = message;
    params[`ids[${friend_id}]`] = friend_id;
    if (imageUrl != null) {
        sendFbMessageWithImage(params, imageUrl);
    } else {
        sendFbMessage(params);        
    }
}

function sendFbMessageToGroup(message, imageUrl, thread_id) {
    let params = {}
    params['body'] = message;
    params['tids'] = `cid.g.${thread_id}`;
    if (imageUrl != null) {
        sendFbMessageWithImage(params, imageUrl);
    } else {
        sendFbMessage(params);        
    }
}

function findFantaTab(tabType, messageElement) {
    re = new RegExp(`fantaTabMain-${tabType}:([0-9]+)`);
    e = messageElement;
    while (e != null) {
        c = e.getAttribute("class");
        match = re.exec(c);
        if (match != null) {
            return match[1];
        }
        e = e.parentElement;
    }
    return null;    
}

function findFacebookUserId(messageElement) {
    return findFantaTab('user', messageElement);
}

function findFacebookGroupId(messageElement) {
    return findFantaTab('thread', messageElement);
}

function stripFbLinkRedirect(url) {
    if (url.startsWith('https://l.facebook.com/l.php?u')) {
        let params = new URLSearchParams(url.substr(url.indexOf('?')+1));
        return decodeURIComponent(params.get('u'));
    } else {
        return url;
    }
}
