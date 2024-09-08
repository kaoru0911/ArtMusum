window.addEventListener("load", function () {
  // 确保页面加载完成后再绑定事件
  var popupUIEl = document.querySelector("#popupUI");
  var closeButtonEl = document.querySelector("#closeButton");

  // 绑定图片点击事件，显示弹窗
  document.querySelectorAll("a-image").forEach((element) => {
    element.addEventListener("click", function (event) {
      var target = event.target;

      popupUIEl
        .querySelector("img")
        .setAttribute("src", target.getAttribute("src"));
      popupUIEl
        .querySelector("div")
        .setAttribute("data-text", target.getAttribute("data-text"));
      popupUIEl.style.display = "flex";
    });
  });

  // 监听关闭按钮的点击事件，点击时关闭弹窗
  closeButtonEl.addEventListener("click", function (event) {
    popupUIEl.style.display = "none";
  });

  document.body.addEventListener("click", function (event) {
    var target = event.target;
    var maskEl = document.querySelector(".mask");

    if (target === maskEl) {
      popupUIEl.style.display = "none";
    }
  });
});
