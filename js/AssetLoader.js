class AssetLoader {
    constructor() {
        this.assets = {};
        this.loadedCount = 0;
        this.totalCount = 0;
        this.onProgress = null;
        this.onComplete = null;
    }

    loadImage(key, src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.assets[key] = img;
                this.loadedCount++;
                console.log(`✅ Loaded: ${key} from ${src}`);
                if (this.onProgress) {
                    this.onProgress(this.loadedCount, this.totalCount);
                }
                resolve(img);
            };
            img.onerror = () => {
                console.error(`❌ Failed to load: ${key} from ${src}`);
                this.loadedCount++; // Still increment to avoid hanging
                if (this.onProgress) {
                    this.onProgress(this.loadedCount, this.totalCount);
                }
                // Don't reject, just resolve with null so loading continues
                resolve(null);
            };
            img.src = src;
        });
    }

    async loadAssets(assetList) {
        this.totalCount = assetList.length;
        this.loadedCount = 0;

        const promises = assetList.map(asset => 
            this.loadImage(asset.key, asset.src)
        );

        await Promise.all(promises);
        
        if (this.onComplete) {
            this.onComplete();
        }
    }

    get(key) {
        return this.assets[key];
    }

    getHeroAssets() {
        const heroes = ['hero1', 'hero2', 'hero3', 'hero4', 'hero5'];
        const animations = ['idle', 'run', 'shoot', 'jump', 'die', 'hurt', 'crouch', 'walk'];
        const assets = [];

        heroes.forEach(hero => {
            assets.push({
                key: `${hero}_portrait`,
                src: `HEROES/${hero.charAt(0).toUpperCase() + hero.slice(1)}.png`
            });

            animations.forEach(anim => {
                let frameCount = 1;
                switch(anim) {
                    case 'run': frameCount = 12; break;
                    case 'walk': frameCount = 8; break;
                    case 'shoot': frameCount = 5; break;
                    case 'die': frameCount = 5; break;
                    case 'jump': frameCount = 3; break;
                    case 'crouch': frameCount = 4; break;
                }

                for (let i = 1; i <= frameCount; i++) {
                    let filename = '';
                    if (anim === 'idle') {
                        filename = `HEROES/sequence/${hero}/idle.png`;
                    } else if (anim === 'hurt') {
                        filename = `HEROES/sequence/${hero}/hurt.png`;
                    } else {
                        filename = `HEROES/sequence/${hero}/${anim} (${i}).png`;
                    }
                    
                    assets.push({
                        key: `${hero}_${anim}_${i}`,
                        src: filename
                    });
                    
                    if (anim === 'idle' || anim === 'hurt') break;
                }
            });
        });

        return assets;
    }

    getSoldierAssets() {
        // Use the Soldier assets for both enemies and heroes
        const soldiers = ['Soldier1', 'Soldier2', 'Soldier3', 'Soldier4'];
        const animations = ['Idle', 'Run', 'Shoot', 'Dead', 'Hurt', 'Jump', 'Crouch', 'Walk'];
        const assets = [];

        soldiers.forEach(soldier => {
            animations.forEach(anim => {
                let frameCount = 10; // Most soldier animations have 10 frames (000-009)
                
                for (let i = 0; i < frameCount; i++) {
                    const frameNum = i.toString().padStart(3, '0');
                    const filename = `${soldier}/${anim}__${frameNum}.png`;
                    
                    assets.push({
                        key: `${soldier}_${anim}_${i}`,
                        src: filename
                    });
                }
            });
        });

        return assets;
    }

    getEnemyAssets() {
        // Just reference soldier assets for enemies
        return this.getSoldierAssets();
    }

    getZombieAssets() {
        const assets = [];

        // Load zombies 01-06 (these use the walk naming pattern)
        const walkZombies = ['Zombies01', 'Zombies02', 'Zombies03', 'Zombies04', 'Zombies05', 'Zombies06'];
        walkZombies.forEach(zombie => {
            const views = [
                { name: 'Front view', file: 'Front view' },
                { name: 'Back view', file: 'Back view' }, 
                { name: 'Side view', file: 'side view' } // Note: lowercase 'side'
            ];
            
            views.forEach(view => {
                for (let i = 0; i < 20; i++) {
                    const filename = `Zombies/${zombie}/${view.name}/${zombie.toLowerCase()}-${view.file} walk_${i.toString().padStart(2, '0')}.png`;
                    assets.push({
                        key: `${zombie}_${view.name.replace(' ', '_')}_${i}`,
                        src: filename
                    });
                }
            });
        });

        // Load zombies 07-10 (these use different naming pattern)
        const viewZombies = [
            { folder: 'Zombies07', prefix: 'zombies08' },
            { folder: 'Zombies08', prefix: 'zombies08' },
            { folder: 'Zombies09', prefix: 'zombies09' },
            { folder: 'Zombies10', prefix: 'zombies10' }
        ];
        
        viewZombies.forEach(zombie => {
            const views = [
                { name: 'Front view', file: 'Front  View' }, // Note: double space
                { name: 'Back view', file: 'Back View' },
                { name: 'Side view', file: 'Side View' }
            ];
            
            views.forEach(view => {
                for (let i = 0; i < 16; i++) {
                    const filename = `Zombies/${zombie.folder}/${view.name}/${zombie.prefix}-${view.file}_${i.toString().padStart(2, '0')}.png`;
                    assets.push({
                        key: `${zombie.folder}_${view.name.replace(' ', '_')}_${i}`,
                        src: filename
                    });
                }
            });
        });

        // Load death animation
        for (let i = 0; i < 15; i++) {
            assets.push({
                key: `zombie_death_${i}`,
                src: `Zombies/Dead Sprite/Dead Sprite-animation_${i.toString().padStart(2, '0')}.png`
            });
        }

        return assets;
    }

    getEffectAssets() {
        const assets = [];

        for (let i = 0; i < 20; i++) {
            assets.push({
                key: `explosion_${i}`,
                src: `Bomb Shoot Fx/BoomFx-animation_${i.toString().padStart(2, '0')}.png`
            });
        }

        ['Bullet1', 'Bullet3', 'bullet2'].forEach(bullet => {
            for (let i = 1; i <= 4; i++) {
                assets.push({
                    key: `${bullet}_${i}`,
                    src: `HEROES/sequence/bullet/${bullet} (${i}).png`
                });
            }
        });

        for (let i = 1; i <= 5; i++) {
            assets.push({
                key: `muzzle_${i}`,
                src: `HEROES/sequence/bullet/muzzle (${i}).png`
            });
        }

        assets.push(
            { key: 'bullet', src: 'HEROES/Bullet.png' },
            { key: 'arrow', src: 'Projectile/Arrow.png' },
            { key: 'bomb', src: 'Projectile/Bomb.png' },
            { key: 'hp_bg', src: 'enemy HP bar/background-bar.png' },
            { key: 'hp_fg', src: 'enemy HP bar/foreground-bar.png' }
        );

        return assets;
    }

    getEnvironmentAssets() {
        const assets = [];
        
        for (let i = 1; i <= 3; i++) {
            assets.push({
                key: `tree_${i}`,
                src: `LAND/items/Tree (${i}).png`
            });
        }

        for (let i = 1; i <= 2; i++) {
            assets.push({
                key: `stone_${i}`,
                src: `LAND/items/Stone (${i}).png`
            });
        }

        assets.push(
            { key: 'crate', src: 'LAND/items/Crate.png' },
            { key: 'mushroom1', src: 'Plants/mushroom-1.png' },
            { key: 'mushroom2', src: 'Plants/mushroom-2.png' }
        );

        for (let i = 1; i <= 10; i++) {
            assets.push({
                key: `grass_tile_${i}`,
                src: `LAND/grass/Grass (${i}).png`
            });
        }

        return assets;
    }

    getAllAssets() {
        return [
            ...this.getHeroAssets(),
            ...this.getSoldierAssets(),
            ...this.getZombieAssets(),
            ...this.getEffectAssets(),
            ...this.getEnvironmentAssets()
        ];
    }
}