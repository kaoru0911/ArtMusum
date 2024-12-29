// 全局变量来控制导览状态
let tourState = {
    isRunning: false,
    isPaused: false,
    currentTimeout: null,
    currentIndex: 0,
    sequence: [] // 存儲導覽序列
};

// 添加导览模式状态
let tourMode = null; // 'auto' 或 'manual'

function updateCurrentSpotHighlight(currentButton) {
    // 移除所有按鈕的 hover 效果
    document.querySelectorAll('.spotMenu button').forEach(btn => {
        btn.classList.remove('current-spot');
    });
    
    // 為當前按鈕添加 hover 效果
    if (currentButton) {
        currentButton.classList.add('current-spot');
    }
}

// 更新箭頭顯示狀態
function updateArrowsVisibility() {
    const arrowContainer = document.getElementById('navigationArrows');
    if (!arrowContainer) return;

    if (tourMode === 'manual') {
        arrowContainer.classList.add('manual-mode');
    } else {
        arrowContainer.classList.remove('manual-mode');
    }
}

// 定义移动到下一个点的函数
function moveToNextSpot() {
    if (!tourState.isRunning || tourState.currentIndex >= tourState.sequence.length) {
        stopTour();
        return;
    }

    if (tourState.isPaused) return;

    const currentButton = tourState.sequence[tourState.currentIndex];
    
    // 更新當前站點的 hover 效果
    updateCurrentSpotHighlight(currentButton);
    
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
    const stayDuration = tourMode === 'auto' ? 5000 : 0; // 自动模式停留5秒，手动模式不停留

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
        } else if (tourMode === 'auto' && !tourState.isPaused) {
            // 只在自动模式且未暂停时自动前进到下一个点
            tourState.currentTimeout = setTimeout(() => {
                tourState.currentIndex++;
                moveToNextSpot();
            }, stayDuration);
        }
    }

    animate();
}

// 开始导览选择模式
function startAutoTour() {
    if (tourState.isRunning) return;

    const modalContainer = document.createElement('div');
    modalContainer.className = 'tour-modal-overlay';

    const modalContent = document.createElement('div');
    modalContent.className = 'tour-modal-content';

    const title = document.createElement('h3');
    title.textContent = '請選擇導覽模式 Select Tour Mode';
    title.style.marginBottom = '20px';

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'tour-mode-container';

    // 自动导览按钮
    const autoButton = document.createElement('button');
    autoButton.className = 'tour-mode-button';
    autoButton.innerHTML = '自動導覽<br>Auto Tour';
    autoButton.onclick = () => {
        tourMode = 'auto';
        modalContainer.remove();
        startTour();
    };

    // 手动导览按钮
    const manualButton = document.createElement('button');
    manualButton.className = 'tour-mode-button';
    manualButton.innerHTML = '手動導覽<br>Manual Tour';
    manualButton.onclick = () => {
        tourMode = 'manual';
        modalContainer.remove();
        startTour();
    };

    buttonContainer.appendChild(autoButton);
    buttonContainer.appendChild(manualButton);
    modalContent.appendChild(title);
    modalContent.appendChild(buttonContainer);
    modalContainer.appendChild(modalContent);
    document.body.appendChild(modalContainer);
}

// 添加导航箭头
function addNavigationArrows() {
    // 如果已存在箭头，则先移除
    const existingArrows = document.getElementById('navigationArrows');
    if (existingArrows) {
        existingArrows.remove();
    }

    const arrowContainer = document.createElement('div');
    arrowContainer.id = 'navigationArrows';

    // 创建左右箭头
    const leftArrow = createArrow('prev', () => {
        navigateTour('prev');
    });
    const rightArrow = createArrow('next', () => {
        navigateTour('next');
    });

    // 在初始狀態下隱藏左箭頭
    if (tourState.currentIndex === 0) {
        leftArrow.style.visibility = 'hidden';
    }

    arrowContainer.appendChild(leftArrow);
    arrowContainer.appendChild(rightArrow);
    document.body.appendChild(arrowContainer);
    
    // 根據當前模式設置箭頭顯示狀態
    updateArrowsVisibility();
}


// 创建箭头按钮
function createArrow(direction, onClick) {
    const arrow = document.createElement('button');
    arrow.className = `nav-arrow ${direction === 'prev' ? 'prev' : 'next'}`;
    
    // 創建箭頭圖標
    const arrowIcon = document.createElement('span');
    arrowIcon.className = 'arrow-icon';
    arrowIcon.textContent = direction === 'prev' ? '←' : '→';
    
    // 創建文字容器
    const textContainer = document.createElement('div');
    textContainer.className = 'arrow-text';
    
    if (direction === 'prev') {
        textContainer.innerHTML = '上一步<br>Previous';
    } else {
        textContainer.innerHTML = '下一步<br>Next';
    }
    
    // 根據方向決定元素順序
    if (direction === 'prev') {
        arrow.appendChild(arrowIcon);
        arrow.appendChild(textContainer);
    } else {
        arrow.appendChild(textContainer);
        arrow.appendChild(arrowIcon);
    }
    
    arrow.onclick = onClick;
    return arrow;
}

// 导航功能
function navigateTour(direction) {
    if (!tourState.isRunning) return;

    if (tourState.currentTimeout) {
        clearTimeout(tourState.currentTimeout);
    }

    if (direction === 'prev') {
        tourState.currentIndex = (tourState.currentIndex - 1 + tourState.sequence.length) % tourState.sequence.length;
    } else {
        tourState.currentIndex = (tourState.currentIndex + 1) % tourState.sequence.length;
    }
    
    // 更新箭頭顯示狀態
    const arrowContainer = document.getElementById('navigationArrows');
    if (arrowContainer) {
        const leftArrow = arrowContainer.children[0];
        // 在第一個點時隱藏左箭頭
        leftArrow.style.visibility = tourState.currentIndex === 0 ? 'hidden' : 'visible';
    }
    
    moveToNextSpot();
}

// 开始导览
function startTour() {
    // 初始化导览序列
    tourState.sequence = [
        document.querySelector('.entrance-button'),
        document.querySelector('.tabButton[data-artist="lee"]'),
        ...Array.from(document.querySelectorAll('.artistSpots.lee button')),
        document.querySelector('.entrance-button'),
        document.querySelector('.tabButton[data-artist="lu"]'),
        ...Array.from(document.querySelectorAll('.artistSpots.lu button')),
        document.querySelector('.entrance-button')
    ];
    
    tourState.isRunning = true;
    tourState.isPaused = false;
    tourState.currentIndex = 0;
    
    // 添加导航箭头
    addNavigationArrows();
    
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
    tourMode = 'auto'; // 恢復時切換回自動模式
    updateArrowsVisibility(); // 更新箭頭顯示狀態
    moveToNextSpot();
    updateTourButtons();
}

// 停止导览
function stopTour() {
    tourState.isRunning = false;
    tourState.isPaused = false;
    tourState.currentIndex = 0;
    tourState.sequence = [];
    
    if (tourState.currentTimeout) {
        clearTimeout(tourState.currentTimeout);
    }

    // 移除导航箭头
    const arrowContainer = document.getElementById('navigationArrows');
    if (arrowContainer) {
        arrowContainer.remove();
    }

    updateCurrentSpotHighlight(null);
    updateTourButtons();
    tourMode = null;
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
            pauseBtn.innerHTML = '繼續導覽<br>Resume Tour';
            pauseBtn.onclick = resumeTour;
        } else {
            pauseBtn.innerHTML = '暫停導覽<br>Pause Tour';
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
    controlsContainer.className = 'tour-controls';

    // 开始按钮
    const startButton = document.createElement('button');
    startButton.id = 'startTourBtn';
    startButton.className = 'tour-button';
    startButton.innerHTML = '開始導覽<br>Start Tour';
    startButton.onclick = startAutoTour;

    // 暂停按钮
    const pauseButton = document.createElement('button');
    pauseButton.id = 'pauseTourBtn';
    pauseButton.className = 'tour-button';
    pauseButton.innerHTML = '暫停導覽<br>Pause Tour';
    pauseButton.onclick = pauseTour;
    pauseButton.style.display = 'none';

    // 停止按钮
    const stopButton = document.createElement('button');
    stopButton.id = 'stopTourBtn';
    stopButton.className = 'tour-button';
    stopButton.innerHTML = '停止導覽<br>Stop Tour';
    stopButton.onclick = stopTour;
    stopButton.style.display = 'none';

    // 添加按钮到容器
    controlsContainer.appendChild(startButton);
    controlsContainer.appendChild(pauseButton);
    controlsContainer.appendChild(stopButton);

    // 添加容器到页面
    document.body.appendChild(controlsContainer);
});