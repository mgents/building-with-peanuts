// ===========================================
// EGG ENTITY - Collectibles to Save
// ===========================================

class Egg {
    constructor(x, y, id) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.radius = EGG_RADIUS;

        // Timers
        this.spawnTime = Date.now();
        this.graceEndTime = 0; // Grace period after being dropped
        this.cracked = false;

        // Animation
        this.wobbleAngle = 0;
        this.wobbleSpeed = 2 + Math.random() * 2;
    }

    get timeOnGround() {
        return Date.now() - this.spawnTime;
    }

    get isInGracePeriod() {
        return Date.now() < this.graceEndTime;
    }

    // v2: crackProgress now uses configurable crack time
    getCrackProgress(crackTime = EGG_CRACK_TIME) {
        return Math.min(1, this.timeOnGround / crackTime);
    }

    // Legacy getter for backwards compatibility
    get crackProgress() {
        return this.getCrackProgress(EGG_CRACK_TIME);
    }

    // v2: update now accepts optional crack time from difficulty settings
    update(dt, crackTime = EGG_CRACK_TIME) {
        // Store current crack time for render use
        this._currentCrackTime = crackTime;

        // Wobble animation - faster as crack approaches
        const progress = this.getCrackProgress(crackTime);
        const urgency = 1 + progress * 3;
        this.wobbleAngle = Math.sin(Date.now() * 0.01 * this.wobbleSpeed * urgency) * (0.1 + progress * 0.2);

        // Check if egg should crack
        if (this.timeOnGround >= crackTime && !this.cracked) {
            this.cracked = true;
            return true; // Signal that egg cracked
        }

        return false;
    }

    setDropped() {
        this.spawnTime = Date.now();
        this.graceEndTime = Date.now() + EGG_GRACE_PERIOD;
    }

    render(ctx) {
        if (this.cracked) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.wobbleAngle);

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(2, this.radius * 0.8, this.radius * 0.8, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Egg shell
        ctx.fillStyle = COLORS.EGG_SHELL;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius, this.radius * 1.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Spots
        ctx.fillStyle = COLORS.EGG_SPOT;
        ctx.beginPath();
        ctx.arc(-3, -4, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(4, 2, 2, 0, Math.PI * 2);
        ctx.fill();

        // Use stored crack time or default
        const progress = this.getCrackProgress(this._currentCrackTime || EGG_CRACK_TIME);

        // Crack warning indicator
        if (progress > 0.5) {
            const warningAlpha = (progress - 0.5) * 2;
            ctx.strokeStyle = `rgba(255, 0, 0, ${warningAlpha})`;
            ctx.lineWidth = 2;

            // Draw crack lines
            ctx.beginPath();
            ctx.moveTo(0, -this.radius * 0.8);
            ctx.lineTo(-3, 0);
            ctx.lineTo(2, this.radius * 0.5);
            ctx.stroke();
        }

        // Timer indicator (circular progress)
        if (progress > 0) {
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 5, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * progress));
            ctx.stroke();
        }

        ctx.restore();
    }
}
