// 全局变量来控制导览状态
let tourState = {
    isRunning: false,
    isPaused: false,
    currentTimeout: null,
    currentIndex: 0
};

// 定义导览序列
let tourSequence = [];

// 定义移动到下一个点的函数（移到全局作用域）
function moveToNextSpot() {
    if (!tourState.isRunning || tourState.currentIndex >= tourSequence.length) {
        stopTour();
        return;
    }

    if (tourState.isPaused) return;

    const currentButton = tourSequence[tourState.currentIndex];
    
    // 如果是标签按钮，触发标签切换
    if (currentButton.classList.contains('tabButton') || 
        currentButton.classList.contains('entrance-button')) {
        // 移除所有active状态
        document.querySelectorAll('.tabButton, .entrance-button')
            .forEach(btn => btn.classList.remove('active'));
        
        // 隐藏所有艺术家的spots
        document.querySelectorAll('.artistSpots').forEach(spots => {
            spots.classList.remove('active');
        });
        
        // 添加新的active状态
        currentButton.classList.add('active');
        
        // 显示选中艺术家的spots
        const artist = currentButton.getAttribute('data-artist');
        const targetSpots = currentButton.classList.contains('entrance-button') 
            ? document.querySelector('.artistSpots') 
            : document.querySelector(`.artistSpots.${artist}`);
        
        if (targetSpots) {
            targetSpots.classList.add('active');
        }
    }

 // 获取目标位置和旋转角度
    const position = currentButton.getAttribute("data-position").split(" ");
    const rotation = currentButton.getAttribute("data-rotation").split(" ");
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
    let targetRotY = window.AFRAME.THREE.MathUtils.degToRad(parseFloat(rotation[1]));

    // 优化旋转路径
    const PI2 = Math.PI * 2;
    const deltaY = ((targetRotY - currentRotY) % PI2 + PI2 * 3/2) % PI2 - PI2/2;
    targetRotY = currentRotY + deltaY;

    const startTime = Date.now();
    const moveDuration = 3000; // 移动时间3秒
    const stayDuration = 5000; // 每个站点停留5秒

    function animate() {
        if (!tourState.isRunning || tourState.isPaused) return;

        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / moveDuration, 1);

        // 使用更平滑的缓动函数
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        // 更新位置
        cameraEl.setAttribute("position", {
            x: currentPos.x + (targetPos.x - currentPos.x) * easeProgress,
            y: currentPos.y + (targetPos.y - currentPos.y) * easeProgress,
            z: currentPos.z + (targetPos.z - currentPos.z) * easeProgress
        });

        // 更新旋转
        lookControls.pitchObject.rotation.x = currentRotX + (targetRotX - currentRotX) * easeProgress;
        lookControls.yawObject.rotation.y = currentRotY + deltaY * easeProgress;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // 动画完成后，等待一段时间再移动到下一个点
            tourState.currentTimeout = setTimeout(() => {
                tourState.currentIndex++;
                moveToNextSpot();
            }, stayDuration);
        }
    }

    animate();
}

// 自动导览功能
function startAutoTour() {
    // 如果导览正在运行，则返回
    if (tourState.isRunning) return;

    // 初始化导览序列
    tourSequence = [
        // 入口
        document.querySelector('.entrance-button'),
        // 李欽泓标签
        document.querySelector('.tabButton[data-artist="lee"]'),
        // 李欽泓的所有站点
        ...Array.from(document.querySelectorAll('.artistSpots.lee button')),
        // 回到入口
        document.querySelector('.entrance-button'),
        // 盧崇道标签
        document.querySelector('.tabButton[data-artist="lu"]'),
        // 盧崇道的所有站点
        ...Array.from(document.querySelectorAll('.artistSpots.lu button')),
        // 最后回到入口
        document.querySelector('.entrance-button')
    ];

    // 开始导览
    tourState.isRunning = true;
    tourState.isPaused = false;
    tourState.currentIndex = 0;
    updateTourButtons();
    moveToNextSpot();
}

// 暂停导览
function pauseTour() {
    tourState.isPaused = true;
    if (tourState.currentTimeout) {
        clearTimeout(tourState.currentTimeout);
    }
    updateTourButtons();
}

// 继续导览
function resumeTour() {
    if (!tourState.isRunning) return;
    tourState.isPaused = false;
    moveToNextSpot();
    updateTourButtons();
}

// 停止导览
function stopTour() {
    tourState.isRunning = false;
    tourState.isPaused = false;
    tourState.currentIndex = 0;
    if (tourState.currentTimeout) {
        clearTimeout(tourState.currentTimeout);
    }
    updateTourButtons();
}

// 更新按钮状态
function updateTourButtons() {
    const startBtn = document.getElementById('startTourBtn');
    const pauseBtn = document.getElementById('pauseTourBtn');
    const stopBtn = document.getElementById('stopTourBtn');

    if (tourState.isRunning) {
        startBtn.style.display = 'none';
        pauseBtn.style.display = 'inline';
        stopBtn.style.display = 'inline';
        
        if (tourState.isPaused) {
            pauseBtn.textContent = '繼續導覽';
            pauseBtn.onclick = resumeTour;
        } else {
            pauseBtn.textContent = '暫停導覽';
            pauseBtn.onclick = pauseTour;
        }
    } else {
        startBtn.style.display = 'inline';
        pauseBtn.style.display = 'none';
        stopBtn.style.display = 'none';
    }
}

// 添加导览控制按钮
window.addEventListener('load', function() {
    const controlsContainer = document.createElement('div');
    controlsContainer.style.position = 'fixed';
    controlsContainer.style.top = '20px';
    controlsContainer.style.left = '20px';
    controlsContainer.style.display = 'flex';
    controlsContainer.style.gap = '10px';

    // 开始按钮
    const startButton = document.createElement('button');
    startButton.id = 'startTourBtn';
    startButton.textContent = '開始導覽';
    startButton.onclick = startAutoTour;

    // 暂停按钮
    const pauseButton = document.createElement('button');
    pauseButton.id = 'pauseTourBtn';
    pauseButton.textContent = '暫停導覽';
    pauseButton.onclick = pauseTour;
    pauseButton.style.display = 'none';

    // 停止按钮
    const stopButton = document.createElement('button');
    stopButton.id = 'stopTourBtn';
    stopButton.textContent = '停止導覽';
    stopButton.onclick = stopTour;
    stopButton.style.display = 'none';

    // 设置按钮样式
    [startButton, pauseButton, stopButton].forEach(button => {
        button.style.padding = '10px';
        button.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
    });

    // 添加按钮到容器
    controlsContainer.appendChild(startButton);
    controlsContainer.appendChild(pauseButton);
    controlsContainer.appendChild(stopButton);

    // 添加容器到页面
    document.body.appendChild(controlsContainer);
});