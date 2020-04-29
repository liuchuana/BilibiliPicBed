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
        let imgBase64 = await getImageBase64(file);
        images.push(imgBase64);
      }
    }
    for (let i = 0; i < images.length; i++) {
      let item = images[i];
      uploadFile(item);
    }
  });
  //   上传图片ajax
  function uploadFile(cover) {
    let formData = new FormData();
    formData.append("csrf", csrf);
    formData.append("cover", cover);
    let len = $(".pic_list li").length;
    let i = len ? len : 0;
    let str = `<li>
      <img
        src="${cover}"
      />
      <div class="progress">
        <div
          class="progress-bar"
          role="progressbar"
          aria-valuemax="100"
        ></div>
      </div>
      <input
        type="text"
        class="pic_url hide"
      />
    </li>`;
    $(".pic_list").append(str);
    let progressTip = $(".progress .progress-bar").eq(i);
    var xhr = new XMLHttpRequest();
    xhr.open(
      "post",
      "https://api.bilibili.com/x/article/creative/article/upcover",
      true
    );
    xhr.timeout = 60 * 1000;
    xhr.ontimeout = function (event) {
      progressTip.html("上传超时(60s)");
    };

    xhr.onload = function (event) {
      progressTip.html("上传完成");
      if (this.status === 200) {
        let res = JSON.parse(this.response);
        let li = $(".pic_list li").eq(i);
        li.find("img").attr("data-clipboard-text", res.data.url);
        li.find("img").attr("src", res.data.url);
        li.find("input").attr("data-clipboard-text", res.data.url);
        li.find("input").attr("value", res.data.url);
        li.find(".progress").hide();
        li.find("input").removeClass("hide");
      } else {
        progressTip.html(
          "error:状态码：" + this.status + " 错误消息：" + this.statusText
        );
      }
    };

    xhr.upload.onprogress = function (event) {
      if (event.lengthComputable) {
        var pro = ((event.loaded / event.total).toFixed(4) * 100).toFixed(2);
        progressTip.css("width", pro + "%");
        progressTip.html("上传进度:" + pro + "%<br/>");
      }
    };

    xhr.send(formData);
  }
  function getImageBase64(file) {
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
  $(".pic_url").click(function () {
    $(this).select();
  });
});
