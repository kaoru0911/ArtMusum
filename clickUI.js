window.addEventListener("load", function () {
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
        var videoEl = popupVideoEl.querySelector("video");
        videoEl.setAttribute("src", videoSrc);
        videoEl.play();
        popupVideoEl
          .querySelector("div")
          .setAttribute("data-text", target.getAttribute("data-text"));
        popupVideoEl.style.display = "flex";
      } else {
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
    videoEl.pause();
    popupVideoEl.style.display = "none";
  });

  // 监听关闭按钮的点击事件，点击时关闭图片弹窗
  closeButtonEl.addEventListener("click", function (event) {
    popupImgEl.style.display = "none";
  });

  // 点击遮罩层时关闭视频和图片弹窗
  popupVideoEl.addEventListener("click", function (event) {
    if (event.target === popupVideoEl) {
      var videoEl = popupVideoEl.querySelector("video");
      videoEl.pause();
      popupVideoEl.style.display = "none";
    }
  });

  popupImgEl.addEventListener("click", function (event) {
    if (event.target === popupImgEl) {
      popupImgEl.style.display = "none";
    }
  });
});
