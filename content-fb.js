function sendFbMessage(params) {
    let http = new XMLHttpRequest();
    let url = 'https://mbasic.facebook.com/messages/send/';
    http.open("POST", url);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    http.withCredentials = true;
    // fb_dtsg is the token that identifies the current user.
    // There are usually 3 elements with a token found in the document, but they all seem to work.
    params['fb_dtsg'] = getDtsgToken();

    b = queryFormatParams(params);

    http.send(b);
}

function sendFbMessageWithImage(params, imageUrl) {
    let http = new XMLHttpRequest();
    let url = 'https://upload.facebook.com/_mupload_/mbasic/messages/attachment/photo/';
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

function postFbComment(message, post_id) {
    let queryParams = {}
    queryParams['ft_ent_identifier'] = post_id;

    let http = new XMLHttpRequest();
    let url = `https://mbasic.facebook.com/a/comment.php?${queryFormatParams(queryParams)}`;
    http.open("POST", url);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    http.withCredentials = true;

    let bodyParams = {}
    bodyParams['fb_dtsg'] = getDtsgToken();
    bodyParams['comment_text'] = message;

    b = queryFormatParams(bodyParams);

    http.send(b);
}

function postFbCommentWithImage(message, imageUrl, post_id) {
    let queryParams = {}
    queryParams['ft_ent_identifier'] = post_id;

    let http = new XMLHttpRequest();
    let url = `https://upload.facebook.com/_mupload_/ufi/mbasic/advanced/?${queryFormatParams(queryParams)}`;
    http.open("POST", url);
    http.withCredentials = true;

    let data = new FormData();
    // fb_dtsg is the token that identifies the current user.
    // There are usually 3 elements with a token found in the document, but they all seem to work.
    data.append('fb_dtsg', getDtsgToken());
    data.append('photo', "vliegtuig.jpg");
    data.append('comment_text', message);

    fetch(imageUrl).then(r => r.blob()).then(image => {
        data.append('vliegtuig.jpg', image);
        http.send(data);
    });
}

function facebookSendOrPostReply(message, imageUrl, id_type, id) {
    if (id_type == 'user') {
        let params = {}
        params['body'] = message;
        params[`ids[${id}]`] = id;
        if (imageUrl != null) {
            sendFbMessageWithImage(params, imageUrl);
        } else {
            sendFbMessage(params);        
        }
    } else if (id_type == 'group') {
        let params = {}
        params['body'] = message;
        params['tids'] = `cid.g.${id}`;
        if (imageUrl != null) {
            sendFbMessageWithImage(params, imageUrl);
        } else {
            sendFbMessage(params);        
        }
    } else if (id_type == 'feedpost') {
        if (imageUrl != null) {
            postFbCommentWithImage(message, imageUrl, id);
        } else {
            postFbComment(message, id);
        }
    }
}

function queryFormatParams(params) {
    // convert object to list -- to enable .map
    let data = Object.entries(params);
    // encode every parameter (unpack list into 2 variables)
    data = data.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    // combine into string
    let b = data.join('&');

    return b;
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
