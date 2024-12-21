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
  const tabButtons = document.querySelectorAll('.tabButton, .entrance-button'); // 修改選擇器以包含入口按鈕
    
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // 移除所有active狀態
      tabButtons.forEach(btn => btn.classList.remove('active'));
      
      // 隱藏所有藝術家的spots
      document.querySelectorAll('.artistSpots').forEach(spots => {
        spots.classList.remove('active');
      });
      
      // 添加新的active狀態
      button.classList.add('active');
      
      // 顯示選中藝術家的spots
      const artist = button.getAttribute('data-artist');
      const targetSpots = button.classList.contains('entrance-button') 
        ? document.querySelector('.artistSpots') // 如果是入口按鈕，顯示所有藝術家的spots
        : document.querySelector(`.artistSpots.${artist}`);
      
      if (targetSpots) {
        targetSpots.classList.add('active');
      }

      // 新增：使用data-position和data-rotation設置相機位置和旋轉
      const position = button.getAttribute("data-position").split(" ");
      const rotation = button.getAttribute("data-rotation").split(" ");
      const cameraEl = document.getElementById("camera");

      cameraEl.setAttribute("position", {
        x: parseFloat(position[0]),
        y: parseFloat(position[1]),
        z: parseFloat(position[2]),
      });

      cameraEl.components["look-controls"].pitchObject.rotation.set(
        window.AFRAME.THREE.MathUtils.degToRad(parseFloat(rotation[0])),
        0,
        0
      );
      cameraEl.components["look-controls"].yawObject.rotation.set(
        0,
        window.AFRAME.THREE.MathUtils.degToRad(parseFloat(rotation[1])),
        0
      );
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

      cameraEl.setAttribute("position", {
        x: parseFloat(position[0]),
        y: parseFloat(position[1]),
        z: parseFloat(position[2]),
      });

      cameraEl.components["look-controls"].pitchObject.rotation.set(
        window.AFRAME.THREE.MathUtils.degToRad(parseFloat(rotation[0])),
        0,
        0
      );
      cameraEl.components["look-controls"].yawObject.rotation.set(
        0,
        window.AFRAME.THREE.MathUtils.degToRad(parseFloat(rotation[1])),
        0
      );
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