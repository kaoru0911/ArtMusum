// tabSwitch.js
window.addEventListener('load', function() {
    const tabButtons = document.querySelectorAll('.tabButton');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 檢查是否為入口按鈕
            if (button.classList.contains('entrance')) {
                // 處理入口按鈕點擊
                const camera = document.querySelector('[camera]');
                const position = button.getAttribute('data-position');
                const rotation = button.getAttribute('data-rotation');
                
                if (position && rotation) {
                    camera.setAttribute('position', position);
                    camera.setAttribute('rotation', rotation);
                }
                return; // 不執行其他標籤切換邏輯
            }
            
            // 原有的標籤切換邏輯
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.artistSpots').forEach(spots => {
                spots.classList.remove('active');
            });
            
            button.classList.add('active');
            
            const artist = button.getAttribute('data-artist');
            const targetSpots = document.querySelector(`.artistSpots.${artist}`);
            if (targetSpots) {
                targetSpots.classList.add('active');
            }
        });
    });
});