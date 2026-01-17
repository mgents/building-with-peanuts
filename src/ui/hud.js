// ===========================================
// HUD - Heads Up Display during gameplay (v2)
// ===========================================

const HUD = {
    // Animation state for egg counter
    lastEggCount: 0,
    eggPulseTime: 0,
    milestoneMessage: '',
    milestoneTime: 0,

    render(ctx, danger, score, activePowerUp, activePowerUpEndTime, eggsCollected, eggsToWin) {
        ctx.save();

        // Bar dimensions
        const barWidth = 180;
        const barHeight = 18;
        const barX = 20;
        const dangerBarY = 20;

        // Danger bar label
        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('DANGER', barX, dangerBarY - 4);

        // Danger bar background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.roundRect(ctx, barX, dangerBarY, barWidth, barHeight, 4);
        ctx.fill();

        // Danger bar fill
        const dangerWidth = (danger / 100) * barWidth;
        ctx.fillStyle = COLORS.DANGER_BAR;
        if (dangerWidth > 0) {
            this.roundRect(ctx, barX, dangerBarY, dangerWidth, barHeight, 4);
            ctx.fill();
        }

        // Danger bar border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        this.roundRect(ctx, barX, dangerBarY, barWidth, barHeight, 4);
        ctx.stroke();

        // Danger percentage
        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(Math.floor(danger) + '%', barX + barWidth / 2, dangerBarY + 13);

        // ========== EGG COUNTER (Primary Goal) ==========
        this.renderEggCounter(ctx, eggsCollected, eggsToWin);

        // Score (top right)
        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('Score: ' + score, GAME_WIDTH - 20, 30);

        // Phase indicator (subtle)
        const phase = Meters.getCurrentPhase();
        const phaseIndex = PHASES.indexOf(phase) + 1;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '11px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('Phase ' + phaseIndex, GAME_WIDTH - 20, 50);

        // Active power-up indicator
        if (activePowerUp && activePowerUpEndTime > Date.now()) {
            const remaining = Math.ceil((activePowerUpEndTime - Date.now()) / 1000);
            let powerUpName = '';
            let powerUpColor = '';

            switch (activePowerUp) {
                case POWERUP_TYPES.WING_BOOST:
                    powerUpName = 'WING BOOST';
                    powerUpColor = COLORS.POWERUP_WING;
                    break;
                case POWERUP_TYPES.NEST_SHIELD:
                    powerUpName = 'NEST SHIELD';
                    powerUpColor = COLORS.POWERUP_SHIELD;
                    break;
            }

            if (powerUpName) {
                ctx.fillStyle = powerUpColor;
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(powerUpName + ' (' + remaining + 's)', GAME_WIDTH / 2, 20);
            }
        }

        // Milestone message
        if (this.milestoneMessage && Date.now() - this.milestoneTime < 2000) {
            const alpha = 1 - (Date.now() - this.milestoneTime) / 2000;
            ctx.fillStyle = `rgba(244, 208, 63, ${alpha})`;
            ctx.font = 'bold 28px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.milestoneMessage, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100);
        }

        ctx.restore();
    },

    renderEggCounter(ctx, eggsCollected, eggsToWin) {
        const centerX = GAME_WIDTH / 2;
        const y = 55;

        // Check for pulse animation
        if (eggsCollected > this.lastEggCount) {
            this.eggPulseTime = Date.now();

            // Check milestones
            const milestones = [10, 25, 40, eggsToWin];
            for (const milestone of milestones) {
                if (eggsCollected >= milestone && this.lastEggCount < milestone) {
                    if (milestone === eggsToWin) {
                        this.milestoneMessage = 'GOAL REACHED!';
                    } else {
                        this.milestoneMessage = milestone + ' EGGS SAVED!';
                    }
                    this.milestoneTime = Date.now();
                    if (typeof Audio !== 'undefined' && Audio.playMilestone) {
                        Audio.playMilestone();
                    }
                    break;
                }
            }

            this.lastEggCount = eggsCollected;
        }

        // Pulse effect
        let scale = 1;
        if (Date.now() - this.eggPulseTime < 300) {
            const t = (Date.now() - this.eggPulseTime) / 300;
            scale = 1 + 0.2 * Math.sin(t * Math.PI);
        }

        // Background box
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.roundRect(ctx, centerX - 80, y - 20, 160, 40, 8);
        ctx.fill();

        // Border
        ctx.strokeStyle = '#f4d03f';
        ctx.lineWidth = 2;
        this.roundRect(ctx, centerX - 80, y - 20, 160, 40, 8);
        ctx.stroke();

        // Egg icon
        ctx.font = `${Math.floor(22 * scale)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('🥚', centerX - 50, y + 8);

        // Counter text
        const progress = eggsCollected + '/' + eggsToWin;
        ctx.fillStyle = eggsCollected >= eggsToWin ? '#22c55e' : '#f4d03f';
        ctx.font = `bold ${Math.floor(20 * scale)}px Arial`;
        ctx.fillText(progress, centerX + 10, y + 7);

        // Progress bar under the counter
        const barWidth = 140;
        const barHeight = 4;
        const barX = centerX - 70;
        const barY = y + 14;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        const fillWidth = Math.min(1, eggsCollected / eggsToWin) * barWidth;
        const gradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
        gradient.addColorStop(0, '#f4d03f');
        gradient.addColorStop(1, '#22c55e');
        ctx.fillStyle = gradient;
        ctx.fillRect(barX, barY, fillWidth, barHeight);
    },

    // Reset state for new game
    reset() {
        this.lastEggCount = 0;
        this.eggPulseTime = 0;
        this.milestoneMessage = '';
        this.milestoneTime = 0;
    },

    // Helper to draw rounded rectangles
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
};
