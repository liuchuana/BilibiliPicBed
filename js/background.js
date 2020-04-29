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
      type: "popup"
    },
    callback && callback()
  );
}

chrome.browserAction.onClicked.addListener(function () {
  this.initPopupPage()
});