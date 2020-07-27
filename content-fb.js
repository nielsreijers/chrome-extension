function sendFbMessage(params) {
    const http = new XMLHttpRequest();
    const url = 'https://mbasic.facebook.com/messages/send/';
    http.open("POST", url);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    http.withCredentials = true;
    // fb_dtsg is the token that identifies the current user.
    // There are usually 3 elements with a token found in the document, but they all seem to work.
    params['fb_dtsg'] = getDtsgToken();

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
    data.append('fb_dtsg', getDtsgToken());
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

function stripFbLinkRedirect(url) {
    if (url.startsWith('https://l.facebook.com/l.php?u')
        || url.startsWith('https://l.messenger.com/l.php?u')) {
        let params = new URLSearchParams(url.substr(url.indexOf('?')+1));
        return decodeURIComponent(params.get('u'));
    } else {
        return url;
    }
}

var dtsgToken = null
function getDtsgToken() {
    // This works on facebook.com
    if (dtsgToken == null) {
        var dtsgElement = document.getElementsByName("fb_dtsg")[0];
        if (dtsgElement != undefined) {
            dtsgToken = dtsgElement.value;
        }
    }
    // This works on messenger.com
    if (dtsgToken == null) {
        var headtext = document.head.innerText;
        let re = new RegExp(`\{\"token\":\"([^"]*)`);
        let match = re.exec(headtext);
        if (match != null) {
            dtsgToken = match[1];
        }

    }
    return dtsgToken;
}

