window.addEventListener("load", function () {
  // 确保页面加载完成后再绑定事件
  var popupVideoEl = document.querySelector("#popupVideo");
  var popupImgEl = document.querySelector("#popupUI");
  var closeButton2El = document.querySelector("#closeButton2");
  var closeButtonEl = document.querySelector("#closeButton");

  // 绑定图片和视频点击事件
  document.querySelectorAll("a-image").forEach((element) => {
    element.addEventListener("click", function (event) {
      var target = event.target;
      var videoSrc = target.getAttribute("data-video-src");

      if (videoSrc) {
        // 如果有 data-video-src 属性，显示视频弹窗并播放视频
        var videoEl = popupVideoEl.querySelector("video");
        videoEl.setAttribute("src", videoSrc);
        videoEl.play(); // 播放影片
        popupVideoEl.style.display = "flex";
      } else {
        // 如果没有 data-video-src 属性，显示图片弹窗
        popupImgEl
          .querySelector("img")
          .setAttribute("src", target.getAttribute("src"));
        popupImgEl
          .querySelector("div")
          .setAttribute("data-text", target.getAttribute("data-text"));
        popupImgEl.style.display = "flex";
      }
    });
  });

  // 监听关闭按钮的点击事件，点击时关闭视频弹窗并停止影片播放
  closeButton2El.addEventListener("click", function (event) {
    var videoEl = popupVideoEl.querySelector("video");
    videoEl.pause(); // 停止影片播放
    popupVideoEl.style.display = "none";
  });

  // 监听关闭按钮的点击事件，点击时关闭图片弹窗
  closeButtonEl.addEventListener("click", function (event) {
    popupImgEl.style.display = "none";
  });

  // 点击遮罩层时关闭视频和图片弹窗
  document.body.addEventListener("click", function (event) {
    var target = event.target;
    var maskEl = document.querySelector(".mask");

    if (target === maskEl) {
      var videoEl = popupVideoEl.querySelector("video");
      videoEl.pause(); // 停止影片播放
      popupVideoEl.style.display = "none";
      popupImgEl.style.display = "none";
    }
  });
});
