// ===========================================
// INVADER ENTITY - Dark Grey Enemy Dragons
// ===========================================

class Invader {
    constructor(x, y, id) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.radius = INVADER_RADIUS;
        this.speed = INVADER_BASE_SPEED;

        // State machine
        this.state = INVADER_STATES.SEEK;
        this.targetNest = null;
        this.fleeDirection = { x: 0, y: 0 };
        this.stateTimer = 0;

        // Scare tracking (for rate-limited calm bonus)
        this.lastScareTime = 0;

        // Animation
        this.animTimer = Math.random() * Math.PI * 2;
        this.facingRight = Math.random() > 0.5;
        this.wingAngle = 0;
        this.tailWag = 0;
    }

    get canGiveScareCalmBonus() {
        return Date.now() - this.lastScareTime > SCARE_COOLDOWN;
    }

    selectTargetNest(nests) {
        if (nests.length === 0) return null;

        // Sort by health (lowest first), then by distance
        const sortedNests = [...nests].sort((a, b) => {
            // Prefer damaged nests
            if (a.health !== b.health) {
                return a.health - b.health;
            }
            // Tie-breaker: closest
            const distA = Math.hypot(a.x - this.x, a.y - this.y);
            const distB = Math.hypot(b.x - this.x, b.y - this.y);
            return distA - distB;
        });

        return sortedNests[0];
    }

    update(dt, nests, dragonPos) {
        this.animTimer += dt;
        this.stateTimer -= dt * 1000;
        this.wingAngle = Math.sin(this.animTimer * 6) * 0.4;
        this.tailWag = Math.sin(this.animTimer * 4) * 0.3;

        switch (this.state) {
            case INVADER_STATES.SEEK:
                this.updateSeek(dt, nests);
                break;

            case INVADER_STATES.HARASS:
                this.updateHarass(dt);
                break;

            case INVADER_STATES.FLEE:
                this.updateFlee(dt, dragonPos);
                break;

            case INVADER_STATES.RECOVER:
                this.updateRecover(dt, nests);
                break;
        }

        // Boundary clamping
        this.x = Math.max(this.radius + 70, Math.min(GAME_WIDTH - this.radius - 70, this.x));
        this.y = Math.max(this.radius + 70, Math.min(GAME_HEIGHT - this.radius - 70, this.y));
    }

    updateSeek(dt, nests) {
        // Select target if none
        if (!this.targetNest) {
            this.targetNest = this.selectTargetNest(nests);
        }

        if (!this.targetNest) return;

        // Move toward target
        const dx = this.targetNest.x - this.x;
        const dy = this.targetNest.y - this.y;
        const dist = Math.hypot(dx, dy);

        // Update facing direction
        if (dx > 5) this.facingRight = true;
        if (dx < -5) this.facingRight = false;

        if (dist > this.targetNest.radius) {
            const vx = (dx / dist) * this.speed;
            const vy = (dy / dist) * this.speed;
            this.x += vx * dt;
            this.y += vy * dt;
        } else {
            // Reached nest - start harassing
            this.state = INVADER_STATES.HARASS;
        }
    }

    updateHarass(dt) {
        // Light circling motion around nest
        if (this.targetNest) {
            const angle = this.animTimer * 0.5;
            const orbitRadius = this.targetNest.radius * 0.8;
            const targetX = this.targetNest.x + Math.cos(angle) * orbitRadius;
            const targetY = this.targetNest.y + Math.sin(angle) * orbitRadius;

            const dx = targetX - this.x;
            const dy = targetY - this.y;
            const dist = Math.hypot(dx, dy);

            // Update facing based on orbit direction
            if (Math.cos(angle + 0.1) > Math.cos(angle)) {
                this.facingRight = true;
            } else {
                this.facingRight = false;
            }

            if (dist > 2) {
                this.x += (dx / dist) * this.speed * 0.3 * dt;
                this.y += (dy / dist) * this.speed * 0.3 * dt;
            }
        }
    }

    updateFlee(dt, dragonPos) {
        // Move away from dragon
        const speed = this.speed * INVADER_FLEE_MULTIPLIER;
        this.x += this.fleeDirection.x * speed * dt;
        this.y += this.fleeDirection.y * speed * dt;

        // Update facing based on flee direction
        if (this.fleeDirection.x > 0) this.facingRight = true;
        if (this.fleeDirection.x < 0) this.facingRight = false;

        // Check if flee duration ended
        if (this.stateTimer <= 0) {
            this.state = INVADER_STATES.RECOVER;
            this.stateTimer = INVADER_RECOVER_PAUSE;
        }
    }

    updateRecover(dt, nests) {
        // Wait, then re-target
        if (this.stateTimer <= 0) {
            this.targetNest = this.selectTargetNest(nests);
            this.state = INVADER_STATES.SEEK;
        }
    }

    scare(dragonX, dragonY) {
        // Calculate flee direction (away from dragon)
        const dx = this.x - dragonX;
        const dy = this.y - dragonY;
        const dist = Math.hypot(dx, dy);

        if (dist > 0) {
            this.fleeDirection.x = dx / dist;
            this.fleeDirection.y = dy / dist;
        } else {
            // Random direction if exactly on top
            const angle = Math.random() * Math.PI * 2;
            this.fleeDirection.x = Math.cos(angle);
            this.fleeDirection.y = Math.sin(angle);
        }

        this.state = INVADER_STATES.FLEE;
        this.stateTimer = INVADER_FLEE_DURATION;

        // Check if can give calm bonus
        const giveBonus = this.canGiveScareCalmBonus;
        if (giveBonus) {
            this.lastScareTime = Date.now();
        }

        return giveBonus;
    }

    isHarassingNest() {
        return this.state === INVADER_STATES.HARASS && this.targetNest !== null;
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Flip based on direction
        if (!this.facingRight) {
            ctx.scale(-1, 1);
        }

        // Fleeing effect - more transparent and add fear particles
        if (this.state === INVADER_STATES.FLEE) {
            ctx.globalAlpha = 0.7;
        }

        // Draw the dark dragon
        this.renderTail(ctx);
        this.renderWings(ctx);
        this.renderBody(ctx);
        this.renderLegs(ctx);
        this.renderHead(ctx);
        this.renderSpines(ctx);

        ctx.restore();
    }

    renderTail(ctx) {
        // Segmented tail
        const tailSegments = 5;
        let px = -this.radius * 0.5;
        let py = 2;

        for (let i = 0; i < tailSegments; i++) {
            const t = i / tailSegments;
            const thickness = 5 * (1 - t * 0.7);
            const wag = Math.sin(this.tailWag + i * 0.5) * (4 + i * 2);

            // Dark grey gradient
            const gray = Math.floor(60 - t * 20);
            ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;

            ctx.beginPath();
            ctx.arc(px, py + wag, thickness, 0, Math.PI * 2);
            ctx.fill();

            px -= 6;
            py += 1;
        }

        // Tail spike
        ctx.fillStyle = '#2a2a2a';
        const tipWag = Math.sin(this.tailWag + 2.5) * 10;
        ctx.beginPath();
        ctx.moveTo(px - 8, py + tipWag);
        ctx.lineTo(px + 2, py + tipWag - 5);
        ctx.lineTo(px + 2, py + tipWag + 5);
        ctx.closePath();
        ctx.fill();
    }

    renderWings(ctx) {
        // Dark, jagged wings
        const wingMembrane = 'rgba(40, 40, 40, 0.8)';
        const wingBone = '#3a3a3a';

        // Upper wing
        ctx.save();
        ctx.translate(-2, -6);
        ctx.rotate(-0.5 + this.wingAngle);

        // Wing bones
        ctx.strokeStyle = wingBone;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-20, -12);
        ctx.moveTo(-8, -5);
        ctx.lineTo(-16, -4);
        ctx.moveTo(-12, -7);
        ctx.lineTo(-20, -4);
        ctx.stroke();

        // Wing membrane (more jagged)
        ctx.fillStyle = wingMembrane;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-10, -14);
        ctx.lineTo(-15, -10);
        ctx.lineTo(-22, -12);
        ctx.lineTo(-20, -4);
        ctx.lineTo(-15, 0);
        ctx.quadraticCurveTo(-6, 2, 0, 0);
        ctx.fill();

        ctx.restore();

        // Lower wing
        ctx.save();
        ctx.translate(-2, 6);
        ctx.rotate(0.5 - this.wingAngle);

        ctx.strokeStyle = wingBone;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-20, 12);
        ctx.moveTo(-8, 5);
        ctx.lineTo(-16, 4);
        ctx.moveTo(-12, 7);
        ctx.lineTo(-20, 4);
        ctx.stroke();

        ctx.fillStyle = wingMembrane;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-10, 14);
        ctx.lineTo(-15, 10);
        ctx.lineTo(-22, 12);
        ctx.lineTo(-20, 4);
        ctx.lineTo(-15, 0);
        ctx.quadraticCurveTo(-6, -2, 0, 0);
        ctx.fill();

        ctx.restore();
    }

    renderBody(ctx) {
        // Dark grey body with gradient
        const bodyGrad = ctx.createRadialGradient(3, 0, 0, 0, 0, this.radius * 1.1);
        bodyGrad.addColorStop(0, '#5a5a5a');
        bodyGrad.addColorStop(0.5, '#4a4a4a');
        bodyGrad.addColorStop(1, '#2a2a2a');

        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius * 0.95, this.radius * 0.75, 0, 0, Math.PI * 2);
        ctx.fill();

        // Darker underbelly
        ctx.fillStyle = '#3a3a3a';
        ctx.beginPath();
        ctx.ellipse(2, 4, this.radius * 0.5, this.radius * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        // Scale texture
        ctx.strokeStyle = 'rgba(30, 30, 30, 0.5)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(2, 4 + i * 2 - 2, this.radius * 0.35 - i * 2, -0.4, Math.PI + 0.4);
            ctx.stroke();
        }
    }

    renderLegs(ctx) {
        const legColor = '#3a3a3a';
        const clawColor = '#1a1a1a';
        const legAnim = Math.sin(this.animTimer * 5) * 2;

        // Front leg
        ctx.fillStyle = legColor;
        ctx.beginPath();
        ctx.ellipse(6, 10 + legAnim, 4, 6, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Back leg
        ctx.beginPath();
        ctx.ellipse(-4, 10 - legAnim, 4, 6, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Claws (sharp)
        ctx.fillStyle = clawColor;
        for (let i = 0; i < 3; i++) {
            // Front claws
            ctx.beginPath();
            ctx.moveTo(4 + i * 2.5, 16 + legAnim);
            ctx.lineTo(5 + i * 2.5, 20 + legAnim);
            ctx.lineTo(6 + i * 2.5, 16 + legAnim);
            ctx.fill();

            // Back claws
            ctx.beginPath();
            ctx.moveTo(-6 + i * 2.5, 16 - legAnim);
            ctx.lineTo(-5 + i * 2.5, 20 - legAnim);
            ctx.lineTo(-4 + i * 2.5, 16 - legAnim);
            ctx.fill();
        }
    }

    renderHead(ctx) {
        ctx.save();
        ctx.translate(this.radius * 0.55, -2);

        // Head gradient
        const headGrad = ctx.createRadialGradient(2, -1, 0, 0, 0, 12);
        headGrad.addColorStop(0, '#5a5a5a');
        headGrad.addColorStop(0.6, '#4a4a4a');
        headGrad.addColorStop(1, '#2a2a2a');

        // Main head
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 9, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Snout (more angular/menacing)
        ctx.fillStyle = '#3a3a3a';
        ctx.beginPath();
        ctx.moveTo(8, -3);
        ctx.lineTo(18, 0);
        ctx.lineTo(18, 4);
        ctx.lineTo(8, 5);
        ctx.closePath();
        ctx.fill();

        // Nostrils (smoking effect)
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.ellipse(16, 0, 1.5, 1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(16, 3, 1.5, 1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye socket (dark)
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.ellipse(1, -2, 6, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Evil red eye
        const eyeGrad = ctx.createRadialGradient(2, -2, 0, 2, -2, 4);
        eyeGrad.addColorStop(0, '#ff0000');
        eyeGrad.addColorStop(0.5, '#cc0000');
        eyeGrad.addColorStop(1, '#880000');

        ctx.fillStyle = eyeGrad;
        ctx.beginPath();
        ctx.ellipse(2, -2, 4, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Slit pupil
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(2.5, -2, 1, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye glow effect
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 10;
        ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(2, -2, 5, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Eye shine
        ctx.fillStyle = 'rgba(255, 200, 200, 0.6)';
        ctx.beginPath();
        ctx.ellipse(0.5, -3.5, 1.2, 0.8, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Horns (larger, more menacing)
        ctx.fillStyle = '#2a2a2a';
        // Back horn
        ctx.beginPath();
        ctx.moveTo(-6, -6);
        ctx.lineTo(-12, -18);
        ctx.lineTo(-4, -8);
        ctx.closePath();
        ctx.fill();

        // Front horn
        ctx.beginPath();
        ctx.moveTo(-1, -7);
        ctx.lineTo(-3, -20);
        ctx.lineTo(3, -9);
        ctx.closePath();
        ctx.fill();

        // Horn highlights
        ctx.fillStyle = '#3a3a3a';
        ctx.beginPath();
        ctx.moveTo(-5, -8);
        ctx.lineTo(-10, -15);
        ctx.lineTo(-6, -10);
        ctx.closePath();
        ctx.fill();

        // Teeth (when harassing)
        if (this.state === INVADER_STATES.HARASS) {
            ctx.fillStyle = '#f0f0f0';
            for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.moveTo(10 + i * 2, 5);
                ctx.lineTo(11 + i * 2, 8);
                ctx.lineTo(12 + i * 2, 5);
                ctx.fill();
            }
        }

        ctx.restore();
    }

    renderSpines(ctx) {
        // Spiky back spines
        ctx.fillStyle = '#2a2a2a';

        const spineCount = 4;
        for (let i = 0; i < spineCount; i++) {
            const x = -3 - i * 5;
            const height = 7 - i * 0.5;
            const wobble = Math.sin(this.animTimer * 3 + i) * 1.5;

            ctx.beginPath();
            ctx.moveTo(x - 2, -2);
            ctx.lineTo(x, -height + wobble - 4);
            ctx.lineTo(x + 2, -2);
            ctx.closePath();
            ctx.fill();
        }
    }
}
