class Animation {
    constructor(frames, frameRate = 10, loop = true) {
        this.frames = frames;
        this.frameRate = frameRate;
        this.loop = loop;
        this.currentFrame = 0;
        this.frameDuration = 1000 / frameRate;
        this.frameTimer = 0;
        this.finished = false;
    }

    update(deltaTime) {
        if (this.finished && !this.loop) return;

        this.frameTimer += deltaTime;

        if (this.frameTimer >= this.frameDuration) {
            this.frameTimer = 0;
            this.currentFrame++;

            if (this.currentFrame >= this.frames.length) {
                if (this.loop) {
                    this.currentFrame = 0;
                } else {
                    this.currentFrame = this.frames.length - 1;
                    this.finished = true;
                }
            }
        }
    }

    getCurrentFrame() {
        return this.frames[this.currentFrame];
    }

    reset() {
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.finished = false;
    }

    isFinished() {
        return this.finished;
    }
}

class AnimationManager {
    constructor() {
        this.animations = {};
        this.currentAnimation = null;
        this.currentAnimationName = '';
        this.finished = false;
    }

    addAnimation(name, animation) {
        this.animations[name] = animation;
    }

    play(name, force = false) {
        if (this.currentAnimationName === name && !force) return;

        if (this.animations[name]) {
            this.currentAnimation = this.animations[name];
            this.currentAnimationName = name;
            this.currentAnimation.reset();
        }
    }

    update(deltaTime) {
        if (this.currentAnimation) {
            this.currentAnimation.update(deltaTime);
        }
    }

    getCurrentFrame() {
        if (this.currentAnimation && this.currentAnimation.frames.length > 0) {
            return this.currentAnimation.getCurrentFrame();
        }
        return null;
    }

    isFinished() {
        if (this.finished) return true;
        if (this.currentAnimation) {
            return this.currentAnimation.isFinished();
        }
        return false;
    }
}