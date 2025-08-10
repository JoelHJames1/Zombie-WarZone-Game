class Zombie extends Entity {
    constructor(x, y, type, assetLoader) {
        super(x, y, 56, 56);
        this.zombieType = type || 'Zombies01';
        this.assetLoader = assetLoader;
        this.team = 'zombie';
        
        this.speed = 40 + Math.random() * 30;
        this.detectionRange = 350;
        this.attackRange = 40;
        this.attackDamage = 15;
        this.attackCooldown = 0;
        this.attackRate = 1000;
        
        this.target = null;
        this.state = 'wander';
        this.wanderDirection = Math.random() * Math.PI * 2;
        this.wanderTimer = 0;
        this.wanderDuration = 3000 + Math.random() * 2000;
        
        this.currentState = 'idle';
        
        this.maxHealth = 60;
        this.health = this.maxHealth;
        
        this.setupAnimations();
    }

    setupAnimations() {
        console.log(`Setting up zombie animations for ${this.zombieType}`);
        
        const animations = {
            idle: { name: 'Idle', frameCount: 1 },
            walk: { name: 'Walk', frameCount: 3 }, // Multiple frames for walking animation
            run: { name: 'Walk', frameCount: 3 }, // Use walk for run
            attack: { name: 'Attack', frameCount: 1 },
            death: { name: 'Dead', frameCount: 1 },
            hurt: { name: 'Idle', frameCount: 1 } // Use idle for hurt
        };

        Object.keys(animations).forEach(animKey => {
            const anim = animations[animKey];
            const frames = [];
            
            for (let i = 0; i < anim.frameCount; i++) {
                const assetKey = `${this.zombieType}_${anim.name}_${i}`;
                console.log(`Looking for zombie asset: ${assetKey}`);
                const img = this.assetLoader.get(assetKey);
                if (img) {
                    frames.push(img);
                    console.log(`✅ Found zombie frame ${i} for ${animKey}`);
                } else {
                    console.log(`❌ Missing zombie frame ${i} for ${animKey}`);
                }
            }
            
            if (frames.length > 0) {
                const loop = animKey !== 'death' && animKey !== 'hurt';
                this.animationManager.addAnimation(animKey, new Animation(frames, 8, loop));
                console.log(`✅ Added zombie ${animKey} animation with ${frames.length} frames for ${this.zombieType}`);
            } else {
                console.warn(`❌ No frames found for zombie ${animKey} animation for ${this.zombieType}`);
            }
        });

        this.animationManager.play('idle');
    }

    update(deltaTime, game) {
        if (!this.alive) {
            super.update(deltaTime, game);
            if (this.animationManager.isFinished()) {
                game.removeZombie(this);
            }
            return;
        }

        this.findTarget(game);
        this.updateBehavior(deltaTime, game);
        this.updateAnimationState();
        
        super.update(deltaTime, game);

        this.x = Math.max(0, Math.min(this.x, game.worldWidth - this.width));
        this.y = Math.max(0, Math.min(this.y, game.worldHeight - this.height));
    }

    findTarget(game) {
        let closestTarget = null;
        let closestDistance = this.detectionRange;

        const allTargets = [];
        
        if (game.player && game.player.alive) {
            allTargets.push(game.player);
        }
        
        game.enemies.forEach(enemy => {
            if (enemy.alive) {
                allTargets.push(enemy);
            }
        });

        allTargets.forEach(target => {
            const distance = this.getDistance(target);
            if (distance < closestDistance) {
                closestTarget = target;
                closestDistance = distance;
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
                
                if (this.attackCooldown <= 0) {
                    this.attack();
                    this.attackCooldown = this.attackRate;
                }
            } else {
                this.state = 'chase';
                const angle = this.getAngleTo(this.target);
                this.vx = Math.cos(angle) * this.speed;
                this.vy = Math.sin(angle) * this.speed;
                
                this.facingRight = this.vx > 0;
            }
        } else {
            this.state = 'wander';
            this.wander(deltaTime);
        }

        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
    }

    wander(deltaTime) {
        this.wanderTimer += deltaTime;
        
        if (this.wanderTimer >= this.wanderDuration) {
            this.wanderTimer = 0;
            this.wanderDuration = 3000 + Math.random() * 2000;
            this.wanderDirection = Math.random() * Math.PI * 2;
        }
        
        this.vx = Math.cos(this.wanderDirection) * this.speed * 0.3;
        this.vy = Math.sin(this.wanderDirection) * this.speed * 0.3;
        
        this.facingRight = this.vx > 0;
    }

    attack() {
        if (this.target && this.getDistance(this.target) < this.attackRange) {
            this.target.takeDamage(this.attackDamage);
        }
    }

    updateAnimationState() {
        if (!this.alive) return;

        let newState = 'idle';
        
        switch(this.state) {
            case 'attack':
                newState = 'attack';
                break;
            case 'chase':
                newState = 'walk';
                break;
            case 'wander':
                if (Math.abs(this.vx) > 10 || Math.abs(this.vy) > 10) {
                    newState = 'walk';
                } else {
                    newState = 'idle';
                }
                break;
            default:
                newState = 'idle';
        }

        if (newState !== this.currentState) {
            this.currentState = newState;
            this.animationManager.play(newState);
        }
    }

    takeDamage(amount) {
        super.takeDamage(amount);
        
        const knockback = 50;
        if (this.target) {
            const angle = this.getAngleTo(this.target) + Math.PI;
            this.vx = Math.cos(angle) * knockback;
            this.vy = Math.sin(angle) * knockback;
        }
    }

    die() {
        super.die();
        this.vx = 0;
        this.vy = 0;
        this.currentState = 'death';
        this.animationManager.play('death');
        
        // Set a timer to remove the zombie after death animation
        setTimeout(() => {
            this.animationManager.finished = true;
        }, 1000);
    }
}