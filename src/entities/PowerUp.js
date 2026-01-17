// ===========================================
// POWER-UP ENTITY
// ===========================================

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = POWERUP_RADIUS;
        this.collected = false;

        // Animation
        this.animTimer = 0;
        this.bobOffset = 0;
    }

    update(dt) {
        this.animTimer += dt;
        this.bobOffset = Math.sin(this.animTimer * 3) * 5;
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

        ctx.restore();
    }
}
