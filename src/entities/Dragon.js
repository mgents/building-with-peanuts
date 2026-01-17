// ===========================================
// DRAGON ENTITY - Player Character (Blue Dragon)
// ===========================================

class Dragon {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = DRAGON_RADIUS;
        this.baseSpeed = DRAGON_BASE_SPEED;

        // State
        this.carrying = null; // Egg ID or null
        this.speedBoostActive = false;
        this.speedBoostEndTime = 0;

        // Animation
        this.animTimer = 0;
        this.facingRight = true;
        this.wingAngle = 0;
        this.breathTimer = 0;
        this.tailWag = 0;
    }

    get speed() {
        let speed = this.baseSpeed;

        // Carrying penalty
        if (this.carrying !== null) {
            speed *= DRAGON_CARRY_MULTIPLIER;
        }

        // Speed boost power-up
        if (this.speedBoostActive) {
            speed *= DRAGON_BOOST_MULTIPLIER;
        }

        return speed;
    }

    update(dt, movement) {
        // Update speed boost
        if (this.speedBoostActive && Date.now() > this.speedBoostEndTime) {
            this.speedBoostActive = false;
        }

        // Apply movement
        const vx = movement.x * this.speed;
        const vy = movement.y * this.speed;

        this.x += vx * dt;
        this.y += vy * dt;

        // Update facing direction
        if (movement.x > 0.1) this.facingRight = true;
        if (movement.x < -0.1) this.facingRight = false;

        // Boundary clamping
        this.x = Math.max(this.radius, Math.min(GAME_WIDTH - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(GAME_HEIGHT - this.radius, this.y));

        // Animation
        this.animTimer += dt;
        this.wingAngle = Math.sin(this.animTimer * 8) * 0.4;
        this.breathTimer += dt * 2;
        this.tailWag = Math.sin(this.animTimer * 4) * 0.3;
    }

    activateSpeedBoost() {
        this.speedBoostActive = true;
        this.speedBoostEndTime = Date.now() + WING_BOOST_DURATION;
    }

    pickupEgg(eggId) {
        this.carrying = eggId;
    }

    dropEgg() {
        const eggId = this.carrying;
        this.carrying = null;
        return eggId;
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Flip based on direction
        if (!this.facingRight) {
            ctx.scale(-1, 1);
        }

        // Speed boost glow effect
        if (this.speedBoostActive) {
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 25;
        }

        // Draw carried egg in claws (underneath dragon)
        if (this.carrying !== null) {
            this.renderCarriedEgg(ctx);
        }

        // Tail (behind body)
        this.renderTail(ctx);

        // Back legs
        this.renderLegs(ctx, true);

        // Wings (behind body)
        this.renderWings(ctx);

        // Body
        this.renderBody(ctx);

        // Front legs
        this.renderLegs(ctx, false);

        // Head
        this.renderHead(ctx);

        // Spines along back
        this.renderSpines(ctx);

        ctx.restore();
    }

    renderCarriedEgg(ctx) {
        ctx.save();
        // Position egg in front claws area
        ctx.translate(5, 12);

        // Egg shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(2, 4, 7, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Egg shell with gradient
        const eggGrad = ctx.createRadialGradient(-2, -3, 0, 0, 0, 10);
        eggGrad.addColorStop(0, '#fffff5');
        eggGrad.addColorStop(0.5, '#f5f5dc');
        eggGrad.addColorStop(1, '#e8d5a3');
        ctx.fillStyle = eggGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        // Egg spots
        ctx.fillStyle = '#d4c4a0';
        ctx.beginPath();
        ctx.ellipse(-3, -4, 2, 2.5, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(3, 1, 1.5, 2, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Egg highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.ellipse(-2, -5, 3, 2, -0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    renderTail(ctx) {
        ctx.save();

        // Tail with segments
        const tailSegments = 6;
        let px = -this.radius * 0.6;
        let py = 2;

        for (let i = 0; i < tailSegments; i++) {
            const t = i / tailSegments;
            const thickness = 7 * (1 - t * 0.7);
            const wag = Math.sin(this.tailWag + i * 0.5) * (5 + i * 2);

            // Tail segment gradient from body to tip
            const segColor = this.lerpColor('#1e90ff', '#0066cc', t);
            ctx.fillStyle = segColor;

            ctx.beginPath();
            ctx.arc(px, py + wag, thickness, 0, Math.PI * 2);
            ctx.fill();

            px -= 8;
            py += 1;
        }

        // Tail tip (arrow/spade shape)
        ctx.fillStyle = '#0055aa';
        ctx.beginPath();
        ctx.moveTo(px - 10, py + Math.sin(this.tailWag + 3) * 12);
        ctx.lineTo(px + 2, py + Math.sin(this.tailWag + 3) * 12 - 6);
        ctx.lineTo(px + 2, py + Math.sin(this.tailWag + 3) * 12 + 6);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    renderLegs(ctx, isBack) {
        ctx.save();

        const legColor = isBack ? '#1a7ad9' : '#1e90ff';
        const clawColor = '#e0e0e0';
        const yOffset = isBack ? 2 : 0;
        const xOffset = isBack ? -3 : 0;

        // Leg animation
        const legAnim = Math.sin(this.animTimer * 6) * 3;

        // Front leg
        ctx.fillStyle = legColor;
        ctx.beginPath();
        ctx.ellipse(8 + xOffset, 14 + yOffset + (isBack ? -legAnim : legAnim), 5, 8, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Back leg
        ctx.beginPath();
        ctx.ellipse(-6 + xOffset, 14 + yOffset + (isBack ? legAnim : -legAnim), 5, 8, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Claws
        if (!isBack) {
            ctx.fillStyle = clawColor;
            // Front claws
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.ellipse(6 + i * 3, 22, 1.5, 3, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            // Back claws
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.ellipse(-8 + i * 3, 22, 1.5, 3, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }

    renderWings(ctx) {
        ctx.save();

        // Wing membrane color
        const wingMembrane = 'rgba(100, 180, 255, 0.7)';
        const wingBone = '#1a7ad9';

        // Upper wing
        ctx.save();
        ctx.translate(-2, -8);
        ctx.rotate(-0.6 + this.wingAngle);

        // Wing bone structure
        ctx.strokeStyle = wingBone;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-25, -15);
        ctx.moveTo(-10, -6);
        ctx.lineTo(-20, -5);
        ctx.moveTo(-15, -9);
        ctx.lineTo(-25, -5);
        ctx.stroke();

        // Wing membrane
        ctx.fillStyle = wingMembrane;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-15, -20, -28, -15);
        ctx.lineTo(-25, -5);
        ctx.lineTo(-18, 0);
        ctx.quadraticCurveTo(-8, 2, 0, 0);
        ctx.fill();

        ctx.restore();

        // Lower wing
        ctx.save();
        ctx.translate(-2, 8);
        ctx.rotate(0.6 - this.wingAngle);

        // Wing bone structure
        ctx.strokeStyle = wingBone;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-25, 15);
        ctx.moveTo(-10, 6);
        ctx.lineTo(-20, 5);
        ctx.moveTo(-15, 9);
        ctx.lineTo(-25, 5);
        ctx.stroke();

        // Wing membrane
        ctx.fillStyle = wingMembrane;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-15, 20, -28, 15);
        ctx.lineTo(-25, 5);
        ctx.lineTo(-18, 0);
        ctx.quadraticCurveTo(-8, -2, 0, 0);
        ctx.fill();

        ctx.restore();
        ctx.restore();
    }

    renderBody(ctx) {
        // Body gradient
        const bodyGrad = ctx.createRadialGradient(5, 0, 0, 0, 0, this.radius * 1.2);
        bodyGrad.addColorStop(0, '#4db8ff');
        bodyGrad.addColorStop(0.5, '#1e90ff');
        bodyGrad.addColorStop(1, '#0066cc');

        // Main body
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(0, 2, this.radius * 1.1, this.radius * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Belly scales (lighter)
        const bellyGrad = ctx.createRadialGradient(5, 6, 0, 5, 6, this.radius * 0.6);
        bellyGrad.addColorStop(0, '#b3e0ff');
        bellyGrad.addColorStop(1, '#80c9f5');

        ctx.fillStyle = bellyGrad;
        ctx.beginPath();
        ctx.ellipse(5, 6, this.radius * 0.55, this.radius * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();

        // Belly scale lines
        ctx.strokeStyle = 'rgba(100, 180, 230, 0.5)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.arc(5, 6 + i * 3 - 4, this.radius * 0.4 - i * 2, -0.5, Math.PI + 0.5);
            ctx.stroke();
        }
    }

    renderHead(ctx) {
        ctx.save();
        ctx.translate(this.radius * 0.7, -4);

        // Head shape gradient
        const headGrad = ctx.createRadialGradient(3, -2, 0, 0, 0, 14);
        headGrad.addColorStop(0, '#4db8ff');
        headGrad.addColorStop(0.6, '#1e90ff');
        headGrad.addColorStop(1, '#0066cc');

        // Main head
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 14, 11, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Snout
        ctx.fillStyle = '#1a85e6';
        ctx.beginPath();
        ctx.ellipse(12, 2, 8, 6, 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Nostrils
        ctx.fillStyle = '#0055aa';
        ctx.beginPath();
        ctx.ellipse(18, 0, 2, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(18, 4, 2, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye socket
        ctx.fillStyle = '#0066aa';
        ctx.beginPath();
        ctx.ellipse(2, -3, 7, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye white
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(3, -3, 5.5, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bright blue iris
        const irisGrad = ctx.createRadialGradient(4, -3, 0, 4, -3, 4);
        irisGrad.addColorStop(0, '#00ffff');
        irisGrad.addColorStop(0.5, '#00bfff');
        irisGrad.addColorStop(1, '#0080ff');

        ctx.fillStyle = irisGrad;
        ctx.beginPath();
        ctx.ellipse(4, -3, 3.5, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pupil
        ctx.fillStyle = '#001133';
        ctx.beginPath();
        ctx.ellipse(4.5, -3, 1.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.ellipse(2.5, -4.5, 1.5, 1, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Eye glow effect
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 8;
        ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(3, -3, 6, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Small horns
        ctx.fillStyle = '#c0c0c0';
        ctx.beginPath();
        ctx.moveTo(-5, -8);
        ctx.lineTo(-8, -16);
        ctx.lineTo(-3, -10);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, -9);
        ctx.lineTo(-1, -18);
        ctx.lineTo(4, -11);
        ctx.closePath();
        ctx.fill();

        // Ear fin
        ctx.fillStyle = 'rgba(100, 180, 255, 0.8)';
        ctx.beginPath();
        ctx.moveTo(-8, -2);
        ctx.quadraticCurveTo(-15, -5, -12, 5);
        ctx.quadraticCurveTo(-8, 3, -6, 2);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    renderSpines(ctx) {
        ctx.fillStyle = '#0077cc';

        // Back spines
        const spineCount = 5;
        for (let i = 0; i < spineCount; i++) {
            const x = -5 - i * 6;
            const height = 8 - i * 1;
            const wobble = Math.sin(this.animTimer * 3 + i) * 2;

            ctx.beginPath();
            ctx.moveTo(x - 3, 0);
            ctx.lineTo(x, -height + wobble);
            ctx.lineTo(x + 3, 0);
            ctx.closePath();
            ctx.fill();
        }
    }

    // Helper function to interpolate colors
    lerpColor(color1, color2, t) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        const r = Math.round(c1.r + (c2.r - c1.r) * t);
        const g = Math.round(c1.g + (c2.g - c1.g) * t);
        const b = Math.round(c1.b + (c2.b - c1.b) * t);
        return `rgb(${r}, ${g}, ${b})`;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }
}
