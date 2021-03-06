function _sendFbMessage(params) {
    let http = new XMLHttpRequest();
    let url = 'https://mbasic.facebook.com/messages/send/';
    http.open("POST", url);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    http.withCredentials = true;
    // fb_dtsg is the token that identifies the current user.
    // There are usually 3 elements with a token found in the document, but they all seem to work.
    params['fb_dtsg'] = _getDtsgToken();

    b = _queryFormatParams(params);

    http.send(b);
}

function _sendFbMessageWithImage(params, imageUrl) {
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
    data.append('fb_dtsg', _getDtsgToken());
    data.append('file1', "vliegtuig.jpg");

    fetch(imageUrl).then(r => r.blob()).then(image => {
        data.append('vliegtuig.jpg', image);
        http.send(data);
    });
}

function _postFbComment(message, post_id) {
    let queryParams = {}
    queryParams['ft_ent_identifier'] = post_id;

    let http = new XMLHttpRequest();
    let url = `https://mbasic.facebook.com/a/comment.php?${_queryFormatParams(queryParams)}`;
    http.open("POST", url);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    http.withCredentials = true;

    let bodyParams = {}
    bodyParams['fb_dtsg'] = _getDtsgToken();
    bodyParams['comment_text'] = message;

    b = _queryFormatParams(bodyParams);

    http.send(b);
}

function _postFbCommentWithImage(message, imageUrl, post_id) {
    let queryParams = {}
    queryParams['ft_ent_identifier'] = post_id;

    let http = new XMLHttpRequest();
    let url = `https://upload.facebook.com/_mupload_/ufi/mbasic/advanced/?${_queryFormatParams(queryParams)}`;
    http.open("POST", url);
    http.withCredentials = true;

    let data = new FormData();
    // fb_dtsg is the token that identifies the current user.
    // There are usually 3 elements with a token found in the document, but they all seem to work.
    data.append('fb_dtsg', _getDtsgToken());
    data.append('photo', "vliegtuig.jpg");
    data.append('comment_text', message);

    fetch(imageUrl).then(r => r.blob()).then(image => {
        data.append('vliegtuig.jpg', image);
        http.send(data);
    });
}

function facebookSendOrPostReply(widgetdata, message, imageUrl) {
    if (widgetdata.replyToType == 'user') {
        let params = {}
        params['body'] = message;
        params[`ids[${widgetdata.replyToId}]`] = widgetdata.replyToId;
        if (imageUrl != null) {
            _sendFbMessageWithImage(params, imageUrl);
        } else {
            _sendFbMessage(params);        
        }
    } else if (widgetdata.replyToType == 'group') {
        let params = {}
        params['body'] = message;
        params['tids'] = `cid.g.${widgetdata.replyToId}`;
        if (imageUrl != null) {
            _sendFbMessageWithImage(params, imageUrl);
        } else {
            _sendFbMessage(params);        
        }
    } else if (widgetdata.replyToType == 'feedpost') {
        if (imageUrl != null) {
            _postFbCommentWithImage(message, imageUrl, widgetdata.replyToId);
        } else {
            _postFbComment(message, widgetdata.replyToId);
        }
    }
}

function _queryFormatParams(params) {
    // convert object to list -- to enable .map
    let data = Object.entries(params);
    // encode every parameter (unpack list into 2 variables)
    data = data.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    // combine into string
    let b = data.join('&');

    return b;
}

function stripFacebookExtras(url) {
    return _stripFbClid(_stripFbLinkRedirect(url));
}

function _stripFbLinkRedirect(url) {
    if (url.startsWith('https://l.facebook.com/l.php?u')
        || url.startsWith('https://l.messenger.com/l.php?u')) {
        let params = new URLSearchParams(url.substr(url.indexOf('?')+1));
        return decodeURIComponent(params.get('u'));
    } else {
        return url;
    }
}

function _stripFbClid(url) {
    if (url.indexOf("fbclid=") != -1) {
        return url.substring(0, url.indexOf("fbclid=") - 1); // -1 to also strip the ? or &
    } else {
        return url;
    }
}

var _dtsgToken = null
function _getDtsgToken() {
    // This works on old facebook.com
    if (_dtsgToken == null) {
        var dtsgElement = document.getElementsByName("fb_dtsg")[0];
        if (dtsgElement != undefined) {
            _dtsgToken = dtsgElement.value;
        }
    }
    // This works on messenger.com
    if (_dtsgToken == null) {
        var headtext = document.head.innerText;
        let re = new RegExp(`\{\"token\":\"([^"]*)`);
        let match = re.exec(headtext);
        if (match != null) {
            _dtsgToken = match[1];
        }

    }
    // This works on new facebook.com
    if (_dtsgToken == null) {
        var headtext = document.body.innerHTML;
        let re = new RegExp(`\{\"token\":\"([^"]*)`);
        let match = re.exec(headtext);
        if (match != null) {
            _dtsgToken = match[1];
        }

    }
    return _dtsgToken;
}
