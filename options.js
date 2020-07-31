// let icons = document.getElementById('VLIEGTUIG_SETTINGS_ICONS_TO_ADD');

// function addInput(imgSrc, txt, settingName) {
//     checkbox = document.createElement("input");
//     checkbox.setAttribute("type", "checkbox");
//     checkbox.innerHTML = `<img src="${imgSrc}" width=16 height=16>${txt}`;
//     icons.appendChild(c);
// }

// addInput('images/check-t-green.png', 'Links marked safe', "mark-green");


// const kButtonColors = ['#3aa757', '#e8453c', '#f9bb2d', '#4688f1'];
// function constructOptions(kButtonColors) {
//     for (let item of kButtonColors) {
//         let button = document.createElement('button');
//         button.style.backgroundColor = item;
//         button.addEventListener('click', function () {
//             chrome.storage.sync.set({color: item}, function() {
//                 console.log('color is ' + item);
//             });
//         });
//         page.appendChild(button);
//     }
// }
// constructOptions(kButtonColors);