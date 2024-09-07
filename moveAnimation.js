var movementInterval; // 將 interval 宣告在外部，方便控制

document.addEventListener('keydown', function (event) {
    var cameraEl = document.querySelector('#camera');
    var movementSpeed = 0.1; // 控制移动速度
    var rotationSpeed = 0.5; // 控制旋转速度
    var key = event.key;

    // 防止重複執行多個 interval
    if (movementInterval) return;

    // 禁用 look-controls 以防止鼠標干擾旋轉
    cameraEl.setAttribute('look-controls', 'enabled', false);

    movementInterval = setInterval(function() {
        var currentPosition = cameraEl.getAttribute('position');
        var currentRotation = cameraEl.getAttribute('rotation');

        var targetPosition = { x: currentPosition.x, y: currentPosition.y, z: currentPosition.z };
        var targetRotation = { x: currentRotation.x, y: currentRotation.y, z: currentRotation.z };

        switch (key) {
            case 'w': // 向前移动
                targetPosition.z -= movementSpeed;
                break;
            case 's': // 向后移动
                targetPosition.z += movementSpeed;
                break;
            case 'a': // 向左旋转
                targetRotation.y += rotationSpeed;
                break;
            case 'd': // 向右旋转
                targetRotation.y -= rotationSpeed;
                break;
            default:
                break;
        }

        cameraEl.setAttribute('position', `${targetPosition.x} ${targetPosition.y} ${targetPosition.z}`);
        cameraEl.setAttribute('rotation', `${targetRotation.x} ${targetRotation.y} ${targetRotation.z}`);
    }, 16);  // 每16ms更新一次，約60fps
});

document.addEventListener('keyup', function () {
    var cameraEl = document.querySelector('#camera');
    clearInterval(movementInterval);  // 鬆開鍵盤時停止更新
    movementInterval = null;

    // 恢复 look-controls 讓鼠標繼續控制相機
    cameraEl.setAttribute('look-controls', 'enabled', true);
});
