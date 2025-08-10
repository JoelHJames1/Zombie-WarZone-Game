class Player extends Entity {
    constructor(x, y, heroType, assetLoader) {
        super(x, y, 64, 64);
        this.heroType = heroType;
        this.assetLoader = assetLoader;
        this.team = 'player';
        
        this.speed = 200;
        this.jumpForce = 500;
        this.isJumping = false;
        this.isGrounded = true;
        this.isShooting = false;
        this.shootCooldown = 0;
        this.shootRate = 250;
        
        this.keys = {
            left: false,
            right: false,
            up: false,
            down: false,
            jump: false,
            shoot: false,
            crouch: false
        };

        this.score = 0;
        this.kills = 0;
        
        this.setupAnimations();
        this.setupControls();
    }

    setupAnimations() {
        if (this.heroType.startsWith('Soldier')) {
            this.setupSoldierAnimations();
        } else {
            this.setupHeroAnimations();
        }
    }

    setupSoldierAnimations() {
        const animations = {
            idle: { name: 'Idle', frameCount: 2 }, // Reduced for testing
            run: { name: 'Run', frameCount: 2 },
            walk: { name: 'Run', frameCount: 2 }, // Use run for walk
            jump: { name: 'Idle', frameCount: 2 }, // Use idle for jump
            shoot: { name: 'Shoot', frameCount: 1 },
            die: { name: 'Dead', frameCount: 1 },
            hurt: { name: 'Idle', frameCount: 1 }, // Use idle for hurt
            crouch: { name: 'Idle', frameCount: 1 } // Use idle for crouch
        };

        console.log(`Setting up soldier animations for ${this.heroType}`);

        Object.keys(animations).forEach(animKey => {
            const anim = animations[animKey];
            const frames = [];
            
            for (let i = 0; i < anim.frameCount; i++) {
                const assetKey = `${this.heroType}_${anim.name}_${i}`;
                console.log(`Looking for asset: ${assetKey}`);
                const img = this.assetLoader.get(assetKey);
                if (img) {
                    frames.push(img);
                    console.log(`✅ Found frame ${i} for ${animKey}`);
                } else {
                    console.log(`❌ Missing frame ${i} for ${animKey}`);
                }
            }

            if (frames.length > 0) {
                const loop = animKey !== 'die' && animKey !== 'hurt';
                const frameRate = animKey === 'run' ? 12 : 8;
                this.animationManager.addAnimation(animKey, new Animation(frames, frameRate, loop));
                console.log(`✅ Added ${animKey} animation with ${frames.length} frames for ${this.heroType}`);
            } else {
                console.warn(`❌ No frames found for ${animKey} animation for ${this.heroType}`);
            }
        });

        this.animationManager.play('idle');
    }

    setupHeroAnimations() {
        const animations = {
            idle: ['idle'],
            run: ['run'],
            walk: ['walk'],
            jump: ['jump'],
            shoot: ['shoot'],
            die: ['die'],
            hurt: ['hurt'],
            crouch: ['crouch']
        };

        Object.keys(animations).forEach(animName => {
            const frames = [];
            const animType = animations[animName][0];
            
            let frameCount = 1;
            switch(animType) {
                case 'run': frameCount = 12; break;
                case 'walk': frameCount = 8; break;
                case 'shoot': frameCount = 5; break;
                case 'die': frameCount = 5; break;
                case 'jump': frameCount = 3; break;
                case 'crouch': frameCount = 4; break;
            }

            if (animType === 'idle' || animType === 'hurt') {
                const img = this.assetLoader.get(`${this.heroType}_${animType}_1`);
                if (img) frames.push(img);
            } else {
                for (let i = 1; i <= frameCount; i++) {
                    const img = this.assetLoader.get(`${this.heroType}_${animType}_${i}`);
                    if (img) frames.push(img);
                }
            }

            if (frames.length > 0) {
                const loop = animType !== 'die' && animType !== 'hurt';
                this.animationManager.addAnimation(animName, new Animation(frames, 10, loop));
            }
        });

        this.animationManager.play('idle');
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case 'a':
                case 'arrowleft':
                    this.keys.left = true;
                    break;
                case 'd':
                case 'arrowright':
                    this.keys.right = true;
                    break;
                case 'w':
                case 'arrowup':
                    this.keys.up = true;
                    break;
                case 's':
                case 'arrowdown':
                    this.keys.down = true;
                    break;
                case ' ':
                    this.keys.jump = true;
                    break;
                case 'shift':
                    this.keys.crouch = true;
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch(e.key.toLowerCase()) {
                case 'a':
                case 'arrowleft':
                    this.keys.left = false;
                    break;
                case 'd':
                case 'arrowright':
                    this.keys.right = false;
                    break;
                case 'w':
                case 'arrowup':
                    this.keys.up = false;
                    break;
                case 's':
                case 'arrowdown':
                    this.keys.down = false;
                    break;
                case ' ':
                    this.keys.jump = false;
                    break;
                case 'shift':
                    this.keys.crouch = false;
                    break;
            }
        });

        window.addEventListener('mousedown', () => {
            this.keys.shoot = true;
        });

        window.addEventListener('mouseup', () => {
            this.keys.shoot = false;
        });

        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
    }

    update(deltaTime, game) {
        if (!this.alive) {
            super.update(deltaTime, game);
            return;
        }

        this.handleMovement(deltaTime);

        // Update facing direction based on mouse position so the player aims correctly
        if (this.mouseX !== undefined && this.mouseY !== undefined) {
            const worldMouseX = this.mouseX + game.camera.x;
            this.facingRight = worldMouseX >= this.x + this.width / 2;
        }

        this.handleShooting(deltaTime, game);
        this.updateAnimation();
        
        super.update(deltaTime, game);

        this.x = Math.max(0, Math.min(this.x, game.worldWidth - this.width));
        this.y = Math.max(0, Math.min(this.y, game.worldHeight - this.height));
    }

    handleMovement(deltaTime) {
        const dt = deltaTime / 1000;
        
        if (this.keys.crouch) {
            this.vx = 0;
            return;
        }

        if (this.keys.left) {
            this.vx = -this.speed;
            this.facingRight = false;
        } else if (this.keys.right) {
            this.vx = this.speed;
            this.facingRight = true;
        } else {
            this.vx *= 0.85;
        }

        if (this.keys.up) {
            this.vy = -this.speed;
        } else if (this.keys.down) {
            this.vy = this.speed;
        } else {
            this.vy *= 0.85;
        }

        if (this.keys.jump && this.isGrounded) {
            this.vy = -this.jumpForce;
            this.isJumping = true;
            this.isGrounded = false;
        }
    }

    handleShooting(deltaTime, game) {
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
        }

        if (this.keys.shoot && this.shootCooldown <= 0) {
            this.shoot(game);
            this.shootCooldown = this.shootRate;
            this.isShooting = true;
        } else if (!this.keys.shoot) {
            this.isShooting = false;
        }
    }

    shoot(game) {
        // Base position from the player's center
        const originX = this.x + this.width / 2;
        const originY = this.y + this.height / 2;

        let angle = this.facingRight ? 0 : Math.PI;

        if (this.mouseX !== undefined && this.mouseY !== undefined) {
            const camera = game.camera;
            const worldMouseX = this.mouseX + camera.x;
            const worldMouseY = this.mouseY + camera.y;
            angle = Math.atan2(worldMouseY - originY, worldMouseX - originX);
        }

        // Offset bullet so it spawns at the muzzle of the gun
        const offset = 32;
        const bulletX = originX + Math.cos(angle) * offset;
        const bulletY = originY + Math.sin(angle) * offset;

        const bullet = new Bullet(bulletX, bulletY, angle, this.team, this.assetLoader);
        game.bullets.push(bullet);

        const muzzleFlash = new Particle(
            bulletX,
            bulletY,
            'muzzle',
            this.assetLoader,
            5,
            angle
        );
        game.particles.push(muzzleFlash);
    }

    updateAnimation() {
        if (!this.alive) return;

        if (this.keys.crouch) {
            this.animationManager.play('crouch');
        } else if (this.isShooting) {
            this.animationManager.play('shoot');
        } else if (this.isJumping) {
            this.animationManager.play('jump');
        } else if (Math.abs(this.vx) > 50 || Math.abs(this.vy) > 50) {
            if (Math.abs(this.vx) > 150 || Math.abs(this.vy) > 150) {
                this.animationManager.play('run');
            } else {
                this.animationManager.play('walk');
            }
        } else {
            this.animationManager.play('idle');
        }
    }

    takeDamage(amount) {
        super.takeDamage(amount);
        if (this.alive) {
            this.animationManager.play('hurt', true);
            setTimeout(() => {
                if (this.alive) {
                    this.updateAnimation();
                }
            }, 500);
        }
    }

    addScore(points) {
        this.score += points;
    }

    addKill() {
        this.kills++;
        this.addScore(100);
    }
}