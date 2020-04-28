// chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
//   switch (message.method) {
//     case "showPopup":
//     //   chrome.cookies.get(
//     //     {
//     //       url: "https://www.bilibili.com",
//     //       name: "bili_jct",
//     //     },
//     //     function (cookie) {
//     //       console.log(cookie);
//     //     }
//     //   );
//         alert(1)
//       break;
//     default:
//       alert("未知动作");
//       break;
//   }
// });

function initPopupPage(callback) {
  var w = 800;
  var h = 550;
  var left = Math.round(screen.width / 2 - w / 2);
  var top = Math.round(screen.height / 2 - h / 2);
  chrome.windows.create(
    {
      url: "/html/popup.html",
      width: w,
      height: h,
      focused: true,
      left: left,
      top: top,
      type: "popup",
    },
    callback && callback()
  );
}

chrome.browserAction.onClicked.addListener(function (tab) {
  this.initPopupPage()
});
