$(function () {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 800,
    onOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });
  let csrf = "";
  let historyImages = JSON.parse(window.localStorage.getItem("history")) || [];
  checkBiliLogin();
  drawHistoryImages();
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
  // 删除图片
  $(".pic_list").bind("contextmenu", function (e) {
    if (e.target.tagName !== "IMG") return false;
    Swal.fire({
      title: "是否删除这张图片",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    }).then(({ value }) => {
      if (value) {
        historyImages =
          JSON.parse(window.localStorage.getItem("history")) || [];
        let target = $(e.target);
        let url = target.attr("src");
        let index = historyImages.indexOf(url);
        historyImages.splice(index, 1);
        target.parent().remove();
        window.localStorage.setItem("history", JSON.stringify(historyImages));
      }
    });
    return false;
  });
  // 绑定事件委托 复制链接
  $(".pic_list").on("click", ".pic_url", function () {
    $(this).select();
    Toast.fire({
      icon: "success",
      title: "复制成功",
    });
  });
  // 绑定事件委托 复制链接
  $(".pic_list").on("click", "img", function () {
    $(this).parent().find(".pic_url").select();
    Toast.fire({
      icon: "success",
      title: "复制成功",
    });
  });
  // 清除历史记录
  $("#clearHistory").click(function () {
    Swal.fire({
      title: "是否清空所有上传记录",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    }).then(({ value }) => {
      if (value) {
        window.localStorage.clear();
        $(".pic_list li").remove();
        Toast.fire({
          icon: "success",
          title: "已经清空所有上传记录",
        });
      }
    });
  });
  $("#copyAllUrl").click(function () {
    historyImages = JSON.parse(window.localStorage.getItem("history")) || [];
    let copy = new ClipboardJS("#copyAllUrl", {
      text: function () {
        let str = historyImages.join("\n");
        return str;
      },
    });
    copy.on("success", function (e) {
      Toast.fire({
        icon: "success",
        title: "复制成功",
      });
    });
    copy.on("error", function (e) {
      Toast.fire({
        icon: "success",
        title: "复制失败",
      });
    });
  });
  //   上传图片ajax
  function uploadFile(cover) {
    let formData = new FormData();
    formData.append("csrf", csrf);
    formData.append("cover", cover);
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
    $(".pic_list").prepend(str);
    let progressTip = $(".progress .progress-bar").eq(0);
    let li = $(".pic_list li").eq(0);
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
        li.find("img").attr("data-clipboard-text", res.data.url);
        li.find("img").attr("src", res.data.url);
        li.find("input").attr("data-clipboard-text", res.data.url);
        li.find("input").attr("value", res.data.url);
        li.find(".progress").hide();
        li.find("input").removeClass("hide");
        historyImages.unshift(res.data.url);
        window.localStorage.setItem("history", JSON.stringify(historyImages));
      } else {
        progressTip.html(
          "error:状态码：" + this.status + " 错误消息：" + this.statusText
        );
      }
    };
    xhr.upload.onprogress = function (event) {
      if (event.lengthComputable) {
        var pro = ((event.loaded / event.total).toFixed(4) * 100).toFixed(0);
        console.log(pro);
        progressTip.css("width", pro + "%");
        progressTip.html("上传进度:" + pro + "%<br/>");
      }
    };
    xhr.send(formData);
  }
  // 获取图片的base64格式
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
  // 判断是否登录 登录后赋值csrf
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
  //  渲染历史数据
  function drawHistoryImages() {
    for (let i = 0; i < historyImages.length; i++) {
      const url = historyImages[i];
      let str = `<li>
        <img
          data-clipboard-text="${url}"
          src="${url}"
        />
        <input
          data-clipboard-text="${url}"
          type="text"
          value="${url}"
          class="pic_url"
        />
      </li>`;
      $(".pic_list").append(str);
    }
  }
});
