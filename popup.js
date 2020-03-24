let changeColor = document.getElementById('changeColor');

chrome.storage.sync.get('color', function(data) {
    changeColor.style.backgroundColor = data.color;
    changeColor.setAttribute('value', data.color);
    console.log("Button color has been set.");
});

changeColor.onclick = function(element) {
    let color = element.target.value;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.executeScript(
            tabs[0].id,
            {code: 'document.body.style.backgroundColor = "' + color + '"; console.log("backgroundColor has been set.");'});
    });
    console.log("Button onclick has finished.");
};

getTitle.onclick = function(element) {
    chrome.tabs.getSelected(null, function(tab) {
        title = tab.title;
        document.getElementById("title").innerHTML = title;
        console.log("The title is: " + title);
    });
}

console.log("popup.js has finished.");