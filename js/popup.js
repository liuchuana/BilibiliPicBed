// chrome.runtime.sendMessage({
//   method: "showPopup",
// });
//
//此处是手动选择文件
$(function () {
  let csrf = "";
  //   判断是否登录 登录后赋值csrf
  checkBiliLogin();
  // 上传图片
  $("#uploadFile").change(async function () {
    event.preventDefault();
    let files = $("#uploadFile")[0].files;
    let images = [];
    for (let i = 0; i < files.length; i++) {
      var file = files[i];
      if (/image\/\w+/.test(file.type) && file != "undefined") {
        let imgBase64 = await imgfileToBase64(file);
        images.push(imgBase64);
      }
    }
    for (let i = 0; i < images.length; i++) {
      const item = images[i];
      uploadFilePost(item);
    }
  });
  //   上传图片ajax
  function uploadFilePost(base64) {
    base64 = encodeURIComponent(base64);
    fetch("https://api.bilibili.com/x/article/creative/article/upcover", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      withCredentials: true,
      body: `csrf=${csrf}&cover=${base64}`,
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (res) {
        console.log(res);
      });
  }
  function imgfileToBase64(file) {
    return new Promise((resolve) => {
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function (e) {
        $("#img").attr("src", e.target.result);
        return resolve(e.target.result);
      };
    });
  }
  function checkBiliLogin() {
    chrome.cookies.get(
      {
        url: "https://www.bilibili.com",
        name: "bili_jct",
      },
      function (res) {
        csrf = res.value;
      }
    );
  }
  $("#pic_url").click(function () {
    $(this).select();
  });
});
