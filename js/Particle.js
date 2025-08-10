class Particle {
    constructor(x, y, type, assetLoader, frameCount = 20) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.assetLoader = assetLoader;
        this.alive = true;
        
        if (type === 'explosion') {
            this.frames = [];
            for (let i = 0; i < frameCount; i++) {
                const img = assetLoader.get(`explosion_${i}`);
                if (img) this.frames.push(img);
            }
            this.width = 128;
            this.height = 128;
            this.animation = new Animation(this.frames, 30, false);
        } else if (type === 'muzzle') {
            this.frames = [];
            for (let i = 1; i <= frameCount; i++) {
                const img = assetLoader.get(`muzzle_${i}`);
                if (img) this.frames.push(img);
            }
            this.width = 32;
            this.height = 32;
            this.animation = new Animation(this.frames, 20, false);
        } else if (type === 'spark') {
            this.width = 4;
            this.height = 4;
            this.vx = (Math.random() - 0.5) * 200;
            this.vy = (Math.random() - 0.5) * 200;
            this.lifetime = 300;
            this.color = `hsl(${30 + Math.random() * 30}, 100%, ${50 + Math.random() * 50}%)`;
        } else if (type === 'blood') {
            this.width = 3;
            this.height = 3;
            this.vx = (Math.random() - 0.5) * 150;
            this.vy = Math.random() * -100 - 50;
            this.gravity = 500;
            this.lifetime = 500;
            this.color = `hsla(0, 70%, ${30 + Math.random() * 20}%, ${0.8 + Math.random() * 0.2})`;
        }
    }

    update(deltaTime, game) {
        if (!this.alive) return;
        
        if (this.animation) {
            this.animation.update(deltaTime);
            if (this.animation.isFinished()) {
                this.destroy(game);
            }
        } else {
            const dt = deltaTime / 1000;
            
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            
            if (this.gravity) {
                this.vy += this.gravity * dt;
            }
            
            if (this.vx) {
                this.vx *= 0.98;
            }
            
            this.lifetime -= deltaTime;
            if (this.lifetime <= 0) {
                this.destroy(game);
            }
        }
    }

    destroy(game) {
        this.alive = false;
        const index = game.particles.indexOf(this);
        if (index > -1) {
            game.particles.splice(index, 1);
        }
    }

    render(ctx, camera) {
        if (!this.alive) return;
        
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        if (this.animation) {
            const frame = this.animation.getCurrentFrame();
            if (frame) {
                ctx.drawImage(frame, 
                    screenX - this.width/2, 
                    screenY - this.height/2, 
                    this.width, 
                    this.height
                );
            }
        } else {
            ctx.save();
            
            if (this.lifetime) {
                ctx.globalAlpha = Math.max(0, this.lifetime / 500);
            }
            
            ctx.fillStyle = this.color || '#fff';
            ctx.fillRect(screenX - this.width/2, screenY - this.height/2, this.width, this.height);
            
            ctx.restore();
        }
    }
}

class ParticleSystem {
    static createExplosion(x, y, game, assetLoader) {
        const explosion = new Particle(x, y, 'explosion', assetLoader);
        game.particles.push(explosion);
        
        for (let i = 0; i < 15; i++) {
            const spark = new Particle(
                x + (Math.random() - 0.5) * 30,
                y + (Math.random() - 0.5) * 30,
                'spark',
                assetLoader
            );
            game.particles.push(spark);
        }
    }

    static createBloodSplatter(x, y, game, assetLoader) {
        for (let i = 0; i < 10; i++) {
            const blood = new Particle(
                x + (Math.random() - 0.5) * 10,
                y + (Math.random() - 0.5) * 10,
                'blood',
                assetLoader
            );
            game.particles.push(blood);
        }
    }

    static createDeathEffect(entity, game, assetLoader) {
        const x = entity.x + entity.width / 2;
        const y = entity.y + entity.height / 2;
        
        if (entity.team === 'zombie') {
            this.createBloodSplatter(x, y, game, assetLoader);
        } else {
            for (let i = 0; i < 8; i++) {
                const spark = new Particle(
                    x + (Math.random() - 0.5) * 20,
                    y + (Math.random() - 0.5) * 20,
                    'spark',
                    assetLoader
                );
                game.particles.push(spark);
            }
        }
    }
}