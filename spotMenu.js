// 控制菜單的開關狀態
function controlMenu() {
  let isOpen = true;
  const menuBody = document.getElementById("spotMenu");
  const button = menuBody.querySelector("#spotMenuToggleButton");
  const arrow = button.querySelector("i");

  function closeSpotMenu() {
    isOpen = false;
    menuBody.style.transition = "transform 0.3s ease"; // 新增：添加過渡效果
    menuBody.style.transform = "translateY(100%)"; // 修改：使用transform屬性
    arrow.style.transition = "transform 0.3s ease"; // 新增：添加過渡效果
    arrow.style.transform = "translateY(4px) rotate(-135deg)"; // 修改：使用transform屬性
  }

  function toggleSpotMenu() {
    if (isOpen) {
      closeSpotMenu();
    } else {
      isOpen = true;
      menuBody.style.transition = "transform 0.3s ease"; // 新增：添加過渡效果
      menuBody.style.transform = "translateY(0)"; // 修改：使用transform屬性
      arrow.style.transition = "transform 0.3s ease"; // 新增：添加過渡效果
      arrow.style.transform = "rotate(45deg)"; // 修改：使用transform屬性
    }
  }

  button.addEventListener("click", toggleSpotMenu);
  return { closeSpotMenu, toggleSpotMenu };
}

// 標籤切換功能
function initTabSwitch() {
    const tabButtons = document.querySelectorAll('.tabButton, .entrance-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 移除所有active状态
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // 隐藏所有艺术家的spots
            document.querySelectorAll('.artistSpots').forEach(spots => {
                spots.classList.remove('active');
            });
            
            // 添加新的active状态
            button.classList.add('active');
            
            // 显示选中艺术家的spots
            const artist = button.getAttribute('data-artist');
            const targetSpots = button.classList.contains('entrance-button') 
                ? document.querySelector('.artistSpots') 
                : document.querySelector(`.artistSpots.${artist}`);
            
            if (targetSpots) {
                targetSpots.classList.add('active');
            }

            // 获取目标位置和旋转角度
            const position = button.getAttribute("data-position").split(" ");
            const rotation = button.getAttribute("data-rotation").split(" ");
            const cameraEl = document.getElementById("camera");
            const lookControls = cameraEl.components["look-controls"];

            // 获取当前位置和目标位置
            const currentPos = cameraEl.getAttribute("position");
            const targetPos = {
                x: parseFloat(position[0]),
                y: parseFloat(position[1]),
                z: parseFloat(position[2])
            };

            // 获取当前旋转和目标旋转
            const currentRotX = lookControls.pitchObject.rotation.x;
            const currentRotY = lookControls.yawObject.rotation.y;
            const targetRotX = window.AFRAME.THREE.MathUtils.degToRad(parseFloat(rotation[0]));
            const targetRotY = window.AFRAME.THREE.MathUtils.degToRad(parseFloat(rotation[1]));

            // 动画时长（毫秒）
            const duration = 1000;
            const startTime = Date.now();

            function animate() {
                const elapsedTime = Date.now() - startTime;
                const progress = Math.min(elapsedTime / duration, 1);

                // 使用 easeInOutQuad 缓动函数
                const easeProgress = progress < 0.5
                    ? 2 * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                // 更新位置
                cameraEl.setAttribute("position", {
                    x: currentPos.x + (targetPos.x - currentPos.x) * easeProgress,
                    y: currentPos.y + (targetPos.y - currentPos.y) * easeProgress,
                    z: currentPos.z + (targetPos.z - currentPos.z) * easeProgress
                });

                // 更新旋转
                lookControls.pitchObject.rotation.x = currentRotX + (targetRotX - currentRotX) * easeProgress;
                lookControls.yawObject.rotation.y = currentRotY + (targetRotY - currentRotY) * easeProgress;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            }

            animate();
        });
    });
}

// 初始化定位按鈕功能
function initSpotButtons() {
    const spotButtons = document.querySelectorAll("#spotList button");

    spotButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const position = button.getAttribute("data-position").split(" ");
            const rotation = button.getAttribute("data-rotation").split(" ");
            const cameraEl = document.getElementById("camera");
            const lookControls = cameraEl.components["look-controls"];

            // 获取当前位置和目标位置
            const currentPos = cameraEl.getAttribute("position");
            const targetPos = {
                x: parseFloat(position[0]),
                y: parseFloat(position[1]),
                z: parseFloat(position[2])
            };

            // 获取当前旋转和目标旋转
            const currentRotX = lookControls.pitchObject.rotation.x;
            const currentRotY = lookControls.yawObject.rotation.y;
            const targetRotX = window.AFRAME.THREE.MathUtils.degToRad(parseFloat(rotation[0]));
            const targetRotY = window.AFRAME.THREE.MathUtils.degToRad(parseFloat(rotation[1]));

            // 动画时长（毫秒）
            const duration = 1000;
            const startTime = Date.now();

            function animate() {
                const elapsedTime = Date.now() - startTime;
                const progress = Math.min(elapsedTime / duration, 1);

                // 使用 easeInOutQuad 缓动函数
                const easeProgress = progress < 0.5
                    ? 2 * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                // 更新位置
                cameraEl.setAttribute("position", {
                    x: currentPos.x + (targetPos.x - currentPos.x) * easeProgress,
                    y: currentPos.y + (targetPos.y - currentPos.y) * easeProgress,
                    z: currentPos.z + (targetPos.z - currentPos.z) * easeProgress
                });

                // 更新旋转
                lookControls.pitchObject.rotation.x = currentRotX + (targetRotX - currentRotX) * easeProgress;
                lookControls.yawObject.rotation.y = currentRotY + (targetRotY - currentRotY) * easeProgress;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            }

            animate();
        });
    });
}
// 獲取相機位置和旋轉角度(用於開發)
function getPostionAndRotation() {
  const cameraEl = document.getElementById("camera");
  const position = cameraEl.getAttribute("position");
  const rotation = cameraEl.getAttribute("rotation");

  console.log(`
    data-position="${position.x} ${position.y} ${position.z}"
    data-rotation="${rotation.x} ${rotation.y}"
  `);
}

// 頁面載入完成後初始化所有功能
window.addEventListener('load', function() {
  const { closeSpotMenu, toggleSpotMenu } = controlMenu();
  window.closeSpotMenu = closeSpotMenu;
  window.toggleSpotMenu = toggleSpotMenu;
  
  initTabSwitch();
  initSpotButtons();
});