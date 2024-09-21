// 获取相机和所有"spot"元素
const camera = document.querySelector('#camera');
const spots = document.querySelectorAll('.spot'); // 假设所有spot都有相同的类名"spot"

// 为每个spot添加点击事件
spots.forEach(spot => {
  spot.addEventListener('click', function () {
    // 获取当前spot的位置
    const spotPosition = spot.getAttribute('position');

    // 获取相机当前的位置
    const cameraPosition = camera.getAttribute('position');

    // 目标位置
    const targetPosition = {
      x: spotPosition.x,
      y: 20, // 保持固定高度
      z: spotPosition.z + 0.5 // 调整相机前后距离
    };

    // 动画持续时间（毫秒）
    const duration = 3000; // 3秒
    const startTime = performance.now();

    // 动画更新函数
    function animateCamera(currentTime) {
      const elapsedTime = currentTime - startTime;
      const t = Math.min(elapsedTime / duration, 1); // 计算动画进度，确保不超过1

      // 线性插值 (lerp) 计算相机新位置
      const newPosition = {
        x: cameraPosition.x + (targetPosition.x - cameraPosition.x) * t,
        y: cameraPosition.y + (targetPosition.y - cameraPosition.y) * t,
        z: cameraPosition.z + (targetPosition.z - cameraPosition.z) * t
      };

      // 更新相机位置
      camera.setAttribute('position', newPosition);

      // 如果动画还没有结束，继续更新
      if (t < 1) {
        requestAnimationFrame(animateCamera);
      }
    }

    // 启动动画
    requestAnimationFrame(animateCamera);
  });
});
