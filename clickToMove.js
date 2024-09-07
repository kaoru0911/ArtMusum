

        // 监听点击事件
        document.querySelector('a-scene').addEventListener('click', function (event) {
            var cameraEl = document.querySelector('#camera');

            // 获取点击位置
            var intersection = event.detail.intersection;
            if (intersection) {
                var newPosition = intersection.point;

                // 仅移动在 X 和 Z 轴上，保持相机高度不变
                newPosition.y = cameraEl.getAttribute('position').y;
              
                // 获取当前相机位置
                var currentPosition = cameraEl.getAttribute('position');
                
                // 计算目标位置，缩小每次的移动幅度
                var targetPosition = {
                    x: currentPosition.x + (newPosition.x - currentPosition.x) * 0.2,
                    y: newPosition.y,
                    z: currentPosition.z + (newPosition.z - currentPosition.z) * 0.2
                };

                // 添加平滑移动动画，逐步移动相机到目标位置
                cameraEl.setAttribute('animation', {
                    property: 'position',
                    to: `${targetPosition.x} ${targetPosition.y} ${targetPosition.z}`,
                    dur: 1000,  // 动画持续时间为 1000ms
                    easing: 'easeInOutQuad'
                });
            }
        });