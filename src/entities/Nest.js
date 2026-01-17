// ===========================================
// NEST ENTITY - Protected Targets with Eggs
// ===========================================

class Nest {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = NEST_RADIUS;
        this.health = NEST_MAX_HEALTH;
        this.shielded = false;

        // Track eggs deposited in this nest
        this.eggsDeposited = 0;

        // Track previous health state for calm bonus
        this.wasHealthy = true;

        // Animation
        this.animTimer = Math.random() * Math.PI * 2;
    }

    get state() {
        if (this.health >= NEST_HEALTHY_THRESHOLD) return 'healthy';
        if (this.health >= NEST_DAMAGED_THRESHOLD) return 'damaged';
        return 'critical';
    }

    get isHealthy() {
        return this.health >= NEST_HEALTHY_THRESHOLD;
    }

    takeDamage(amount) {
        if (this.shielded) return false;

        this.health = Math.max(0, this.health - amount);

        if (this.wasHealthy && !this.isHealthy) {
            this.wasHealthy = false;
        }

        return true;
    }

    repair(amount) {
        const wasNotHealthy = !this.isHealthy;
        this.health = Math.min(NEST_MAX_HEALTH, this.health + amount);

        // Check if we crossed to healthy threshold
        const crossedToHealthy = wasNotHealthy && this.isHealthy;

        if (this.isHealthy) {
            this.wasHealthy = true;
        }

        return crossedToHealthy;
    }

    addEgg() {
        this.eggsDeposited++;
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        this.animTimer += 0.02;

        // Shield effect
        if (this.shielded) {
            ctx.strokeStyle = COLORS.POWERUP_SHIELD;
            ctx.lineWidth = 3;
            ctx.shadowColor = COLORS.POWERUP_SHIELD;
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 10, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // Draw nest base (rocky platform)
        this.renderNestBase(ctx);

        // Draw the nest structure
        this.renderNestStructure(ctx);

        // Draw eggs inside the nest
        this.renderEggsInNest(ctx);

        // Health bar
        this.renderHealthBar(ctx);

        ctx.restore();
    }

    renderNestBase(ctx) {
        // Simple circular shadow under the nest (top-down view)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.arc(3, 3, this.radius * 1.05, 0, Math.PI * 2);
        ctx.fill();
    }

    renderNestStructure(ctx) {
        // Nest color based on state
        let nestColorOuter, nestColorInner, nestColorRim;
        switch (this.state) {
            case 'healthy':
                nestColorOuter = '#8b6914';
                nestColorInner = '#c9a857';
                nestColorRim = '#6d5a2f';
                break;
            case 'damaged':
                nestColorOuter = '#7a5a10';
                nestColorInner = '#a68a3a';
                nestColorRim = '#5c4a1f';
                break;
            case 'critical':
                nestColorOuter = '#5a3a08';
                nestColorInner = '#7a6030';
                nestColorRim = '#4a3a18';
                break;
        }

        // Outer nest ring (circular, top-down view)
        const outerGrad = ctx.createRadialGradient(0, 0, this.radius * 0.5, 0, 0, this.radius);
        outerGrad.addColorStop(0, nestColorOuter);
        outerGrad.addColorStop(0.7, nestColorRim);
        outerGrad.addColorStop(1, '#4a3a1a');

        ctx.fillStyle = outerGrad;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Woven twig texture (concentric circles)
        ctx.strokeStyle = nestColorRim;
        ctx.lineWidth = 2;
        for (let r = this.radius * 0.6; r < this.radius; r += 8) {
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Radial twig pattern
        ctx.strokeStyle = '#5c4a1f';
        ctx.lineWidth = 2;
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const innerR = this.radius * 0.45;
            const outerR = this.radius * 0.95;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
            ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
            ctx.stroke();
        }

        // Inner nest bowl (soft center, circular)
        const innerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * 0.5);
        innerGrad.addColorStop(0, '#e8d89a');
        innerGrad.addColorStop(0.5, nestColorInner);
        innerGrad.addColorStop(1, nestColorOuter);

        ctx.fillStyle = innerGrad;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Soft straw texture in center (static, no animation jitter)
        ctx.strokeStyle = '#d4b86a';
        ctx.lineWidth = 1;
        const strawAngles = [0, 0.8, 1.6, 2.4, 3.2, 4.0, 4.8, 5.6];
        strawAngles.forEach((baseAngle, i) => {
            const angle = baseAngle + (i % 2) * 0.2;
            const len = 10 + (i % 3) * 3;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * 3, Math.sin(angle) * 3);
            ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
            ctx.stroke();
        });

        // Nest rim highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius - 2, -0.5, 0.8);
        ctx.stroke();
    }

    renderEggsInNest(ctx) {
        // Show eggs that have been deposited (max visual of 5)
        const eggsToShow = Math.min(this.eggsDeposited, 5);

        if (eggsToShow === 0) return;

        // Egg positions in nest (arranged nicely)
        const eggPositions = [
            { x: 0, y: 0 },
            { x: -12, y: -3 },
            { x: 12, y: -2 },
            { x: -6, y: 5 },
            { x: 8, y: 6 }
        ];

        for (let i = 0; i < eggsToShow; i++) {
            const pos = eggPositions[i];
            this.renderSingleEgg(ctx, pos.x, pos.y, i);
        }
    }

    renderSingleEgg(ctx, x, y, index) {
        ctx.save();
        ctx.translate(x, y);

        const eggRadius = 7;

        // Egg gradient (circular, top-down view)
        const eggGrad = ctx.createRadialGradient(-2, -2, 0, 0, 0, eggRadius);
        eggGrad.addColorStop(0, '#fffff8');
        eggGrad.addColorStop(0.4, '#f5f5dc');
        eggGrad.addColorStop(1, '#d8d0b0');

        ctx.fillStyle = eggGrad;
        ctx.beginPath();
        ctx.arc(0, 0, eggRadius, 0, Math.PI * 2);
        ctx.fill();

        // Egg spots (vary by index)
        ctx.fillStyle = '#c4b490';
        ctx.beginPath();
        ctx.arc(-2 + (index % 2) * 2, -2, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(2 - (index % 3), 2, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Egg highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(-2, -3, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    renderHealthBar(ctx) {
        const barWidth = this.radius * 1.6;
        const barHeight = 6;
        const barY = this.radius * 0.6 + 15;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.roundRect(-barWidth / 2 - 2, barY - 2, barWidth + 4, barHeight + 4, 3);
        ctx.fill();

        // Health bar fill
        const healthPercent = this.health / NEST_MAX_HEALTH;
        let barColor;
        if (healthPercent > 0.7) {
            barColor = COLORS.CALM_BAR;
        } else if (healthPercent > 0.3) {
            barColor = '#f59e0b';
        } else {
            barColor = COLORS.DANGER_BAR;
        }

        ctx.fillStyle = barColor;
        if (healthPercent > 0) {
            ctx.beginPath();
            ctx.roundRect(-barWidth / 2, barY, barWidth * healthPercent, barHeight, 2);
            ctx.fill();
        }

        // Border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(-barWidth / 2, barY, barWidth, barHeight, 2);
        ctx.stroke();

        // Egg count indicator
        if (this.eggsDeposited > 0) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.eggsDeposited + ' eggs', 0, barY + barHeight + 12);
        }
    }
}
