class ResourceLoader {
    constructor() {
        this.loadingOverlay = document.querySelector('#loadingOverlay');
        this.progressBar = document.querySelector('#progressBar');
        this.progressText = document.querySelector('#progressText');
        this.forceEnterButton = document.querySelector('#forceEnterButton');
        
        this.progress = 0;
        this.totalResources = 0;
        this.loadedResources = 0;
        this.criticalResourcesLoaded = false;
        this.allResourcesLoaded = false;
        this.skyboxLoaded = false;
        
        // 新增進度追踪
        this.actualProgress = 0;
        this.displayProgress = 0;
        this.isEntering = false;
        
        this.resourceGroups = {
            critical: [],
            primary: [],
            secondary: []
        };

        this.setupForceEnterButton();
        this.setupTimeouts();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.startLoading());
        } else {
            this.startLoading();
        }
    }

    startLoading() {
        this.collectResources();
        if (this.totalResources === 0) {
            this.enterScene();
            return;
        }

        this.loadCriticalResources()
            .then(() => this.loadPrimaryResources())
            .then(() => this.loadSecondaryResources())
            .catch(error => {
                console.error('資源加載錯誤:', error);
                if (this.criticalResourcesLoaded && this.skyboxLoaded) {
                    this.enterScene();
                }
            });
    }

    setupForceEnterButton() {
        if (this.forceEnterButton) {
            this.forceEnterButton.addEventListener('click', () => {
                if (this.criticalResourcesLoaded && this.skyboxLoaded) {
                    this.enterScene();
                }
            });

            setTimeout(() => {
                if (this.forceEnterButton && this.criticalResourcesLoaded && this.skyboxLoaded) {
                    this.forceEnterButton.style.display = 'block';
                }
            }, 10000); // 縮短為10秒
        }
    }

    setupTimeouts() {
        setTimeout(() => {
            if (!this.allResourcesLoaded && this.criticalResourcesLoaded && this.skyboxLoaded) {
                this.enterScene();
            }
        }, 30000); // 縮短為30秒
    }

    collectResources() {
        const skybox = document.querySelector('a-sky');
        if (skybox) {
            skybox.addEventListener('materialtextureloaded', () => {
                console.log('天空盒材質已載入');
                this.skyboxLoaded = true;
                if (this.criticalResourcesLoaded) {
                    this.enterScene();
                }
            });
        }

        this.resourceGroups.critical.push(
            ...Array.from(document.querySelectorAll('[gltf-model*="artMuseumTest34Wall.glb"]')),
            ...Array.from(document.querySelectorAll('[gltf-model*="artMuseumTest33-2Floor.glb"]'))
        );

        this.resourceGroups.primary.push(
            ...Array.from(document.querySelectorAll('a-image[src*="LifuArtLogo"]')),
            ...Array.from(document.querySelectorAll('a-image[src*="Lee1"]')),
            ...Array.from(document.querySelectorAll('a-image[src*="Lu1"]'))
        );

        this.resourceGroups.secondary.push(
            ...Array.from(document.querySelectorAll('a-image:not([src*="LifuArtLogo"]):not([src*="Lee1"]):not([src*="Lu1"])')),
            ...Array.from(document.querySelectorAll('img[src]'))
        );

        Object.keys(this.resourceGroups).forEach(key => {
            this.resourceGroups[key] = this.resourceGroups[key].filter(el => 
                el.getAttribute('src') || el.getAttribute('gltf-model')
            );
        });

        this.totalResources = Object.values(this.resourceGroups)
            .reduce((total, group) => total + group.length, 0);

        console.log('總資源數:', this.totalResources);
    }

    async loadCriticalResources() {
        if (this.resourceGroups.critical.length === 0) {
            this.criticalResourcesLoaded = true;
            return;
        }

        const promises = this.resourceGroups.critical.map(resource => 
            this.loadResource(resource, 40)
        );
        await Promise.all(promises);
        this.criticalResourcesLoaded = true;
        console.log('關鍵資源加載完成');
        
        if (this.skyboxLoaded) {
            this.enterScene();
        }
    }

    async loadPrimaryResources() {
        const promises = this.resourceGroups.primary.map(resource => 
            this.loadResource(resource, 30)
        );
        await Promise.all(promises);
        console.log('主要資源加載完成');
    }

    async loadSecondaryResources() {
        const promises = this.resourceGroups.secondary.map(resource => 
            this.loadResource(resource, 30)
        );
        await Promise.all(promises);
        this.allResourcesLoaded = true;
        console.log('所有資源加載完成');
    }

    loadResource(resource, weightPercentage) {
        return new Promise((resolve, reject) => {
            const tagName = resource.tagName.toLowerCase();
            
            if (tagName === 'a-image' || tagName === 'img') {
                const src = resource.getAttribute('src');
                if (src) {
                    this.loadImage(src, weightPercentage).then(resolve).catch(reject);
                } else {
                    resolve();
                }
            } else if (resource.hasAttribute('gltf-model')) {
                this.loadModel(resource, weightPercentage).then(resolve).catch(reject);
            } else {
                resolve();
            }
        });
    }

    loadImage(src, weightPercentage) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.updateProgress(weightPercentage);
                resolve();
            };

            img.onerror = (error) => {
                console.error('圖片加載失敗:', src, error);
                this.updateProgress(weightPercentage);
                resolve();
            };

            img.src = src;
        });
    }

    loadModel(modelEntity, weightPercentage) {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (modelEntity.components && 
                    modelEntity.components['gltf-model'] && 
                    modelEntity.components['gltf-model'].model) {
                    clearInterval(checkInterval);
                    this.updateProgress(weightPercentage);
                    resolve();
                }
            }, 500); // 縮短檢查間隔

            setTimeout(() => {
                clearInterval(checkInterval);
                this.updateProgress(weightPercentage);
                resolve();
            }, 15000); // 縮短超時時間

            modelEntity.addEventListener('model-error', () => {
                clearInterval(checkInterval);
                this.updateProgress(weightPercentage);
                resolve();
            });
        });
    }

    updateProgress(increment) {
        this.loadedResources++;
        this.actualProgress = Math.min(
            Math.floor((this.loadedResources / this.totalResources) * 100),
            99  // 最多只顯示到99%
        );
        
        this.updateDisplayProgress();
        console.log('加載進度:', this.displayProgress + '%');
    }

    updateDisplayProgress() {
        const animate = () => {
            if (this.displayProgress < this.actualProgress) {
                this.displayProgress += 0.5; // 平滑更新
                
                if (this.progressBar) {
                    this.progressBar.style.width = `${this.displayProgress}%`;
                }
                if (this.progressText) {
                    this.progressText.textContent = `${Math.floor(this.displayProgress)}%`;
                }
                
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    enterScene() {
        if (this.criticalResourcesLoaded && this.skyboxLoaded && !this.isEntering) {
            this.isEntering = true;
            
            // 更新到100%
            this.actualProgress = 100;
            this.updateDisplayProgress();

            // 等待進度條動畫完成後再隱藏
            const checkProgress = () => {
                if (this.displayProgress >= 100) {
                    if (this.loadingOverlay) {
                        this.loadingOverlay.classList.add('hidden');
                        setTimeout(() => {
                            if (this.loadingOverlay.parentNode) {
                                this.loadingOverlay.remove();
                            }
                        }, 300);
                    }
                } else {
                    requestAnimationFrame(checkProgress);
                }
            };
            
            requestAnimationFrame(checkProgress);
        } else {
            console.log('等待天空盒和關鍵資源載入完成...');
        }
    }
}

function initLoader() {
    const scene = document.querySelector('a-scene');
    const sky = document.querySelector('a-sky');
    
    const loader = new ResourceLoader();
    
    const checkReady = () => {
        if (scene.hasLoaded && sky) {
            loader.init();
        }
    };

    if (scene.hasLoaded) {
        checkReady();
    } else {
        scene.addEventListener('loaded', checkReady);
    }
}

window.addEventListener('load', initLoader);

window.addEventListener('error', (event) => {
    console.error('全局錯誤:', event.message);
});