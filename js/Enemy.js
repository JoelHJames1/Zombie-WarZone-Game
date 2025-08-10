class Enemy extends Entity {
    constructor(x, y, type, assetLoader) {
        super(x, y, 64, 64);
        this.enemyType = type;
        this.assetLoader = assetLoader;
        this.team = 'enemy';
        
        this.speed = 100 + Math.random() * 50;
        this.detectionRange = 500; // Increased detection range
        this.attackRange = 300;
        this.shootCooldown = 0;
        this.shootRate = 1500 + Math.random() * 1000;
        
        this.target = null;
        this.state = 'patrol';
        this.patrolDirection = Math.random() * Math.PI * 2;
        this.patrolTimer = 0;
        this.patrolDuration = 2000 + Math.random() * 3000;
        
        this.maxHealth = 80;
        this.health = this.maxHealth;
        
        this.setupAnimations();
    }

    setupAnimations() {
        if (this.enemyType.startsWith('BADGUY_')) {
            this.setupBadGuyAnimations();
        } else {
            this.setupSoldierAnimations();
        }
    }

    setupSoldierAnimations() {
        const animations = {
            idle: { name: 'Idle', frameCount: 2 },
            run: { name: 'Run', frameCount: 2 },
            shoot: { name: 'Shoot', frameCount: 1 },
            death: { name: 'Dead', frameCount: 1 },
            hurt: { name: 'Idle', frameCount: 1 },
            jump: { name: 'Idle', frameCount: 1 }
        };

        console.log(`Setting up soldier animations for ${this.enemyType}`);

        Object.keys(animations).forEach(animKey => {
            const anim = animations[animKey];
            const frames = [];
            
            for (let i = 0; i < anim.frameCount; i++) {
                const assetKey = `${this.enemyType}_${anim.name}_${i}`;
                const img = this.assetLoader.get(assetKey);
                if (img) {
                    frames.push(img);
                    console.log(`✅ Found enemy frame ${i} for ${animKey}`);
                }
            }

            if (frames.length > 0) {
                const loop = animKey !== 'death' && animKey !== 'hurt';
                const frameRate = animKey === 'run' ? 12 : 8;
                this.animationManager.addAnimation(animKey, new Animation(frames, frameRate, loop));
                console.log(`✅ Added enemy ${animKey} animation with ${frames.length} frames for ${this.enemyType}`);
            } else {
                console.warn(`❌ No frames found for enemy ${animKey} animation for ${this.enemyType}`);
            }
        });

        this.animationManager.play('idle');
    }

    setupBadGuyAnimations() {
        const animations = {
            idle: { name: 'run', frameCount: 4 }, // Use run frames for idle
            run: { name: 'run', frameCount: 4 },
            shoot: { name: 'shoot', frameCount: 2 },
            death: { name: 'death', frameCount: 3 },
            hurt: { name: 'hurt', frameCount: 2 },
            jump: { name: 'jump', frameCount: 1 }
        };

        console.log(`Setting up BADGUY animations for ${this.enemyType}`);

        Object.keys(animations).forEach(animKey => {
            const anim = animations[animKey];
            const frames = [];
            
            for (let i = 1; i <= anim.frameCount; i++) {
                const assetKey = `${this.enemyType}_${anim.name}_${i}`;
                console.log(`Looking for BADGUY asset: ${assetKey}`);
                const img = this.assetLoader.get(assetKey);
                if (img) {
                    frames.push(img);
                    console.log(`✅ Found BADGUY frame ${i} for ${animKey}`);
                } else {
                    console.log(`❌ Missing BADGUY frame ${i} for ${animKey}`);
                }
            }

            if (frames.length > 0) {
                const loop = animKey !== 'death' && animKey !== 'hurt';
                const frameRate = animKey === 'run' ? 12 : 8;
                this.animationManager.addAnimation(animKey, new Animation(frames, frameRate, loop));
                console.log(`✅ Added BADGUY ${animKey} animation with ${frames.length} frames for ${this.enemyType}`);
            } else {
                console.warn(`❌ No frames found for BADGUY ${animKey} animation for ${this.enemyType}`);
            }
        });

        this.animationManager.play('idle');
    }

    update(deltaTime, game) {
        if (!this.alive) {
            super.update(deltaTime, game);
            if (this.animationManager.isFinished()) {
                game.removeEnemy(this);
            }
            return;
        }

        this.findTarget(game);
        this.updateBehavior(deltaTime, game);
        this.updateAnimation();
        
        super.update(deltaTime, game);

        this.x = Math.max(0, Math.min(this.x, game.worldWidth - this.width));
        this.y = Math.max(0, Math.min(this.y, game.worldHeight - this.height));
    }

    findTarget(game) {
        let closestTarget = null;
        let closestDistance = this.detectionRange;

        if (game.player && game.player.alive) {
            const distance = this.getDistance(game.player);
            if (distance < closestDistance) {
                closestTarget = game.player;
                closestDistance = distance;
            }
        }

        game.zombies.forEach(zombie => {
            if (zombie.alive) {
                const distance = this.getDistance(zombie);
                if (distance < closestDistance) {
                    closestTarget = zombie;
                    closestDistance = distance;
                }
            }
        });

        this.target = closestTarget;
    }

    updateBehavior(deltaTime, game) {
        const dt = deltaTime / 1000;

        if (this.target && this.target.alive) {
            const distance = this.getDistance(this.target);
            
            if (distance < this.attackRange) {
                this.state = 'attack';
                this.vx = 0;
                this.vy = 0;
                
                this.facingRight = this.target.x > this.x;
                
                if (this.shootCooldown <= 0) {
                    this.shoot(game);
                    this.shootCooldown = this.shootRate;
                }
            } else {
                this.state = 'chase';
                const angle = this.getAngleTo(this.target);
                this.vx = Math.cos(angle) * this.speed;
                this.vy = Math.sin(angle) * this.speed;
                
                this.facingRight = this.vx > 0;
            }
        } else {
            this.state = 'patrol';
            this.patrol(deltaTime);
        }

        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
        }
    }

    patrol(deltaTime) {
        this.patrolTimer += deltaTime;
        
        if (this.patrolTimer >= this.patrolDuration) {
            this.patrolTimer = 0;
            this.patrolDuration = 2000 + Math.random() * 3000;
            this.patrolDirection = Math.random() * Math.PI * 2;
        }
        
        this.vx = Math.cos(this.patrolDirection) * this.speed * 0.5;
        this.vy = Math.sin(this.patrolDirection) * this.speed * 0.5;
        
        this.facingRight = this.vx > 0;
    }

    shoot(game) {
        if (!this.target) return;
        
        // Position bullet at enemy center
        const bulletX = this.x + this.width / 2;
        const bulletY = this.y + this.height / 2;
        const angle = this.getAngleTo(this.target);
        
        const bullet = new Bullet(bulletX, bulletY, angle, this.team, this.assetLoader);
        game.bullets.push(bullet);

        const muzzleFlash = new Particle(
            bulletX,
            bulletY,
            'muzzle',
            this.assetLoader,
            5
        );
        game.particles.push(muzzleFlash);
    }

    updateAnimation() {
        if (!this.alive) return;

        switch(this.state) {
            case 'attack':
                this.animationManager.play('shoot');
                break;
            case 'chase':
                this.animationManager.play('run');
                break;
            case 'patrol':
                if (Math.abs(this.vx) > 10 || Math.abs(this.vy) > 10) {
                    this.animationManager.play('run');
                } else {
                    this.animationManager.play('idle');
                }
                break;
            default:
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
            }, 300);
        }
    }

    die() {
        super.die();
        this.vx = 0;
        this.vy = 0;
        this.animationManager.play('death');
        
        // Set a timer to remove the enemy after death animation
        setTimeout(() => {
            this.animationManager.finished = true;
        }, 1000);
    }
}