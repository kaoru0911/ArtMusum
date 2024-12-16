window.addEventListener('load', function() {
    const tabButtons = document.querySelectorAll('.tabButton');
    
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
            const targetSpots = document.querySelector(`.artistSpots.${artist}`);
            if (targetSpots) {
                targetSpots.classList.add('active');
            }
        });
    });
});