class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.vx = 0;
        this.vy = 0;
        this.health = 100;
        this.maxHealth = 100;
        this.alive = true;
        this.animationManager = new AnimationManager();
        this.facingRight = true;
        this.team = 'neutral';
    }

    update(deltaTime, game) {
        this.x += this.vx * deltaTime / 1000;
        this.y += this.vy * deltaTime / 1000;

        this.animationManager.update(deltaTime);

        if (this.health <= 0 && this.alive) {
            this.die();
        }
    }

    render(ctx, camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        ctx.save();
        
        if (!this.facingRight) {
            ctx.translate(screenX + this.width, screenY);
            ctx.scale(-1, 1);
            ctx.translate(-screenX - this.width, -screenY);
        }

        const frame = this.animationManager.getCurrentFrame();
        if (frame) {
            ctx.drawImage(frame, screenX, screenY, this.width, this.height);
        } else {
            // Fallback rendering if no sprite is loaded
            ctx.fillStyle = this.team === 'player' ? '#00ff00' : 
                           this.team === 'enemy' ? '#ff0000' : 
                           this.team === 'zombie' ? '#800080' : '#888888';
            ctx.fillRect(screenX, screenY, this.width, this.height);
            
            // Add team identifier
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.team[0].toUpperCase(), screenX + this.width/2, screenY + this.height/2);
        }

        ctx.restore();

        if (this.health < this.maxHealth && this.alive) {
            this.renderHealthBar(ctx, screenX, screenY);
        }
    }

    renderHealthBar(ctx, x, y) {
        const barWidth = this.width;
        const barHeight = 6;
        const barY = y - 15;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, barY, barWidth, barHeight);

        const healthPercent = this.health / this.maxHealth;
        const fillWidth = barWidth * healthPercent;

        if (healthPercent > 0.6) {
            ctx.fillStyle = '#4CAF50';
        } else if (healthPercent > 0.3) {
            ctx.fillStyle = '#FFC107';
        } else {
            ctx.fillStyle = '#F44336';
        }

        ctx.fillRect(x, barY, fillWidth, barHeight);

        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, barY, barWidth, barHeight);
    }

    takeDamage(amount) {
        if (!this.alive) return;
        
        this.health -= amount;
        this.health = Math.max(0, this.health);
        
        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.alive = false;
        this.animationManager.play('death');
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    collidesWith(other) {
        const bounds1 = this.getBounds();
        const bounds2 = other.getBounds();

        return bounds1.x < bounds2.x + bounds2.width &&
               bounds1.x + bounds1.width > bounds2.x &&
               bounds1.y < bounds2.y + bounds2.height &&
               bounds1.y + bounds1.height > bounds2.y;
    }

    getDistance(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    getAngleTo(other) {
        return Math.atan2(other.y - this.y, other.x - this.x);
    }
}