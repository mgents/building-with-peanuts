// ===========================================
// UI SCREENS - Menu, Instructions, Win/Lose
// ===========================================

const Screens = {
    // Button tracking for hover/click
    buttons: [],
    hoveredButton: null,

    init() {
        // Mouse/touch handlers for buttons
        canvas.addEventListener('click', (e) => this.onClick(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('touchstart', (e) => this.onTouch(e), { passive: false });
    },

    onClick(e) {
        const pos = screenToGame(e.clientX, e.clientY);
        this.checkButtonClick(pos.x, pos.y);
    },

    onTouch(e) {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            const pos = screenToGame(touch.clientX, touch.clientY);
            this.checkButtonClick(pos.x, pos.y);
        }
    },

    onMouseMove(e) {
        const pos = screenToGame(e.clientX, e.clientY);
        this.hoveredButton = null;

        for (const btn of this.buttons) {
            if (this.isPointInButton(pos.x, pos.y, btn)) {
                this.hoveredButton = btn.id;
                break;
            }
        }
    },

    isPointInButton(x, y, btn) {
        return x >= btn.x && x <= btn.x + btn.width &&
               y >= btn.y && y <= btn.y + btn.height;
    },

    checkButtonClick(x, y) {
        for (const btn of this.buttons) {
            if (this.isPointInButton(x, y, btn)) {
                if (btn.callback) btn.callback();
                break;
            }
        }
    },

    // Render menu screen
    renderMenu(ctx, onStart, onInstructions) {
        this.buttons = [];

        // Background overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Title
        ctx.fillStyle = COLORS.DRAGON_BODY;
        ctx.font = 'bold 64px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Dragon Nest', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 120);

        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.font = 'bold 48px Arial';
        ctx.fillText('Defender', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60);

        // Subtitle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '20px Arial';
        ctx.fillText('Protect the magical island nursery!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20);

        // Start button
        this.renderButton(ctx, 'start', GAME_WIDTH / 2 - 100, GAME_HEIGHT / 2 + 40, 200, 50, 'START', onStart);

        // Instructions button
        this.renderButton(ctx, 'instructions', GAME_WIDTH / 2 - 100, GAME_HEIGHT / 2 + 110, 200, 50, 'HOW TO PLAY', onInstructions);

        // Controls hint
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '14px Arial';
        ctx.fillText('Use WASD / Arrow Keys or Touch Joystick to move', GAME_WIDTH / 2, GAME_HEIGHT - 40);
    },

    // Render instructions screen
    renderInstructions(ctx, onBack) {
        this.buttons = [];

        // Background overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Title
        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('HOW TO PLAY', GAME_WIDTH / 2, 80);

        // Instructions
        const instructions = [
            { icon: '🎮', text: 'Move with joystick (touch) or arrow keys / WASD' },
            { icon: '🥚', text: 'Pick up eggs and bring them to nests' },
            { icon: '👻', text: 'Touch invaders to scare them away' },
            { icon: '🔧', text: 'Stay near damaged nests to repair them' },
            { icon: '⚠️', text: "Don't let the red DANGER bar fill up!" },
            { icon: '✨', text: 'Fill the green CALM bar to win!' },
            { icon: '💎', text: 'Collect power-ups for special abilities' }
        ];

        ctx.font = '22px Arial';
        ctx.textAlign = 'left';

        instructions.forEach((inst, i) => {
            const y = 150 + i * 50;
            ctx.fillStyle = COLORS.UI_TEXT;
            ctx.fillText(inst.icon + '  ' + inst.text, GAME_WIDTH / 2 - 280, y);
        });

        // Power-up legend
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('POWER-UPS', GAME_WIDTH / 2, 520);

        ctx.font = '16px Arial';
        ctx.fillStyle = COLORS.POWERUP_WING;
        ctx.fillText('Wing Boost - Move faster', GAME_WIDTH / 2 - 200, 550);

        ctx.fillStyle = COLORS.POWERUP_SCARE;
        ctx.fillText('Big Scare - Scare all invaders', GAME_WIDTH / 2, 550);

        ctx.fillStyle = COLORS.POWERUP_SHIELD;
        ctx.fillText('Nest Shield - Protect nests', GAME_WIDTH / 2 + 200, 550);

        // Play button
        this.renderButton(ctx, 'play', GAME_WIDTH / 2 - 100, GAME_HEIGHT - 100, 200, 50, 'PLAY!', onBack);
    },

    // Render win screen
    renderWin(ctx, score, onRestart, onMenu) {
        this.buttons = [];

        // Background overlay
        ctx.fillStyle = 'rgba(0, 50, 0, 0.85)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Victory text
        ctx.fillStyle = COLORS.CALM_BAR;
        ctx.font = 'bold 64px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Island Safe!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80);

        // Celebration
        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.font = '28px Arial';
        ctx.fillText('The eggs are protected!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20);

        // Score
        ctx.font = 'bold 36px Arial';
        ctx.fillText('Final Score: ' + score, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40);

        // Buttons
        this.renderButton(ctx, 'restart', GAME_WIDTH / 2 - 220, GAME_HEIGHT / 2 + 100, 200, 50, 'PLAY AGAIN', onRestart);
        this.renderButton(ctx, 'menu', GAME_WIDTH / 2 + 20, GAME_HEIGHT / 2 + 100, 200, 50, 'MENU', onMenu);
    },

    // Render lose screen
    renderLose(ctx, score, onRestart, onMenu) {
        this.buttons = [];

        // Background overlay
        ctx.fillStyle = 'rgba(50, 0, 0, 0.85)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Defeat text
        ctx.fillStyle = COLORS.DANGER_BAR;
        ctx.font = 'bold 64px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Oh No!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80);

        // Message
        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.font = '28px Arial';
        ctx.fillText('The island fell into chaos...', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20);

        // Score
        ctx.font = 'bold 36px Arial';
        ctx.fillText('Score: ' + score, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40);

        // Buttons
        this.renderButton(ctx, 'restart', GAME_WIDTH / 2 - 220, GAME_HEIGHT / 2 + 100, 200, 50, 'TRY AGAIN', onRestart);
        this.renderButton(ctx, 'menu', GAME_WIDTH / 2 + 20, GAME_HEIGHT / 2 + 100, 200, 50, 'MENU', onMenu);
    },

    // Helper to render a button
    renderButton(ctx, id, x, y, width, height, text, callback) {
        const isHovered = this.hoveredButton === id;

        // Store button for click detection
        this.buttons.push({ id, x, y, width, height, callback });

        // Button background
        ctx.fillStyle = isHovered ? COLORS.BUTTON_HOVER : COLORS.BUTTON;
        this.roundRect(ctx, x, y, width, height, 8);
        ctx.fill();

        // Button border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        this.roundRect(ctx, x, y, width, height, 8);
        ctx.stroke();

        // Button text
        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, x + width / 2, y + height / 2 + 7);
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
