window.addEventListener('load', function () {
    // 确保页面加载完成后再绑定事件
    var imageEl = document.querySelector('#popupImage');
    var popupUIEl = document.querySelector('#popupUI');
    var closeButtonEl = document.querySelector('#closeButton');
    var sceneEl = document.querySelector('a-scene');

    // 绑定图片点击事件，显示弹窗
    imageEl.addEventListener('click', function (event) {
        event.stopPropagation();  // 阻止事件冒泡，避免立即关闭弹窗
        popupUIEl.setAttribute('visible', true);
    });

    // 监听关闭按钮的点击事件，点击时关闭弹窗
    closeButtonEl.addEventListener('click', function (event) {
        event.stopPropagation();  // 阻止事件冒泡，避免其他点击事件触发
        popupUIEl.setAttribute('visible', false);
    });

    // 监听整个场景的点击事件，点击 UI 外部区域时关闭弹窗
    sceneEl.addEventListener('click', function (event) {
        var target = event.target;

        // 如果点击的不是 UI 窗口内的元素，并且弹窗是显示状态，则关闭弹窗
        if (popupUIEl.getAttribute('visible') === "true" && target !== popupUIEl && target !== closeButtonEl) {
            popupUIEl.setAttribute('visible', false);
        }
    });
});
