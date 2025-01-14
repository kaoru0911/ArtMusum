// 全局变量来控制导览状态
let tourState = {
    isRunning: false,
    isPaused: false,
    currentTimeout: null,
    currentIndex: 0,
    sequence: [], // 存儲導覽序列
    currentAudio: null // 當前播放的音檔
};

// 音檔快取
const audioCache = window.audioCache || new Map();

// 檢查是否為移動設備
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// 音檔初始化函數
async function initAudio(audio) {
    if (!audio) return false;
    
    try {
        audio.currentTime = 0;
        audio.load();
        return true;
    } catch (error) {
        console.log('音檔初始化失敗:', error);
        return false;
    }
}

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

// 處理標籤按鈕切換
function handleTabButton(button) {
    // 移除所有active状态
    document.querySelectorAll('.tabButton, .entrance-button')
        .forEach(btn => btn.classList.remove('active'));
    
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
}

// 创建箭头元素
function createArrow(direction, text, onClick) {
    const arrow = document.createElement('button');
    arrow.className = `nav-arrow ${direction}`;
    arrow.innerHTML = `
        <i class="fa-solid fa-chevron-${direction === 'prev' ? 'left' : 'right'}"></i>
        <span class="arrow-text">${text}</span>
    `;
    
    arrow.onclick = onClick;
    return arrow;
}

// 创建导航箭头
function setupNavigationArrows() {
    // 移除現有的箭頭（如果有）
    const existingArrows = document.getElementById('navigationArrows');
    if (existingArrows) {
        existingArrows.remove();
    }

    const arrowContainer = document.createElement('div');
    arrowContainer.id = 'navigationArrows';
    arrowContainer.className = 'manual-mode';

    const leftArrow = createArrow('prev', '上一站<br>Previous', () => navigateTour('prev'));
    const rightArrow = createArrow('next', '下一站<br>Next', () => navigateTour('next'));

    arrowContainer.appendChild(leftArrow);
    arrowContainer.appendChild(rightArrow);
    document.body.appendChild(arrowContainer);

    // 初始化箭頭顯示狀態
    leftArrow.style.visibility = 'hidden'; // 在第一個點時隱藏左箭頭
}

// 导航功能
function navigateTour(direction) {
    if (!tourState.isRunning) return;

    // 清除當前的計時器和音檔
    if (tourState.currentTimeout) {
        clearTimeout(tourState.currentTimeout);
    }
    if (tourState.currentAudio) {
        tourState.currentAudio.pause();
        tourState.currentAudio.currentTime = 0;
    }

    if (direction === 'prev') {
        tourState.currentIndex = Math.max(0, tourState.currentIndex - 1);
    } else {
        tourState.currentIndex = Math.min(tourState.sequence.length - 1, tourState.currentIndex + 1);
    }
    
    // 更新箭頭顯示狀態
    const arrowContainer = document.getElementById('navigationArrows');
    if (arrowContainer) {
        const leftArrow = arrowContainer.querySelector('.nav-arrow.prev');
        const rightArrow = arrowContainer.querySelector('.nav-arrow.next');
        if (leftArrow) leftArrow.style.visibility = tourState.currentIndex === 0 ? 'hidden' : 'visible';
        if (rightArrow) rightArrow.style.visibility = tourState.currentIndex === tourState.sequence.length - 1 ? 'hidden' : 'visible';
    }
    
    moveToNextSpot();
}

// 定义移动到下一个点的函数
function moveToNextSpot() {
    if (!tourState.isRunning || tourState.currentIndex >= tourState.sequence.length) {
        stopTour();
        return;
    }

    const currentButton = tourState.sequence[tourState.currentIndex];
    updateCurrentSpotHighlight(currentButton);
    
    if (currentButton.classList.contains('tabButton') || 
        currentButton.classList.contains('entrance-button')) {
        handleTabButton(currentButton);
    }

    const position = currentButton.getAttribute("data-position").split(" ");
    const rotation = currentButton.getAttribute("data-rotation").split(" ");
    const cameraEl = document.getElementById("camera");
    const lookControls = cameraEl.components["look-controls"];

    const startTime = Date.now();
    const moveDuration = 3000;
    const currentPos = cameraEl.getAttribute("position");
    const targetPos = {
        x: parseFloat(position[0]),
        y: parseFloat(position[1]),
        z: parseFloat(position[2])
    };

    const currentRotX = lookControls.pitchObject.rotation.x;
    const currentRotY = lookControls.yawObject.rotation.y;
    const targetRotX = window.AFRAME.THREE.MathUtils.degToRad(parseFloat(rotation[0]));
    let targetRotY = window.AFRAME.THREE.MathUtils.degToRad(parseFloat(rotation[1]));

    const PI2 = Math.PI * 2;
    const deltaY = ((targetRotY - currentRotY) % PI2 + PI2 * 3/2) % PI2 - PI2/2;
    targetRotY = currentRotY + deltaY;

     // 準備音檔
    let audioSrc;
    // 檢查是否為最後一個點位且是入口
    if (tourState.currentIndex === tourState.sequence.length - 1 && 
        currentButton.classList.contains('entrance-button')) {
        audioSrc = "https://cdn.glitch.global/9c60ad3e-c930-4e5c-af67-fbd6dce341dd/end.mp3?v=1736844211333"; // 替換成實際的結尾音檔URL
    } else {
        audioSrc = currentButton.getAttribute('data-audio');
    }

    let audio = null;
    if (audioSrc && audioCache.has(audioSrc)) {
        audio = audioCache.get(audioSrc);
        audio.currentTime = 0;
        audio.load();
    }

    function animate() {
        if (!tourState.isRunning || tourState.isPaused) return;

        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / moveDuration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        cameraEl.setAttribute("position", {
            x: currentPos.x + (targetPos.x - currentPos.x) * easeProgress,
            y: currentPos.y + (targetPos.y - currentPos.y) * easeProgress,
            z: currentPos.z + (targetPos.z - currentPos.z) * easeProgress
        });

        lookControls.pitchObject.rotation.x = currentRotX + (targetRotX - currentRotX) * easeProgress;
        lookControls.yawObject.rotation.y = currentRotY + deltaY * easeProgress;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // 移動完成後播放音檔
            if (audio) {
                // 停止之前的音檔
                if (tourState.currentAudio) {
                    tourState.currentAudio.pause();
                    tourState.currentAudio.currentTime = 0;
                }
                
                tourState.currentAudio = audio;
                audio.play().catch(error => {
                    console.error('音檔播放失敗:', error);
                    if (!tourState.isPaused) {
                        tourState.currentTimeout = setTimeout(() => {
                            tourState.currentIndex++;
                            moveToNextSpot();
                        }, 5000);
                    }
                });

                audio.onended = () => {
                    if (!tourState.isPaused) {
                        tourState.currentIndex++;
                        moveToNextSpot();
                    }
                };
            } else {
                if (!tourState.isPaused) {
                    tourState.currentTimeout = setTimeout(() => {
                        tourState.currentIndex++;
                        moveToNextSpot();
                    }, 5000);
                }
            }
        }
    }

    animate();
}

// 开始导览
async function startTour() {
    tourState.sequence = [
        document.querySelector('.entrance-button'),
        document.querySelector('.tabButton[data-artist="lee"]'),
        ...Array.from(document.querySelectorAll('.artistSpots.lee button')),
        document.querySelector('.tabButton[data-artist="lu"]'),
        ...Array.from(document.querySelectorAll('.artistSpots.lu button')),
        document.querySelector('.entrance-button')  // 添加回到入口的點位
    ].filter(Boolean);
    
    if (tourState.sequence.length === 0) {
        console.error('找不到導覽點');
        return;
    }

    try {
        // 預先準備第一個站點的音檔
        const firstButton = tourState.sequence[0];
        const firstAudioSrc = firstButton.getAttribute('data-audio');
        
        if (firstAudioSrc && audioCache.has(firstAudioSrc)) {
            const audio = audioCache.get(firstAudioSrc);
            await initAudio(audio);
        }
        
        // 預先準備結尾音檔
        const endingAudioSrc = "https://cdn.glitch.global/9c60ad3e-c930-4e5c-af67-fbd6dce341dd/end.mp3?v=1736844211333"; // 替換成實際的結尾音檔URL
        if (!audioCache.has(endingAudioSrc)) {
            const endingAudio = new Audio(endingAudioSrc);
            audioCache.set(endingAudioSrc, endingAudio);
            await initAudio(endingAudio);
        }
        
        tourState.isRunning = true;
        tourState.isPaused = false;
        tourState.currentIndex = 0;
        
        updateTourButtons();
        setupNavigationArrows();
        moveToNextSpot();
        
    } catch (error) {
        console.error('啟動導覽時發生錯誤:', error);
    }
}

// 暂停导览
function pauseTour() {
    tourState.isPaused = true;
    if (tourState.currentTimeout) {
        clearTimeout(tourState.currentTimeout);
    }
    if (tourState.currentAudio) {
        tourState.currentAudio.pause();
    }
    updateTourButtons();
}

// 继续导览
function resumeTour() {
    if (!tourState.isRunning) return;
    tourState.isPaused = false;
    if (tourState.currentAudio) {
        tourState.currentAudio.play();
    } else {
        moveToNextSpot();
    }
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
    if (tourState.currentAudio) {
        tourState.currentAudio.pause();
        tourState.currentAudio.currentTime = 0;
        tourState.currentAudio = null;
    }

    // 移除导航箭头
    const arrowContainer = document.getElementById('navigationArrows');
    if (arrowContainer) {
        arrowContainer.remove();
    }

    updateCurrentSpotHighlight(null);
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

    const startButton = document.createElement('button');
    startButton.id = 'startTourBtn';
    startButton.className = 'tour-button';
    startButton.innerHTML = '開始導覽<br>Start Tour';
    startButton.onclick = startTour;

    const pauseButton = document.createElement('button');
    pauseButton.id = 'pauseTourBtn';
    pauseButton.className = 'tour-button';
    pauseButton.innerHTML = '暫停導覽<br>Pause Tour';
    pauseButton.onclick = pauseTour;
    pauseButton.style.display = 'none';

    const stopButton = document.createElement('button');
    stopButton.id = 'stopTourBtn';
    stopButton.className = 'tour-button';
    stopButton.innerHTML = '停止導覽<br>Stop Tour';
    stopButton.onclick = stopTour;
    stopButton.style.display = 'none';

    controlsContainer.appendChild(startButton);
    controlsContainer.appendChild(pauseButton);
    controlsContainer.appendChild(stopButton);

    document.body.appendChild(controlsContainer);
  
    // 為所有可點擊元素添加暫停功能
    document.querySelectorAll('.clickable').forEach(element => {
        element.addEventListener('click', () => {
            if (tourState.isRunning) {
                pauseTour();
            }
        });
    });

    document.querySelectorAll('.spotMenu button').forEach(button => {
        button.addEventListener('click', () => {
            if (tourState.isRunning) {
                pauseTour();
            }
        });
    });

    document.querySelector('a-scene').addEventListener('click', () => {
        if (tourState.isRunning) {
            pauseTour();
        }
    });
});