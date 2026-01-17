// ===========================================
// POWER-UP ENTITY
// ===========================================

class PowerUp {
    constructor(x, y, type, lifetime = POWERUP_LIFETIME) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = POWERUP_RADIUS;
        this.collected = false;
        this.expired = false;

        // Animation
        this.animTimer = 0;
        this.bobOffset = 0;

        // Lifetime timer (power-ups disappear if not collected)
        this.lifetime = lifetime;
        this.spawnTime = Date.now();
    }

    update(dt) {
        this.animTimer += dt;
        this.bobOffset = Math.sin(this.animTimer * 3) * 5;

        // Check if expired
        const elapsed = Date.now() - this.spawnTime;
        if (elapsed >= this.lifetime) {
            this.expired = true;
        }
    }

    // Get remaining time as a ratio (1.0 = full, 0.0 = expired)
    getRemainingRatio() {
        const elapsed = Date.now() - this.spawnTime;
        return Math.max(0, 1 - elapsed / this.lifetime);
    }

    collect() {
        this.collected = true;
    }

    render(ctx) {
        if (this.collected) return;

        ctx.save();
        ctx.translate(this.x, this.y + this.bobOffset);

        // Glow effect
        let glowColor;
        let iconColor;
        switch (this.type) {
            case POWERUP_TYPES.WING_BOOST:
                glowColor = COLORS.POWERUP_WING;
                iconColor = COLORS.POWERUP_WING;
                break;
            case POWERUP_TYPES.BIG_SCARE:
                glowColor = COLORS.POWERUP_SCARE;
                iconColor = COLORS.POWERUP_SCARE;
                break;
            case POWERUP_TYPES.NEST_SHIELD:
                glowColor = COLORS.POWERUP_SHIELD;
                iconColor = COLORS.POWERUP_SHIELD;
                break;
            case POWERUP_TYPES.PERMANENT_BANISH:
                glowColor = COLORS.POWERUP_BANISH;
                iconColor = COLORS.POWERUP_BANISH;
                break;
            case POWERUP_TYPES.DANGER_REDUCE:
                glowColor = COLORS.POWERUP_DANGER;
                iconColor = COLORS.POWERUP_DANGER;
                break;
        }

        // Outer glow
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 15;

        // Background circle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Icon
        ctx.shadowBlur = 0;
        ctx.fillStyle = iconColor;
        ctx.strokeStyle = iconColor;
        ctx.lineWidth = 2;

        switch (this.type) {
            case POWERUP_TYPES.WING_BOOST:
                // Wing icon
                ctx.beginPath();
                ctx.moveTo(-8, 0);
                ctx.quadraticCurveTo(-4, -8, 8, -4);
                ctx.quadraticCurveTo(0, 0, 8, 4);
                ctx.quadraticCurveTo(-4, 8, -8, 0);
                ctx.fill();
                break;

            case POWERUP_TYPES.BIG_SCARE:
                // Explosion/burst icon
                ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
                    const r = i % 2 === 0 ? 10 : 5;
                    if (i === 0) {
                        ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
                    } else {
                        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
                    }
                }
                ctx.closePath();
                ctx.fill();
                break;

            case POWERUP_TYPES.NEST_SHIELD:
                // Shield icon
                ctx.beginPath();
                ctx.moveTo(0, -8);
                ctx.lineTo(8, -4);
                ctx.lineTo(8, 2);
                ctx.quadraticCurveTo(4, 8, 0, 10);
                ctx.quadraticCurveTo(-4, 8, -8, 2);
                ctx.lineTo(-8, -4);
                ctx.closePath();
                ctx.fill();
                break;

            case POWERUP_TYPES.PERMANENT_BANISH:
                // Banish/portal icon (swirling vortex)
                ctx.save();
                ctx.rotate(this.animTimer * 2);

                // Outer spiral
                ctx.beginPath();
                for (let i = 0; i < 3; i++) {
                    const angle = (i / 3) * Math.PI * 2;
                    ctx.moveTo(0, 0);
                    ctx.arc(0, 0, 9, angle, angle + Math.PI * 0.5);
                }
                ctx.strokeStyle = iconColor;
                ctx.lineWidth = 3;
                ctx.stroke();

                // Inner circle
                ctx.fillStyle = iconColor;
                ctx.beginPath();
                ctx.arc(0, 0, 4, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
                break;

            case POWERUP_TYPES.DANGER_REDUCE:
                // Heart/healing icon with minus sign
                ctx.fillStyle = iconColor;
                // Heart shape
                ctx.beginPath();
                ctx.moveTo(0, 3);
                ctx.bezierCurveTo(-8, -3, -8, -8, 0, -8);
                ctx.bezierCurveTo(8, -8, 8, -3, 0, 3);
                ctx.fill();
                // Minus sign (white)
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(-5, -4, 10, 3);
                break;
        }

        // Sparkle effect
        const sparklePhase = this.animTimer * 2;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 3; i++) {
            const angle = sparklePhase + (i * Math.PI * 2 / 3);
            const dist = this.radius + 5 + Math.sin(sparklePhase * 2 + i) * 3;
            const sparkleX = Math.cos(angle) * dist;
            const sparkleY = Math.sin(angle) * dist;
            ctx.beginPath();
            ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Timer bar (shows remaining time before power-up disappears)
        const remaining = this.getRemainingRatio();
        const barWidth = this.radius * 2;
        const barHeight = 4;
        const barY = this.radius + 8;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);

        // Fill - changes color as time runs out
        let barColor;
        if (remaining > 0.5) {
            barColor = glowColor;
        } else if (remaining > 0.25) {
            barColor = '#f59e0b'; // Orange warning
        } else {
            barColor = '#ef4444'; // Red critical
        }
        ctx.fillStyle = barColor;
        ctx.fillRect(-barWidth / 2, barY, barWidth * remaining, barHeight);

        // Flashing effect when low
        if (remaining < 0.3 && Math.floor(this.animTimer * 6) % 2 === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}
