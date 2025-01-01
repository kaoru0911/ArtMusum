window.addEventListener("load", function () {
  var popupVideoEl = document.querySelector("#popupVideo");
  var popupImgEl = document.querySelector("#popupUI");
  var closeButton2El = document.querySelector("#closeButton2");
  var closeButtonEl = document.querySelector("#closeButton");

  let isMoving = false;

  window.addEventListener("mouseMove", (e) => {
    e.stopPropagation();
    isMoving = true;
  });
  window.addEventListener("mouseUp", (e) => {
    e.stopPropagation();
    isMoving = false;
  });

  window.addEventListener("touchMove", (e) => {
    e.stopPropagation();
    isMoving = true;
  });
  window.addEventListener("touchEnd", (e) => {
    e.stopPropagation();
    isMoving = false;
  });

  // 绑定图片和视频点击事件
  document.querySelectorAll("a-image").forEach((element) => {
    function openPopup(event) {
      if (isMoving) return;

      window.closeSpotMenu();
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

        var contentEl = popupImgEl.querySelector(".contentText");
        contentEl.innerHTML = target.getAttribute("data-text");

        var audioSrc = target.getAttribute("data-audio-src");
        if (audioSrc) {
          var audioEl = popupImgEl.querySelector("audio");
          audioEl.setAttribute("src", audioSrc);
          audioEl.style.display = "block";
        }

        popupImgEl.style.display = "flex";
      }
    }

    element.addEventListener("click", openPopup);
  });

  function closeVedioPopup() {
    var videoEl = popupVideoEl.querySelector("video");
    videoEl.pause();
    popupVideoEl.style.display = "none";
    window.toggleSpotMenu();
  }

  const controlImage = popupImgEl
    .querySelector(".controlImage")
    .querySelectorAll("i");
  const zoomInIcon = controlImage[0];
  const zoomOutIcon = controlImage[1];
  const imageElement = popupImgEl.querySelector("img");

  const baseHeight = 98;
  function getScalePercentage(scale, base = 100) {
    return base + scale * 10;
  }

  function zoom(scale) {
    const zoomable = imageElement;
    zoomable.style.width = `${100 + scale * 15}%`;
    zoomable.style.maxHeight = scale === 0 ? "100%" : "none";
  }

  let scale = 1;
  zoomInIcon.addEventListener("click", () => {
    const newScale = Math.min(5, scale + 1);
    zoom(newScale);
    scale = newScale;
  });
  zoomOutIcon.addEventListener("click", () => {
    const newScale = Math.max(0, scale - 1);
    zoom(newScale);
    scale = newScale;
  });

  function closeImagePopup() {
    var audioEl = popupImgEl.querySelector("audio");
    audioEl.pause();
    audioEl.style.display = "none";
    popupImgEl.style.display = "none";
    window.toggleSpotMenu();
    zoom(0);
    scale = 1;
  }

  // 监听关闭按钮的点击事件，点击时关闭视频弹窗并停止影片播放
  closeButton2El.addEventListener("click", function (event) {
    closeVedioPopup();
  });

  // 监听关闭按钮的点击事件，点击时关闭图片弹窗
  closeButtonEl.addEventListener("click", function (event) {
    closeImagePopup();
  });

  // 点击遮罩层时关闭视频和图片弹窗
  popupVideoEl.addEventListener("click", function (event) {
    if (event.target === popupVideoEl) {
      closeVedioPopup();
    }
  });

  popupImgEl.addEventListener("click", function (event) {
    if (event.target === popupImgEl) {
      closeImagePopup();
    }
  });
});
