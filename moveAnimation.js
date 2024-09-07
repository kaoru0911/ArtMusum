
    document.addEventListener('keydown', function (event) {
        var cameraEl = document.querySelector('#camera');
        var currentPosition = cameraEl.getAttribute('position');
        var currentRotation = cameraEl.getAttribute('rotation');
        var movementSpeed = 10; // 控制移动速度
        var rotationSpeed = 10; // 控制旋转速度

        // 初始化目标位置为当前相机位置
        var targetPosition = {
            x: currentPosition.x,
            y: currentPosition.y,
            z: currentPosition.z
        };

        // 初始化目标旋转角度为当前相机旋转角度
        var targetRotation = {
            x: currentRotation.x,
            y: currentRotation.y,
            z: currentRotation.z
        };

        // 根据按下的键调整目标位置或旋转
        switch (event.key) {
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

        // 设置平滑移动动画，逐步移动相机到目标位置
        cameraEl.setAttribute('animation__position', {
            property: 'position',
            to: `${targetPosition.x} ${targetPosition.y} ${targetPosition.z}`,
            dur: 500,  // 动画持续时间为 500ms
            easing: 'easeInOutQuad'
        });

        // 设置平滑旋转动画，逐步旋转相机到目标角度
        cameraEl.setAttribute('animation__rotation', {
            property: 'rotation',
            to: `${targetRotation.x} ${targetRotation.y} ${targetRotation.z}`,
            dur: 500,  // 动画持续时间为 500ms
            easing: 'easeInOutQuad'
        });
    });