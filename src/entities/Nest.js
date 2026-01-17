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
        // Rocky platform under the nest
        ctx.fillStyle = '#5a5a5a';
        ctx.beginPath();
        ctx.ellipse(0, this.radius * 0.3, this.radius * 1.1, this.radius * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        // Rock highlights
        ctx.fillStyle = '#6a6a6a';
        ctx.beginPath();
        ctx.ellipse(-8, this.radius * 0.25, 8, 5, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(10, this.radius * 0.35, 6, 4, 0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    renderNestStructure(ctx) {
        // Nest color based on state
        let nestColorOuter, nestColorInner;
        switch (this.state) {
            case 'healthy':
                nestColorOuter = '#8b6914';
                nestColorInner = '#a67c00';
                break;
            case 'damaged':
                nestColorOuter = '#7a5a10';
                nestColorInner = '#8a6a10';
                break;
            case 'critical':
                nestColorOuter = '#5a3a08';
                nestColorInner = '#6a4a08';
                break;
        }

        // Outer nest ring (woven twigs)
        ctx.fillStyle = nestColorOuter;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius, this.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw twig pattern (radial lines)
        ctx.strokeStyle = '#5c4a1f';
        ctx.lineWidth = 2;
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const innerR = this.radius * 0.4;
            const outerR = this.radius * 0.95;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR * 0.6);
            ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR * 0.6);
            ctx.stroke();
        }

        // Circular twig patterns
        ctx.strokeStyle = '#6d5a2f';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius * 0.75, this.radius * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Inner nest (soft bedding)
        const innerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * 0.5);
        innerGrad.addColorStop(0, '#c9a857');
        innerGrad.addColorStop(0.7, '#a68a3a');
        innerGrad.addColorStop(1, nestColorInner);

        ctx.fillStyle = innerGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius * 0.55, this.radius * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        // Straw texture in center
        ctx.strokeStyle = '#d4b86a';
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + this.animTimer * 0.1;
            const len = 8 + Math.random() * 5;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * 5, Math.sin(angle) * 3);
            ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len * 0.6);
            ctx.stroke();
        }
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

        // Slight wobble animation
        const wobble = Math.sin(this.animTimer + index * 1.5) * 0.05;
        ctx.rotate(wobble);

        // Egg shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(1, 3, 6, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Egg gradient
        const eggGrad = ctx.createRadialGradient(-2, -3, 0, 0, 0, 9);
        eggGrad.addColorStop(0, '#fffff8');
        eggGrad.addColorStop(0.4, '#f5f5dc');
        eggGrad.addColorStop(1, '#e0d5b0');

        ctx.fillStyle = eggGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 7, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Egg spots (vary by index)
        ctx.fillStyle = '#d4c4a0';
        ctx.beginPath();
        ctx.ellipse(-2 + (index % 2) * 2, -3, 1.5, 2, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(2 - (index % 3), 2, 1, 1.5, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Egg highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.ellipse(-2, -4, 2, 1.5, -0.3, 0, Math.PI * 2);
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
