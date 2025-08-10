class Bullet {
    constructor(x, y, angle, team, assetLoader) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.team = team;
        this.assetLoader = assetLoader;
        
        this.speed = 600;
        this.damage = 20;
        this.width = 16;
        this.height = 8;
        this.alive = true;
        this.lifeTime = 2000;
        
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        
        this.sprite = assetLoader.get('bullet');
        this.trail = [];
        this.maxTrailLength = 5;
    }

    update(deltaTime, game) {
        if (!this.alive) return;
        
        const dt = deltaTime / 1000;
        
        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        this.trail.forEach((point, index) => {
            point.alpha = (index + 1) / this.trail.length * 0.5;
        });
        
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        
        this.lifeTime -= deltaTime;
        if (this.lifeTime <= 0) {
            this.destroy(game);
            return;
        }
        
        if (this.x < 0 || this.x > game.worldWidth || 
            this.y < 0 || this.y > game.worldHeight) {
            this.destroy(game);
            return;
        }
        
        this.checkCollisions(game);
    }

    checkCollisions(game) {
        const allEntities = [];
        
        if (this.team !== 'player' && game.player && game.player.alive) {
            allEntities.push(game.player);
        }
        
        if (this.team !== 'enemy') {
            game.enemies.forEach(enemy => {
                if (enemy.alive) allEntities.push(enemy);
            });
        }
        
        if (this.team !== 'zombie') {
            game.zombies.forEach(zombie => {
                if (zombie.alive) allEntities.push(zombie);
            });
        }
        
        for (let entity of allEntities) {
            if (this.collidesWith(entity)) {
                entity.takeDamage(this.damage);
                
                if (!entity.alive && this.team === 'player') {
                    game.player.addKill();
                }
                
                this.createImpactEffect(game);
                this.destroy(game);
                break;
            }
        }
    }

    collidesWith(entity) {
        const bounds = entity.getBounds();
        return this.x >= bounds.x && 
               this.x <= bounds.x + bounds.width &&
               this.y >= bounds.y && 
               this.y <= bounds.y + bounds.height;
    }

    createImpactEffect(game) {
        for (let i = 0; i < 3; i++) {
            const particle = new Particle(
                this.x + (Math.random() - 0.5) * 10,
                this.y + (Math.random() - 0.5) * 10,
                'spark',
                this.assetLoader,
                3
            );
            game.particles.push(particle);
        }
    }

    destroy(game) {
        this.alive = false;
        const index = game.bullets.indexOf(this);
        if (index > -1) {
            game.bullets.splice(index, 1);
        }
    }

    render(ctx, camera) {
        if (!this.alive) return;
        
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        this.trail.forEach(point => {
            ctx.save();
            ctx.globalAlpha = point.alpha;
            ctx.fillStyle = '#ffcc00';
            ctx.beginPath();
            ctx.arc(point.x - camera.x, point.y - camera.y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(this.angle);
        
        if (this.sprite) {
            ctx.drawImage(this.sprite, -this.width/2, -this.height/2, this.width, this.height);
        } else {
            ctx.fillStyle = '#ffcc00';
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        }
        
        ctx.restore();
    }
}