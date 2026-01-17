// ===========================================
// HUD - Heads Up Display during gameplay
// ===========================================

const HUD = {
    render(ctx, calm, danger, score, activePowerUp, activePowerUpEndTime) {
        ctx.save();

        // Bar dimensions
        const barWidth = 200;
        const barHeight = 20;
        const barX = 20;
        const calmBarY = 20;
        const dangerBarY = 50;

        // Calm bar label
        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('CALM', barX, calmBarY - 5);

        // Calm bar background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.roundRect(ctx, barX, calmBarY, barWidth, barHeight, 4);
        ctx.fill();

        // Calm bar fill
        const calmWidth = (calm / 100) * barWidth;
        ctx.fillStyle = COLORS.CALM_BAR;
        if (calmWidth > 0) {
            this.roundRect(ctx, barX, calmBarY, calmWidth, barHeight, 4);
            ctx.fill();
        }

        // Calm bar border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        this.roundRect(ctx, barX, calmBarY, barWidth, barHeight, 4);
        ctx.stroke();

        // Calm percentage
        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(Math.floor(calm) + '%', barX + barWidth / 2, calmBarY + 15);

        // Danger bar label
        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('DANGER', barX, dangerBarY - 5);

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
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(Math.floor(danger) + '%', barX + barWidth / 2, dangerBarY + 15);

        // Score (top right)
        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('Score: ' + score, GAME_WIDTH - 20, 35);

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
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(powerUpName + ' (' + remaining + 's)', GAME_WIDTH / 2, 30);
            }
        }

        // Phase indicator (subtle)
        const phase = Meters.getCurrentPhase();
        const phaseIndex = PHASES.indexOf(phase) + 1;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('Phase ' + phaseIndex, GAME_WIDTH - 20, 60);

        ctx.restore();
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
