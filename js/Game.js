class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.worldWidth = 2000;
        this.worldHeight = 1500;
        
        this.camera = {
            x: 0,
            y: 0,
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        this.player = null;
        this.enemies = [];
        this.zombies = [];
        this.bullets = [];
        this.particles = [];
        this.environment = [];
        
        this.wave = 1;
        this.waveTimer = 0;
        this.waveDelay = 3000;
        this.baseEnemiesPerWave = 3;
        this.baseZombiesPerWave = 6;
        this.maxEnemiesPerWave = 10;
        this.maxZombiesPerWave = 20;
        
        this.gameState = 'menu';
        this.selectedHero = null;
        this.assetLoader = new AssetLoader();
        
        this.lastTime = 0;
        this.deltaTime = 0;
        
        this.assetsLoaded = false;
        this.init();
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.setupUI();
        this.showLoadingScreen();
        this.loadAssets();
    }

    showLoadingScreen() {
        document.getElementById('character-selection').classList.remove('active');
        document.getElementById('loading-screen').classList.add('active');
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.camera.width = this.canvas.width;
        this.camera.height = this.canvas.height;
    }

    setupUI() {
        const heroCards = document.querySelectorAll('.hero-card');
        const startButton = document.getElementById('start-game');
        const restartButton = document.getElementById('restart-game');
        
        heroCards.forEach(card => {
            card.addEventListener('click', () => {
                heroCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.selectedHero = card.dataset.hero;
                startButton.disabled = false;
            });
        });
        
        startButton.addEventListener('click', () => {
            if (this.selectedHero) {
                this.startGame();
            }
        });
        
        restartButton.addEventListener('click', () => {
            this.resetGame();
        });
    }

    async loadAssets() {
        // Load assets for heroes, soldiers, and zombies
        const loadingAssets = [
            // Hero assets (for main character)
            { key: 'hero1_idle_1', src: 'HEROES/sequence/hero1/idle.png' },
            { key: 'hero1_run_1', src: 'HEROES/sequence/hero1/run (1).png' },
            { key: 'hero1_run_2', src: 'HEROES/sequence/hero1/run (2).png' },
            { key: 'hero1_run_3', src: 'HEROES/sequence/hero1/run (3).png' },
            { key: 'hero1_walk_1', src: 'HEROES/sequence/hero1/walk (1).png' },
            { key: 'hero1_walk_2', src: 'HEROES/sequence/hero1/walk (2).png' },
            { key: 'hero1_shoot_1', src: 'HEROES/sequence/hero1/shoot (1).png' },
            { key: 'hero1_die_1', src: 'HEROES/sequence/hero1/die (1).png' },
            { key: 'hero1_hurt_1', src: 'HEROES/sequence/hero1/hurt.png' },
            { key: 'hero1_crouch_1', src: 'HEROES/sequence/hero1/crouch (1).png' },
            { key: 'hero1_jump_1', src: 'HEROES/sequence/hero1/jump (1).png' },
            
            // Soldier assets for enemies
            { key: 'Soldier1_Idle_0', src: 'Soldier1/Idle__000.png' },
            { key: 'Soldier1_Idle_1', src: 'Soldier1/Idle__001.png' },
            { key: 'Soldier1_Run_0', src: 'Soldier1/Run__000.png' },
            { key: 'Soldier1_Run_1', src: 'Soldier1/Run__001.png' },
            { key: 'Soldier1_Shoot_0', src: 'Soldier1/Shoot__000.png' },
            { key: 'Soldier1_Dead_0', src: 'Soldier1/Dead__000.png' },
            
            { key: 'Soldier2_Idle_0', src: 'Soldier2/Idle__000.png' },
            { key: 'Soldier2_Run_0', src: 'Soldier2/Run__000.png' },
            { key: 'Soldier2_Shoot_0', src: 'Soldier2/Shoot__000.png' },
            { key: 'Soldier2_Dead_0', src: 'Soldier2/Dead__000.png' },
            
            { key: 'Soldier3_Idle_0', src: 'Soldier3/Idle__000.png' },
            { key: 'Soldier3_Run_0', src: 'Soldier3/Run__000.png' },
            { key: 'Soldier3_Shoot_0', src: 'Soldier3/Shoot__000.png' },
            { key: 'Soldier3_Dead_0', src: 'Soldier3/Dead__000.png' },
            
            { key: 'Soldier4_Idle_0', src: 'Soldier4/Idle__000.png' },
            { key: 'Soldier4_Run_0', src: 'Soldier4/Run__000.png' },
            { key: 'Soldier4_Shoot_0', src: 'Soldier4/Shoot__000.png' },
            { key: 'Soldier4_Dead_0', src: 'Soldier4/Dead__000.png' },
            
            // Zombie assets with multiple walking frames
            { key: 'Zombie01_Idle_0', src: 'Zombies/Zombie01/Idle (1).png' },
            { key: 'Zombie01_Walk_0', src: 'Zombies/Zombie01/Walk (1).png' },
            { key: 'Zombie01_Walk_1', src: 'Zombies/Zombie01/Walk (2).png' },
            { key: 'Zombie01_Walk_2', src: 'Zombies/Zombie01/Walk (3).png' },
            { key: 'Zombie01_Attack_0', src: 'Zombies/Zombie01/Attack (1).png' },
            { key: 'Zombie01_Dead_0', src: 'Zombies/Zombie01/Dead (1).png' },
            
            { key: 'Zombie02_Idle_0', src: 'Zombies/Zombie02/Idle (1).png' },
            { key: 'Zombie02_Walk_0', src: 'Zombies/Zombie02/Walk (1).png' },
            { key: 'Zombie02_Walk_1', src: 'Zombies/Zombie02/Walk (2).png' },
            
            { key: 'Zombie3_Idle_0', src: 'Zombies/Zombie3/animation/Idle1.png' },
            { key: 'Zombie3_Walk_0', src: 'Zombies/Zombie3/animation/Walk1.png' },
            { key: 'Zombie3_Walk_1', src: 'Zombies/Zombie3/animation/Walk2.png' },
            { key: 'Zombie3_Run_0', src: 'Zombies/Zombie3/animation/Run1.png' },
            { key: 'Zombie3_Attack_0', src: 'Zombies/Zombie3/animation/Attack1.png' },
            
            // Basic effects
            { key: 'bullet', src: 'HEROES/Bullet.png' }
        ];
        
        const progressBar = document.getElementById('loading-progress');
        const loadingText = document.getElementById('loading-text');
        
        this.assetLoader.onProgress = (loaded, total) => {
            const percentage = Math.floor((loaded / total) * 100);
            progressBar.style.width = percentage + '%';
            loadingText.textContent = `Loading assets... ${loaded}/${total} (${percentage}%)`;
        };
        
        this.assetLoader.onComplete = () => {
            console.log('Assets loading completed!');
            console.log('Total assets in loader:', Object.keys(this.assetLoader.assets).length);
            
            // Debug loaded assets
            console.log('Checking loaded assets:');
            console.log('hero1_idle_1:', this.assetLoader.get('hero1_idle_1'));
            console.log('hero1_run_1:', this.assetLoader.get('hero1_run_1'));
            console.log('Soldier1_Idle_0:', this.assetLoader.get('Soldier1_Idle_0'));
            console.log('Zombie01_Idle_0:', this.assetLoader.get('Zombie01_Idle_0'));
            console.log('Zombie01_Walk_1:', this.assetLoader.get('Zombie01_Walk_1'));
            console.log('All loaded asset keys:', Object.keys(this.assetLoader.assets));
            
            this.assetsLoaded = true;
            this.showCharacterSelection();
        };
        
        try {
            await this.assetLoader.loadAssets(loadingAssets);
        } catch (error) {
            console.error('Failed to load some assets:', error);
            loadingText.textContent = 'Some assets failed to load, but game will continue...';
            setTimeout(() => {
                this.assetsLoaded = true;
                this.showCharacterSelection();
            }, 2000);
        }
    }

    showCharacterSelection() {
        document.getElementById('loading-screen').classList.remove('active');
        document.getElementById('character-selection').classList.add('active');
    }

    startGame() {
        if (!this.assetsLoaded) {
            console.warn('Assets not loaded yet, cannot start game');
            return;
        }
        
        document.getElementById('character-selection').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');
        
        this.gameState = 'playing';
        this.wave = 1;
        
        this.player = new Player(
            this.worldWidth / 2,
            this.worldHeight / 2,
            this.selectedHero,
            this.assetLoader
        );
        
        this.generateEnvironment();
        this.spawnWave();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    generateEnvironment() {
        for (let i = 0; i < 10; i++) {
            const tree = {
                x: Math.random() * this.worldWidth,
                y: Math.random() * this.worldHeight,
                type: 'tree',
                sprite: this.assetLoader.get(`tree_${Math.floor(Math.random() * 3) + 1}`)
            };
            this.environment.push(tree);
        }
        
        for (let i = 0; i < 5; i++) {
            const stone = {
                x: Math.random() * this.worldWidth,
                y: Math.random() * this.worldHeight,
                type: 'stone',
                sprite: this.assetLoader.get(`stone_${Math.floor(Math.random() * 2) + 1}`)
            };
            this.environment.push(stone);
        }
    }

    spawnWave() {
        const enemyTypes = ['Soldier1', 'Soldier2', 'Soldier3', 'Soldier4'];
        const zombieTypes = ['Zombie01', 'Zombie02', 'Zombie3'];
        
        // Calculate enemies for this wave with progressive difficulty
        const enemyCount = Math.min(
            this.baseEnemiesPerWave + Math.floor(this.wave * 0.5),
            this.maxEnemiesPerWave
        );
        
        const zombieCount = Math.min(
            this.baseZombiesPerWave + Math.floor(this.wave * 0.7),
            this.maxZombiesPerWave
        );
        
        console.log(`Wave ${this.wave}: Spawning ${enemyCount} soldiers and ${zombieCount} zombies`);
        
        // Spawn soldiers
        for (let i = 0; i < enemyCount; i++) {
            const angle = (Math.PI * 2 / enemyCount) * i + Math.random() * 0.5;
            const distance = 400 + Math.random() * 300;
            const x = this.player.x + Math.cos(angle) * distance;
            const y = this.player.y + Math.sin(angle) * distance;
            
            const enemy = new Enemy(
                Math.max(64, Math.min(x, this.worldWidth - 64)),
                Math.max(64, Math.min(y, this.worldHeight - 64)),
                enemyTypes[Math.floor(Math.random() * enemyTypes.length)],
                this.assetLoader
            );
            
            // Make enemies stronger in later waves
            enemy.maxHealth = 80 + (this.wave * 10);
            enemy.health = enemy.maxHealth;
            enemy.speed = 80 + (this.wave * 5);
            
            this.enemies.push(enemy);
        }
        
        // Spawn zombies
        for (let i = 0; i < zombieCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 300 + Math.random() * 400;
            const x = this.player.x + Math.cos(angle) * distance;
            const y = this.player.y + Math.sin(angle) * distance;
            
            const zombie = new Zombie(
                Math.max(64, Math.min(x, this.worldWidth - 64)),
                Math.max(64, Math.min(y, this.worldHeight - 64)),
                zombieTypes[Math.floor(Math.random() * zombieTypes.length)],
                this.assetLoader
            );
            
            // Make zombies stronger in later waves
            zombie.maxHealth = 60 + (this.wave * 8);
            zombie.health = zombie.maxHealth;
            zombie.speed = 40 + (this.wave * 3);
            
            this.zombies.push(zombie);
        }
    }

    gameLoop(currentTime) {
        if (this.gameState !== 'playing') return;
        
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (this.deltaTime > 100) this.deltaTime = 100;
        
        this.update(this.deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        if (this.player) {
            this.player.update(deltaTime, this);
            this.updateCamera();
            this.updateUI();
            
            if (!this.player.alive) {
                this.gameOver();
                return;
            }
        }
        
        this.enemies.forEach(enemy => enemy.update(deltaTime, this));
        this.zombies.forEach(zombie => zombie.update(deltaTime, this));
        this.bullets.forEach(bullet => bullet.update(deltaTime, this));
        this.particles.forEach(particle => particle.update(deltaTime, this));
        
        // Remove dead entities and create death effects
        this.enemies = this.enemies.filter(enemy => {
            if (!enemy.alive && enemy.animationManager.isFinished()) {
                this.createDeathExplosion(enemy);
                return false;
            }
            return true;
        });
        
        this.zombies = this.zombies.filter(zombie => {
            if (!zombie.alive && zombie.animationManager.isFinished()) {
                this.createDeathExplosion(zombie);
                return false;
            }
            return true;
        });
        
        this.bullets = this.bullets.filter(b => b.alive);
        this.particles = this.particles.filter(p => p.alive);
        
        // Check if wave is complete (all enemies and zombies dead)
        const aliveEnemies = this.enemies.filter(e => e.alive).length;
        const aliveZombies = this.zombies.filter(z => z.alive).length;
        
        if (aliveEnemies === 0 && aliveZombies === 0) {
            this.waveTimer += deltaTime;
            if (this.waveTimer >= this.waveDelay) {
                this.waveTimer = 0;
                this.wave++;
                
                // Bonus score for completing wave
                const waveBonus = 1000 + (this.wave * 250);
                this.player.addScore(waveBonus);
                
                // Heal player slightly between waves
                this.player.health = Math.min(this.player.maxHealth, this.player.health + 20);
                
                this.spawnWave();
            }
        } else {
            this.waveTimer = 0; // Reset timer if enemies are still alive
        }
    }

    updateCamera() {
        const targetX = this.player.x - this.camera.width / 2;
        const targetY = this.player.y - this.camera.height / 2;
        
        this.camera.x = Math.max(0, Math.min(targetX, this.worldWidth - this.camera.width));
        this.camera.y = Math.max(0, Math.min(targetY, this.worldHeight - this.camera.height));
    }

    updateUI() {
        const healthBar = document.getElementById('player-health');
        const scoreValue = document.getElementById('score-value');
        const waveValue = document.getElementById('wave-value');
        
        if (healthBar) {
            const healthPercent = (this.player.health / this.player.maxHealth) * 100;
            healthBar.style.width = `${healthPercent}%`;
        }
        
        if (scoreValue) {
            scoreValue.textContent = this.player.score;
        }
        
        if (waveValue) {
            waveValue.textContent = this.wave;
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#2a4d3a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.renderGrid();
        
        this.environment.forEach(obj => {
            if (obj.sprite) {
                this.ctx.drawImage(
                    obj.sprite,
                    obj.x - this.camera.x,
                    obj.y - this.camera.y,
                    64, 64
                );
            }
        });
        
        const allEntities = [
            ...this.zombies,
            ...this.enemies,
            this.player
        ].filter(e => e).sort((a, b) => a.y - b.y);
        
        allEntities.forEach(entity => entity.render(this.ctx, this.camera));
        
        this.bullets.forEach(bullet => bullet.render(this.ctx, this.camera));
        this.particles.forEach(particle => particle.render(this.ctx, this.camera));
        
        const aliveEnemiesRender = this.enemies.filter(e => e.alive).length;
        const aliveZombiesRender = this.zombies.filter(z => z.alive).length;
        
        if (aliveEnemiesRender === 0 && aliveZombiesRender === 0) {
            this.renderWaveComplete();
        } else {
            this.renderWaveProgress(aliveEnemiesRender, aliveZombiesRender);
        }
    }

    renderGrid() {
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 64;
        const startX = Math.floor(this.camera.x / gridSize) * gridSize;
        const startY = Math.floor(this.camera.y / gridSize) * gridSize;
        
        for (let x = startX; x < this.camera.x + this.camera.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x - this.camera.x, 0);
            this.ctx.lineTo(x - this.camera.x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = startY; y < this.camera.y + this.camera.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y - this.camera.y);
            this.ctx.lineTo(this.canvas.width, y - this.camera.y);
            this.ctx.stroke();
        }
    }

    renderWaveComplete() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, this.canvas.height / 2 - 60, this.canvas.width, 120);
        
        this.ctx.fillStyle = '#ffd93d';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('WAVE COMPLETE!', this.canvas.width / 2, this.canvas.height / 2 - 10);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Next wave in ${Math.ceil((this.waveDelay - this.waveTimer) / 1000)}...`, 
            this.canvas.width / 2, this.canvas.height / 2 + 25);
            
        const waveBonus = 1000 + (this.wave * 250);
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillText(`Wave Bonus: +${waveBonus} points`, 
            this.canvas.width / 2, this.canvas.height / 2 + 50);
        this.ctx.restore();
    }

    renderWaveProgress(aliveEnemies, aliveZombies) {
        this.ctx.save();
        
        // Position it in the bottom right corner instead
        const panelWidth = 280;
        const panelHeight = 100;
        const x = this.canvas.width - panelWidth - 20;
        const y = this.canvas.height - panelHeight - 20;
        
        // Background with gradient
        const gradient = this.ctx.createLinearGradient(x, y, x, y + panelHeight);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(50, 50, 50, 0.9)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, y, panelWidth, panelHeight);
        
        // Border
        this.ctx.strokeStyle = 'rgba(255, 215, 61, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, panelWidth, panelHeight);
        
        // Wave title
        this.ctx.fillStyle = '#ffd93d';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`WAVE ${this.wave}`, x + panelWidth/2, y + 35);
        
        // Enemy counts
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'left';
        
        // Soldiers count with icon
        this.ctx.fillStyle = '#ff6666';
        this.ctx.fillText(`🪖 ${aliveEnemies}`, x + 20, y + 65);
        
        // Zombies count with icon
        this.ctx.fillStyle = '#66ff66';
        this.ctx.fillText(`🧟 ${aliveZombies}`, x + 140, y + 65);
        
        // Labels
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#cccccc';
        this.ctx.fillText('SOLDIERS', x + 20, y + 85);
        this.ctx.fillText('ZOMBIES', x + 140, y + 85);
        
        this.ctx.restore();
    }

    createDeathExplosion(entity) {
        const x = entity.x + entity.width / 2;
        const y = entity.y + entity.height / 2;
        
        // Create explosion particles
        for (let i = 0; i < 12; i++) {
            const spark = new Particle(
                x + (Math.random() - 0.5) * 30,
                y + (Math.random() - 0.5) * 30,
                'spark',
                this.assetLoader
            );
            this.particles.push(spark);
        }
        
        // Create blood/debris effect for zombies
        if (entity.team === 'zombie') {
            for (let i = 0; i < 8; i++) {
                const blood = new Particle(
                    x + (Math.random() - 0.5) * 20,
                    y + (Math.random() - 0.5) * 20,
                    'blood',
                    this.assetLoader
                );
                this.particles.push(blood);
            }
        }
        
        console.log(`💥 Death explosion created for ${entity.team}`);
    }

    removeEnemy(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.createDeathExplosion(enemy);
            this.enemies.splice(index, 1);
        }
    }

    removeZombie(zombie) {
        const index = this.zombies.indexOf(zombie);
        if (index > -1) {
            this.createDeathExplosion(zombie);
            this.zombies.splice(index, 1);
        }
    }

    gameOver() {
        this.gameState = 'gameover';
        
        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('game-over').classList.add('active');
        
        document.getElementById('final-score').textContent = this.player.score;
        document.getElementById('final-wave').textContent = this.wave;
    }

    resetGame() {
        this.player = null;
        this.enemies = [];
        this.zombies = [];
        this.bullets = [];
        this.particles = [];
        this.environment = [];
        this.wave = 1;
        this.waveTimer = 0;
        this.selectedHero = null;
        this.gameState = 'menu';
        
        document.getElementById('game-over').classList.remove('active');
        document.getElementById('character-selection').classList.add('active');
        
        document.querySelectorAll('.hero-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.getElementById('start-game').disabled = true;
    }
}