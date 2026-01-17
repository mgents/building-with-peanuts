// ===========================================
// UI SCREENS - Menu, Instructions, Win/Lose (v2)
// ===========================================

const Screens = {
    // Button tracking for hover/click
    buttons: [],
    hoveredButton: null,

    // Selection state
    selectedPlayers: 1,
    selectedLevel: 'mountain',
    selectedDifficulty: null, // No default - user must select

    // Name entry state
    enteredName: '',
    pendingScore: null,
    cursorBlink: 0,

    // Animation timer for backgrounds
    menuAnimTime: 0,

    init() {
        // Mouse/touch handlers for buttons
        canvas.addEventListener('click', (e) => this.onClick(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('touchstart', (e) => this.onTouch(e), { passive: false });

        // Keyboard handler for name entry
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
    },

    onKeyDown(e) {
        // Only handle when in name entry mode
        if (typeof Game !== 'undefined' && Game.state === GAME_STATES.NAME_ENTRY) {
            if (e.key === 'Backspace') {
                e.preventDefault();
                this.enteredName = this.enteredName.slice(0, -1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (this.enteredName.length > 0 && this.nameEntryCallback) {
                    this.nameEntryCallback(this.enteredName);
                }
            } else if (e.key.length === 1 && this.enteredName.length < 10) {
                // Only allow alphanumeric characters
                const char = e.key.toUpperCase();
                if (/^[A-Z0-9]$/.test(char)) {
                    e.preventDefault();
                    this.enteredName += char;
                }
            }
        }
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
                if (typeof Audio !== 'undefined' && Audio.playMenuSelect) {
                    Audio.playMenuSelect();
                }
                if (btn.callback) btn.callback();
                break;
            }
        }
    },

    // Render main menu screen with epic RPG background
    renderMenu(ctx, onStart, onInstructions, onHighscores) {
        this.buttons = [];
        this.menuAnimTime += 0.016; // Approximate 60fps

        // Epic fantasy background
        this.renderEpicBackground(ctx);

        // Dark overlay for readability
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Vignette effect
        const vignetteGrad = ctx.createRadialGradient(
            GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_HEIGHT * 0.3,
            GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_HEIGHT * 0.8
        );
        vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
        ctx.fillStyle = vignetteGrad;
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Title with glow effect
        ctx.save();
        ctx.shadowColor = '#1e90ff';
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#1e90ff';
        ctx.font = 'bold 64px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Dragon Nest', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 140);
        ctx.shadowBlur = 0;
        ctx.restore();

        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.font = 'bold 48px Arial';
        ctx.fillText('Defender', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80);

        // Subtitle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '20px Arial';
        ctx.fillText('Protect the magical island nursery!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40);

        // Start button
        this.renderButton(ctx, 'start', GAME_WIDTH / 2 - 100, GAME_HEIGHT / 2 + 10, 200, 50, 'START', onStart);

        // Instructions button
        this.renderButton(ctx, 'instructions', GAME_WIDTH / 2 - 100, GAME_HEIGHT / 2 + 75, 200, 50, 'HOW TO PLAY', onInstructions);

        // Highscores button
        this.renderButton(ctx, 'highscores', GAME_WIDTH / 2 - 100, GAME_HEIGHT / 2 + 140, 200, 50, 'HIGHSCORES', onHighscores);

        // Controls hint
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '14px Arial';
        ctx.fillText('P1: WASD | P2: Arrow Keys | Touch: Joystick', GAME_WIDTH / 2, GAME_HEIGHT - 55);

        // Version tag - bottom center
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('v2.0', GAME_WIDTH / 2, GAME_HEIGHT - 25);

        // Music toggle button - bottom right
        this.renderMusicToggle(ctx);

        // Show hint about music toggle when music is off
        if (typeof Audio !== 'undefined' && !Audio.musicEnabled) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '12px Arial';
            ctx.fillText('Click music button to enable music', GAME_WIDTH / 2, GAME_HEIGHT - 75);
        }
    },

    // Epic fantasy background with actual dragon characters from the game
    renderEpicBackground(ctx) {
        // Dramatic sky gradient (twilight)
        const skyGrad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
        skyGrad.addColorStop(0, '#0a0a1a');
        skyGrad.addColorStop(0.3, '#1a1a3a');
        skyGrad.addColorStop(0.5, '#2a1a4a');
        skyGrad.addColorStop(0.7, '#4a2a5a');
        skyGrad.addColorStop(1, '#1a1a2a');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Stars
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        const starPositions = [
            {x: 50, y: 30}, {x: 120, y: 80}, {x: 200, y: 45}, {x: 280, y: 100},
            {x: 350, y: 25}, {x: 420, y: 70}, {x: 500, y: 35}, {x: 580, y: 90},
            {x: 650, y: 50}, {x: 720, y: 110}, {x: 780, y: 40}, {x: 850, y: 85},
            {x: 100, y: 150}, {x: 300, y: 130}, {x: 500, y: 145}, {x: 700, y: 125}
        ];
        for (const star of starPositions) {
            const twinkle = Math.sin(this.menuAnimTime * 2 + star.x * 0.1) * 0.5 + 0.5;
            ctx.globalAlpha = 0.3 + twinkle * 0.7;
            ctx.beginPath();
            ctx.arc(star.x, star.y, 1 + twinkle, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Distant mountains silhouette
        ctx.fillStyle = '#1a1a2a';
        ctx.beginPath();
        ctx.moveTo(0, GAME_HEIGHT);
        ctx.lineTo(0, GAME_HEIGHT - 150);
        ctx.lineTo(100, GAME_HEIGHT - 200);
        ctx.lineTo(180, GAME_HEIGHT - 280);
        ctx.lineTo(250, GAME_HEIGHT - 220);
        ctx.lineTo(350, GAME_HEIGHT - 320);
        ctx.lineTo(450, GAME_HEIGHT - 250);
        ctx.lineTo(550, GAME_HEIGHT - 300);
        ctx.lineTo(650, GAME_HEIGHT - 230);
        ctx.lineTo(750, GAME_HEIGHT - 290);
        ctx.lineTo(850, GAME_HEIGHT - 200);
        ctx.lineTo(GAME_WIDTH, GAME_HEIGHT - 180);
        ctx.lineTo(GAME_WIDTH, GAME_HEIGHT);
        ctx.closePath();
        ctx.fill();

        // Foreground cliff/island
        const cliffGrad = ctx.createLinearGradient(0, GAME_HEIGHT - 100, 0, GAME_HEIGHT);
        cliffGrad.addColorStop(0, '#2a3a2a');
        cliffGrad.addColorStop(1, '#1a2a1a');
        ctx.fillStyle = cliffGrad;
        ctx.beginPath();
        ctx.moveTo(0, GAME_HEIGHT);
        ctx.lineTo(0, GAME_HEIGHT - 80);
        ctx.quadraticCurveTo(GAME_WIDTH / 4, GAME_HEIGHT - 120, GAME_WIDTH / 2, GAME_HEIGHT - 100);
        ctx.quadraticCurveTo(GAME_WIDTH * 3/4, GAME_HEIGHT - 80, GAME_WIDTH, GAME_HEIGHT - 90);
        ctx.lineTo(GAME_WIDTH, GAME_HEIGHT);
        ctx.closePath();
        ctx.fill();

        // Nests on the island
        this.renderMenuNest(ctx, 180, GAME_HEIGHT - 95, 25);
        this.renderMenuNest(ctx, GAME_WIDTH - 200, GAME_HEIGHT - 85, 22);
        this.renderMenuNest(ctx, GAME_WIDTH / 2 + 50, GAME_HEIGHT - 100, 20);

        // ACTUAL GAME DRAGONS - Blue dragon flying on left, Green dragon on right
        // Using the same drawFullDragon that mirrors the actual game dragon rendering
        this.drawFullDragon(ctx, 180, 280, 1.2, '#1e90ff', '#00d4ff', true);
        this.drawFullDragon(ctx, GAME_WIDTH - 180, 320, 1.1, '#22c55e', '#88ffaa', false);

        // Large dramatic dragon silhouette in center background
        this.renderLargeDragonSilhouette(ctx, GAME_WIDTH / 2 - 80, 80);

        // Moon/magical orb
        ctx.save();
        const moonGlow = ctx.createRadialGradient(GAME_WIDTH - 100, 100, 0, GAME_WIDTH - 100, 100, 80);
        moonGlow.addColorStop(0, 'rgba(255, 240, 200, 0.9)');
        moonGlow.addColorStop(0.3, 'rgba(255, 220, 150, 0.4)');
        moonGlow.addColorStop(1, 'rgba(255, 200, 100, 0)');
        ctx.fillStyle = moonGlow;
        ctx.beginPath();
        ctx.arc(GAME_WIDTH - 100, 100, 80, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fffae0';
        ctx.beginPath();
        ctx.arc(GAME_WIDTH - 100, 100, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Magical particles floating around the dragons
        ctx.fillStyle = 'rgba(100, 200, 255, 0.6)';
        for (let i = 0; i < 15; i++) {
            const x = 100 + (i * 60) + Math.sin(this.menuAnimTime + i) * 20;
            const y = 300 + Math.sin(this.menuAnimTime * 0.5 + i * 0.7) * 50;
            const size = 2 + Math.sin(this.menuAnimTime * 2 + i) * 1;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Green dragon magical particles
        ctx.fillStyle = 'rgba(100, 255, 150, 0.6)';
        for (let i = 0; i < 10; i++) {
            const x = GAME_WIDTH - 250 + (i * 20) + Math.sin(this.menuAnimTime * 1.2 + i) * 15;
            const y = 280 + Math.cos(this.menuAnimTime * 0.8 + i * 0.5) * 40;
            const size = 2 + Math.sin(this.menuAnimTime * 2.5 + i) * 1;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    // Menu nest decoration
    renderMenuNest(ctx, x, y, size) {
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(x + 2, y + size * 0.3, size * 1.1, size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nest outer
        const nestGrad = ctx.createRadialGradient(x, y, size * 0.3, x, y, size);
        nestGrad.addColorStop(0, '#a08040');
        nestGrad.addColorStop(1, '#604020');
        ctx.fillStyle = nestGrad;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Nest inner
        ctx.fillStyle = '#c0a060';
        ctx.beginPath();
        ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Eggs in nest
        ctx.fillStyle = '#f0f0e0';
        ctx.beginPath();
        ctx.ellipse(x - 5, y, 6, 8, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + 5, y - 2, 5, 7, 0.2, 0, Math.PI * 2);
        ctx.fill();
    },

    // Menu dragon decoration
    renderMenuDragon(ctx, x, y, scale, color, facingRight) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        if (!facingRight) ctx.scale(-1, 1);

        // Wing animation
        const wingAngle = Math.sin(this.menuAnimTime * 4) * 0.3;

        // Wings
        ctx.save();
        ctx.rotate(wingAngle - 0.3);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-40, -30, -60, -10);
        ctx.quadraticCurveTo(-40, 10, 0, 0);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();

        // Body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(0, 0, 30, 20, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.ellipse(25, -5, 15, 12, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Eye glow
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(32, -8, 5, 0, Math.PI * 2);
        ctx.fill();

        // Tail
        ctx.strokeStyle = color;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(-25, 5);
        ctx.quadraticCurveTo(-50, 15, -60, 5);
        ctx.stroke();

        ctx.restore();
    },

    // Large dragon silhouette for dramatic effect
    renderLargeDragonSilhouette(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        ctx.globalAlpha = 0.15;

        const wingAngle = Math.sin(this.menuAnimTime * 2) * 0.1;

        // Large wings
        ctx.fillStyle = '#4080ff';
        ctx.save();
        ctx.rotate(wingAngle);
        ctx.beginPath();
        ctx.moveTo(0, 50);
        ctx.quadraticCurveTo(-100, -50, -150, 20);
        ctx.quadraticCurveTo(-80, 80, 0, 50);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.rotate(-wingAngle);
        ctx.beginPath();
        ctx.moveTo(0, 50);
        ctx.quadraticCurveTo(100, -50, 150, 20);
        ctx.quadraticCurveTo(80, 80, 0, 50);
        ctx.fill();
        ctx.restore();

        // Body
        ctx.beginPath();
        ctx.ellipse(0, 60, 40, 30, 0, 0, Math.PI * 2);
        ctx.fill();

        // Neck and head
        ctx.beginPath();
        ctx.ellipse(30, 30, 25, 20, 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.restore();
    },

    // Render player select screen - Single click to select and continue
    renderPlayerSelect(ctx, onSelect, onBack) {
        this.buttons = [];
        this.menuAnimTime += 0.016;

        // Epic background
        this.renderEpicBackground(ctx);

        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Back button
        this.renderButton(ctx, 'back', 30, 30, 100, 40, '← BACK', onBack);

        // Title with glow
        ctx.save();
        ctx.shadowColor = '#1e90ff';
        ctx.shadowBlur = 20;
        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.font = 'bold 38px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SELECT PLAYERS', GAME_WIDTH / 2, 85);
        ctx.shadowBlur = 0;
        ctx.restore();

        // Card dimensions - taller to fit dragons
        const cardWidth = 220;
        const cardHeight = 320;
        const cardSpacing = 60;
        const cardsY = 120;

        // 1 Player card - single click selects and advances
        const card1X = GAME_WIDTH / 2 - cardWidth - cardSpacing / 2;
        this.renderPlayerCardClickToSelect(ctx, '1player', card1X, cardsY, cardWidth, cardHeight,
            '1 PLAYER', 1, () => {
                this.selectedPlayers = 1;
                Audio.playMenuSelect();
                onSelect(1);
            });

        // 2 Players card - single click selects and advances
        const card2X = GAME_WIDTH / 2 + cardSpacing / 2;
        this.renderPlayerCardClickToSelect(ctx, '2players', card2X, cardsY, cardWidth, cardHeight,
            '2 PLAYERS', 2, () => {
                this.selectedPlayers = 2;
                Audio.playMenuSelect();
                onSelect(2);
            });

        // Hint text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Click to select and continue', GAME_WIDTH / 2, GAME_HEIGHT - 40);

        // Music toggle button
        this.renderMusicToggle(ctx);
    },

    // Helper: Render player selection card with full dragon display
    renderPlayerCard(ctx, id, x, y, width, height, text, selected, playerCount, callback) {
        const isHovered = this.hoveredButton === id;

        this.buttons.push({ id, x, y, width, height, callback });

        // Card background with gradient
        const bgGrad = ctx.createLinearGradient(x, y, x, y + height);
        if (selected) {
            bgGrad.addColorStop(0, 'rgba(79, 70, 229, 0.95)');
            bgGrad.addColorStop(1, 'rgba(50, 40, 180, 0.95)');
        } else if (isHovered) {
            bgGrad.addColorStop(0, 'rgba(79, 70, 229, 0.6)');
            bgGrad.addColorStop(1, 'rgba(50, 40, 150, 0.6)');
        } else {
            bgGrad.addColorStop(0, 'rgba(40, 40, 70, 0.9)');
            bgGrad.addColorStop(1, 'rgba(25, 25, 50, 0.9)');
        }
        ctx.fillStyle = bgGrad;
        this.roundRect(ctx, x, y, width, height, 16);
        ctx.fill();

        // Glow effect when selected/hovered
        if (selected || isHovered) {
            ctx.save();
            ctx.shadowColor = selected ? '#00ff88' : '#8080ff';
            ctx.shadowBlur = 20;
            ctx.strokeStyle = selected ? '#00ff88' : '#8080ff';
            ctx.lineWidth = 3;
            this.roundRect(ctx, x, y, width, height, 16);
            ctx.stroke();
            ctx.restore();
        }

        // Card border
        ctx.strokeStyle = selected ? '#00ff88' : (isHovered ? '#8080ff' : 'rgba(255, 255, 255, 0.3)');
        ctx.lineWidth = selected ? 3 : 2;
        this.roundRect(ctx, x, y, width, height, 16);
        ctx.stroke();

        // Title text at top
        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, x + width / 2, y + 40);

        // Large dragon display area
        const dragonAreaY = y + 70;
        const dragonAreaHeight = 160;

        // Draw full detailed dragon(s)
        if (playerCount === 1) {
            // Single large blue dragon centered
            this.drawFullDragon(ctx, x + width / 2, dragonAreaY + dragonAreaHeight / 2, 1.0, '#1e90ff', '#00d4ff', true);
        } else {
            // Two dragons side by side
            this.drawFullDragon(ctx, x + width / 2 - 50, dragonAreaY + dragonAreaHeight / 2, 0.7, '#1e90ff', '#00d4ff', true);
            this.drawFullDragon(ctx, x + width / 2 + 50, dragonAreaY + dragonAreaHeight / 2, 0.7, '#22c55e', '#88ffaa', false);
        }

        // Player labels under dragons
        ctx.font = 'bold 14px Arial';
        if (playerCount === 1) {
            ctx.fillStyle = '#1e90ff';
            ctx.fillText('Blue Dragon', x + width / 2, y + height - 80);
        } else {
            ctx.fillStyle = '#1e90ff';
            ctx.fillText('P1', x + width / 2 - 50, y + height - 85);
            ctx.fillStyle = '#22c55e';
            ctx.fillText('P2', x + width / 2 + 50, y + height - 85);
        }

        // Controls hint
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '13px Arial';
        if (playerCount === 1) {
            ctx.fillText('WASD or Arrow Keys', x + width / 2, y + height - 50);
            ctx.fillText('Touch: Virtual Joystick', x + width / 2, y + height - 32);
        } else {
            ctx.fillText('P1: WASD  |  P2: Arrows', x + width / 2, y + height - 50);
            ctx.fillText('Touch: Dual Joysticks', x + width / 2, y + height - 32);
        }
    },

    // Draw a full detailed dragon for player select
    drawFullDragon(ctx, x, y, scale, bodyColor, accentColor, facingRight) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        if (!facingRight) ctx.scale(-1, 1);

        const wingAngle = Math.sin(this.menuAnimTime * 5) * 0.25;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(5, 50, 40, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wings (behind body)
        ctx.save();
        ctx.translate(-5, -10);
        ctx.rotate(-0.3 + wingAngle);

        // Wing membrane
        ctx.fillStyle = bodyColor;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-30, -40, -55, -20);
        ctx.quadraticCurveTo(-50, 0, -40, 10);
        ctx.quadraticCurveTo(-20, 15, 0, 5);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;

        // Wing bones
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-40, -25);
        ctx.moveTo(-15, -10);
        ctx.lineTo(-35, -5);
        ctx.stroke();
        ctx.restore();

        // Tail
        ctx.strokeStyle = bodyColor;
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-25, 10);
        ctx.quadraticCurveTo(-50, 20, -65, 5);
        ctx.stroke();

        // Tail spikes
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.moveTo(-55, 0);
        ctx.lineTo(-65, -10);
        ctx.lineTo(-60, 5);
        ctx.closePath();
        ctx.fill();

        // Body
        const bodyGrad = ctx.createRadialGradient(5, 0, 5, 0, 0, 35);
        bodyGrad.addColorStop(0, accentColor);
        bodyGrad.addColorStop(0.5, bodyColor);
        bodyGrad.addColorStop(1, bodyColor);
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 35, 28, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body scales pattern
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(0, 5 + i * 8, 20 - i * 3, 0.3, Math.PI - 0.3);
            ctx.stroke();
        }

        // Legs
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(15, 30, 8, 12, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-10, 28, 7, 11, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Neck and head
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(30, -15, 20, 16, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Snout
        ctx.beginPath();
        ctx.ellipse(48, -12, 12, 8, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Eye socket
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(35, -20, 8, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye with glow
        ctx.save();
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 10;
        const eyeGrad = ctx.createRadialGradient(36, -20, 0, 36, -20, 6);
        eyeGrad.addColorStop(0, '#ffffff');
        eyeGrad.addColorStop(0.3, accentColor);
        eyeGrad.addColorStop(1, bodyColor);
        ctx.fillStyle = eyeGrad;
        ctx.beginPath();
        ctx.ellipse(36, -20, 6, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Pupil
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(37, -20, 2, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Horns
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.moveTo(25, -28);
        ctx.lineTo(20, -50);
        ctx.lineTo(30, -32);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(35, -30);
        ctx.lineTo(38, -48);
        ctx.lineTo(40, -32);
        ctx.closePath();
        ctx.fill();

        // Nostrils
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(56, -14, 2, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(56, -9, 2, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Back spines
        ctx.fillStyle = accentColor;
        for (let i = 0; i < 4; i++) {
            const spineX = -5 - i * 10;
            ctx.beginPath();
            ctx.moveTo(spineX - 3, -15);
            ctx.lineTo(spineX, -30 + i * 2);
            ctx.lineTo(spineX + 3, -15);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    },

    // Helper: Render player selection card with click-to-select (single click advances)
    renderPlayerCardClickToSelect(ctx, id, x, y, width, height, text, playerCount, callback) {
        const isHovered = this.hoveredButton === id;

        this.buttons.push({ id, x, y, width, height, callback });

        // Card background with gradient - highlight on hover
        const bgGrad = ctx.createLinearGradient(x, y, x, y + height);
        if (isHovered) {
            bgGrad.addColorStop(0, 'rgba(79, 70, 229, 0.9)');
            bgGrad.addColorStop(1, 'rgba(50, 40, 180, 0.9)');
        } else {
            bgGrad.addColorStop(0, 'rgba(40, 40, 70, 0.9)');
            bgGrad.addColorStop(1, 'rgba(25, 25, 50, 0.9)');
        }
        ctx.fillStyle = bgGrad;
        this.roundRect(ctx, x, y, width, height, 16);
        ctx.fill();

        // Glow effect on hover
        if (isHovered) {
            ctx.save();
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 25;
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 3;
            this.roundRect(ctx, x, y, width, height, 16);
            ctx.stroke();
            ctx.restore();
        }

        // Card border
        ctx.strokeStyle = isHovered ? '#00ff88' : 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = isHovered ? 3 : 2;
        this.roundRect(ctx, x, y, width, height, 16);
        ctx.stroke();

        // Title text at top
        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, x + width / 2, y + 40);

        // Large dragon display area
        const dragonAreaY = y + 70;
        const dragonAreaHeight = 160;

        // Draw full detailed dragon(s)
        if (playerCount === 1) {
            // Single large blue dragon centered
            this.drawFullDragon(ctx, x + width / 2, dragonAreaY + dragonAreaHeight / 2, 1.0, '#1e90ff', '#00d4ff', true);
        } else {
            // Two dragons side by side
            this.drawFullDragon(ctx, x + width / 2 - 50, dragonAreaY + dragonAreaHeight / 2, 0.7, '#1e90ff', '#00d4ff', true);
            this.drawFullDragon(ctx, x + width / 2 + 50, dragonAreaY + dragonAreaHeight / 2, 0.7, '#22c55e', '#88ffaa', false);
        }

        // Player labels under dragons
        ctx.font = 'bold 14px Arial';
        if (playerCount === 1) {
            ctx.fillStyle = '#1e90ff';
            ctx.fillText('Blue Dragon', x + width / 2, y + height - 80);
        } else {
            ctx.fillStyle = '#1e90ff';
            ctx.fillText('P1', x + width / 2 - 50, y + height - 85);
            ctx.fillStyle = '#22c55e';
            ctx.fillText('P2', x + width / 2 + 50, y + height - 85);
        }

        // Controls hint
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '13px Arial';
        if (playerCount === 1) {
            ctx.fillText('WASD or Arrow Keys', x + width / 2, y + height - 50);
            ctx.fillText('Touch: Virtual Joystick', x + width / 2, y + height - 32);
        } else {
            ctx.fillText('P1: WASD  |  P2: Arrows', x + width / 2, y + height - 50);
            ctx.fillText('Touch: Dual Joysticks', x + width / 2, y + height - 32);
        }

        // "Click to Select" indicator when hovered
        if (isHovered) {
            ctx.fillStyle = '#00ff88';
            ctx.font = 'bold 14px Arial';
            ctx.fillText('▶ CLICK TO SELECT', x + width / 2, y + height - 10);
        }
    },

    // Helper: Draw a mini dragon icon
    drawMiniDragon(ctx, x, y, bodyColor, eyeColor, size) {
        // Body
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(x, y, size, size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye glow
        ctx.fillStyle = eyeColor;
        ctx.beginPath();
        ctx.arc(x + size * 0.25, y - size * 0.2, size * 0.22, 0, Math.PI * 2);
        ctx.fill();

        // Wing hint
        ctx.fillStyle = bodyColor;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.ellipse(x - size * 0.6, y - size * 0.3, size * 0.5, size * 0.25, -0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    },

    // Render level select screen - Single click to select and continue
    renderLevelSelect(ctx, onSelect, onBack) {
        this.buttons = [];
        this.menuAnimTime += 0.016;

        // Epic background
        this.renderEpicBackground(ctx);

        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Back button
        this.renderButton(ctx, 'back', 30, 30, 100, 40, '← BACK', onBack);

        // Title with glow
        ctx.save();
        ctx.shadowColor = '#f4d03f';
        ctx.shadowBlur = 20;
        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.font = 'bold 38px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SELECT LEVEL', GAME_WIDTH / 2, 85);
        ctx.shadowBlur = 0;
        ctx.restore();

        // Level options with themed backgrounds
        const levels = [
            { id: 'mountain', name: 'Mountain Peak', color: '#5a4a3a', accent: '#8a7a6a', icon: '🏔️', desc: 'Rocky peaks & cold winds' },
            { id: 'beach', name: 'Beach Paradise', color: '#2a6090', accent: '#f4d03f', icon: '🏝️', desc: 'Tropical shores & waves' },
            { id: 'forest', name: 'Forest Glade', color: '#1a4a1a', accent: '#228b22', icon: '🌲', desc: 'Ancient trees & mushrooms' },
            { id: 'cave', name: 'Crystal Cave', color: '#2a1a4a', accent: '#9370db', icon: '💎', desc: 'Glowing crystals & pools' }
        ];

        const btnWidth = 200;
        const btnHeight = 160;
        const spacing = 30;
        const startX = (GAME_WIDTH - (btnWidth * 2 + spacing)) / 2;

        levels.forEach((level, i) => {
            const x = startX + (i % 2) * (btnWidth + spacing);
            const y = 120 + Math.floor(i / 2) * (btnHeight + spacing);

            // Single click selects and advances
            this.renderLevelCardClickToSelect(ctx, level.id, x, y, btnWidth, btnHeight, level, () => {
                this.selectedLevel = level.id;
                Audio.playMenuSelect();
                onSelect(level.id);
            });
        });

        // Continue hint
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '18px Arial';
        ctx.fillText('Click to select and continue', GAME_WIDTH / 2, GAME_HEIGHT - 40);

        // Music toggle button
        this.renderMusicToggle(ctx);
    },

    // Render level card with themed mini-preview
    renderLevelCard(ctx, id, x, y, width, height, level, selected, callback) {
        const isHovered = this.hoveredButton === id;

        this.buttons.push({ id, x, y, width, height, callback });

        // Card background with level theme gradient
        const bgGrad = ctx.createLinearGradient(x, y, x, y + height);
        if (selected) {
            bgGrad.addColorStop(0, level.color);
            bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        } else if (isHovered) {
            bgGrad.addColorStop(0, level.color + 'aa');
            bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
        } else {
            bgGrad.addColorStop(0, 'rgba(40, 40, 60, 0.9)');
            bgGrad.addColorStop(1, 'rgba(25, 25, 45, 0.9)');
        }
        ctx.fillStyle = bgGrad;
        this.roundRect(ctx, x, y, width, height, 12);
        ctx.fill();

        // Glow effect when selected/hovered
        if (selected || isHovered) {
            ctx.save();
            ctx.shadowColor = level.accent;
            ctx.shadowBlur = 15;
            ctx.strokeStyle = level.accent;
            ctx.lineWidth = 3;
            this.roundRect(ctx, x, y, width, height, 12);
            ctx.stroke();
            ctx.restore();
        }

        // Border
        ctx.strokeStyle = selected ? level.accent : (isHovered ? level.accent : 'rgba(255, 255, 255, 0.2)');
        ctx.lineWidth = selected ? 3 : 2;
        this.roundRect(ctx, x, y, width, height, 12);
        ctx.stroke();

        // Icon
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(level.icon, x + width / 2, y + 60);

        // Name
        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.font = 'bold 18px Arial';
        ctx.fillText(level.name, x + width / 2, y + 100);

        // Description
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '12px Arial';
        ctx.fillText(level.desc, x + width / 2, y + 120);

        // Selection indicator
        if (selected) {
            ctx.fillStyle = level.accent;
            ctx.font = 'bold 12px Arial';
            ctx.fillText('✓ SELECTED', x + width / 2, y + height - 12);
        }
    },

    // Render level card with click-to-select (single click advances)
    renderLevelCardClickToSelect(ctx, id, x, y, width, height, level, callback) {
        const isHovered = this.hoveredButton === id;

        this.buttons.push({ id, x, y, width, height, callback });

        // Card background with level theme gradient on hover
        const bgGrad = ctx.createLinearGradient(x, y, x, y + height);
        if (isHovered) {
            bgGrad.addColorStop(0, level.color);
            bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        } else {
            bgGrad.addColorStop(0, 'rgba(40, 40, 60, 0.9)');
            bgGrad.addColorStop(1, 'rgba(25, 25, 45, 0.9)');
        }
        ctx.fillStyle = bgGrad;
        this.roundRect(ctx, x, y, width, height, 12);
        ctx.fill();

        // Glow effect on hover
        if (isHovered) {
            ctx.save();
            ctx.shadowColor = level.accent;
            ctx.shadowBlur = 20;
            ctx.strokeStyle = level.accent;
            ctx.lineWidth = 3;
            this.roundRect(ctx, x, y, width, height, 12);
            ctx.stroke();
            ctx.restore();
        }

        // Border
        ctx.strokeStyle = isHovered ? level.accent : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = isHovered ? 3 : 2;
        this.roundRect(ctx, x, y, width, height, 12);
        ctx.stroke();

        // Icon
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(level.icon, x + width / 2, y + 60);

        // Name
        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.font = 'bold 18px Arial';
        ctx.fillText(level.name, x + width / 2, y + 100);

        // Description
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '12px Arial';
        ctx.fillText(level.desc, x + width / 2, y + 120);

        // "Click to Select" indicator when hovered
        if (isHovered) {
            ctx.fillStyle = level.accent;
            ctx.font = 'bold 12px Arial';
            ctx.fillText('▶ CLICK TO SELECT', x + width / 2, y + height - 12);
        }
    },

    // Render difficulty select screen - clicking starts the game immediately
    renderDifficultySelect(ctx, onSelect, onBack) {
        this.buttons = [];
        this.menuAnimTime += 0.016;

        // Epic background
        this.renderEpicBackground(ctx);

        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Back button
        this.renderButton(ctx, 'back', 30, 30, 100, 40, '← BACK', onBack);

        // Title with glow
        ctx.save();
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 20;
        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.font = 'bold 38px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SELECT DIFFICULTY', GAME_WIDTH / 2, 85);
        ctx.shadowBlur = 0;
        ctx.restore();

        // Difficulty options - clicking starts the game
        // Timing: Easy 30% slower, Hard 30% faster than Medium
        // 1P Medium: 10s spawn/timeout, 2P Medium: 5s spawn/timeout (2x faster)
        const is2P = this.selectedPlayers === 2;
        const baseTime = is2P ? 5 : 10;
        const eggsToWin = is2P ? 50 : 25;
        const difficulties = [
            {
                id: 'easy',
                name: 'EASY',
                color: '#22c55e',
                bgColor: 'rgba(34, 197, 94, 0.15)',
                icon: '🌱',
                desc: 'Relaxed pace',
                desc2: `${Math.round(baseTime * 1.3)}s spawn • ${Math.round(baseTime * 1.3)}s timer`,
                desc3: '30% slower than Medium',
                eggs: `${eggsToWin} eggs to win`
            },
            {
                id: 'medium',
                name: 'MEDIUM',
                color: '#f59e0b',
                bgColor: 'rgba(245, 158, 11, 0.15)',
                icon: '⚔️',
                desc: 'Balanced challenge',
                desc2: `${baseTime}s spawn • ${baseTime}s timer`,
                desc3: 'Standard gameplay',
                eggs: `${eggsToWin} eggs to win`
            },
            {
                id: 'hard',
                name: 'HARD',
                color: '#ef4444',
                bgColor: 'rgba(239, 68, 68, 0.15)',
                icon: '💀',
                desc: 'Intense action',
                desc2: `${Math.round(baseTime * 0.7)}s spawn • ${Math.round(baseTime * 0.7)}s timer`,
                desc3: '30% faster than Medium',
                eggs: `${eggsToWin} eggs to win`
            }
        ];

        const btnWidth = 220;
        const btnHeight = 260;
        const spacing = 40;
        const startX = (GAME_WIDTH - (btnWidth * 3 + spacing * 2)) / 2;
        const cardsY = 130;

        difficulties.forEach((diff, i) => {
            const x = startX + i * (btnWidth + spacing);
            // No default selection - selectedDifficulty is null
            const selected = false; // Never show as selected before click

            this.renderDifficultyCardClickToStart(ctx, diff.id, x, cardsY, btnWidth, btnHeight,
                diff, () => {
                    this.selectedDifficulty = diff.id;
                    Audio.playMenuSelect();
                    onSelect(diff.id); // Start game immediately
                });
        });

        // Hint - no need for separate start button
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Click a difficulty to start!', GAME_WIDTH / 2, GAME_HEIGHT - 45);

        // Music toggle button
        this.renderMusicToggle(ctx);
    },

    // Difficulty card that starts game on click
    renderDifficultyCardClickToStart(ctx, id, x, y, width, height, diff, callback) {
        const isHovered = this.hoveredButton === id;

        this.buttons.push({ id, x, y, width, height, callback });

        // Card background with difficulty-specific gradient
        const bgGrad = ctx.createLinearGradient(x, y, x, y + height);
        if (isHovered) {
            bgGrad.addColorStop(0, diff.bgColor.replace('0.15', '0.5'));
            bgGrad.addColorStop(0.5, diff.bgColor.replace('0.15', '0.3'));
            bgGrad.addColorStop(1, 'rgba(20, 20, 40, 0.95)');
        } else {
            bgGrad.addColorStop(0, 'rgba(40, 40, 60, 0.9)');
            bgGrad.addColorStop(1, 'rgba(25, 25, 45, 0.9)');
        }
        ctx.fillStyle = bgGrad;
        this.roundRect(ctx, x, y, width, height, 16);
        ctx.fill();

        // Colored accent bar at top
        ctx.fillStyle = diff.color;
        ctx.fillRect(x + 1, y + 1, width - 2, 8);

        // Glow effect on hover
        if (isHovered) {
            ctx.save();
            ctx.shadowColor = diff.color;
            ctx.shadowBlur = 25;
            ctx.strokeStyle = diff.color;
            ctx.lineWidth = 3;
            this.roundRect(ctx, x, y, width, height, 16);
            ctx.stroke();
            ctx.restore();
        }

        // Border
        ctx.strokeStyle = isHovered ? diff.color : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = isHovered ? 3 : 2;
        this.roundRect(ctx, x, y, width, height, 16);
        ctx.stroke();

        // Large icon
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(diff.icon, x + width / 2, y + 65);

        // Name with difficulty color
        ctx.fillStyle = diff.color;
        ctx.font = 'bold 26px Arial';
        ctx.fillText(diff.name, x + width / 2, y + 100);

        // Main description
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(diff.desc, x + width / 2, y + 130);

        // Detail lines
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '12px Arial';
        ctx.fillText(diff.desc2, x + width / 2, y + 155);
        ctx.fillText(diff.desc3, x + width / 2, y + 175);

        // Eggs requirement with golden color
        ctx.fillStyle = '#f4d03f';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('🥚 ' + diff.eggs, x + width / 2, y + 205);

        // "Click to Start" prompt when hovered
        if (isHovered) {
            ctx.fillStyle = diff.color;
            ctx.font = 'bold 16px Arial';
            ctx.fillText('▶ CLICK TO START', x + width / 2, y + height - 20);
        } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.font = '13px Arial';
            ctx.fillText('Click to play', x + width / 2, y + height - 20);
        }
    },

    // Helper: Render difficulty card with distinct visuals
    renderDifficultyCard(ctx, id, x, y, width, height, diff, selected, callback) {
        const isHovered = this.hoveredButton === id;

        this.buttons.push({ id, x, y, width, height, callback });

        // Card background with difficulty-specific tint
        if (selected) {
            ctx.fillStyle = diff.bgColor.replace('0.15', '0.4');
        } else if (isHovered) {
            ctx.fillStyle = diff.bgColor.replace('0.15', '0.25');
        } else {
            ctx.fillStyle = 'rgba(30, 30, 45, 0.9)';
        }
        this.roundRect(ctx, x, y, width, height, 16);
        ctx.fill();

        // Colored top bar
        ctx.fillStyle = diff.color;
        ctx.fillRect(x + 1, y + 1, width - 2, 6);

        // Border with difficulty color when selected/hovered
        if (selected) {
            ctx.strokeStyle = diff.color;
            ctx.lineWidth = 4;
        } else if (isHovered) {
            ctx.strokeStyle = diff.color;
            ctx.lineWidth = 2;
        } else {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1;
        }
        this.roundRect(ctx, x, y, width, height, 16);
        ctx.stroke();

        // Icon
        ctx.font = '42px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(diff.icon, x + width / 2, y + 60);

        // Name with difficulty color
        ctx.fillStyle = diff.color;
        ctx.font = 'bold 22px Arial';
        ctx.fillText(diff.name, x + width / 2, y + 95);

        // Description lines
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '13px Arial';
        ctx.fillText(diff.desc, x + width / 2, y + 120);
        ctx.fillText(diff.desc2, x + width / 2, y + 138);

        // Eggs requirement with golden color
        ctx.fillStyle = '#f4d03f';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('🥚 ' + diff.eggs, x + width / 2, y + height - 15);

        // Selection indicator
        if (selected) {
            ctx.fillStyle = diff.color;
            ctx.font = 'bold 12px Arial';
            ctx.fillText('✓ SELECTED', x + width / 2, y + height + 18);
        }
    },

    // Render instructions screen
    renderInstructions(ctx, onBack) {
        this.buttons = [];

        // Background overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Back button (top-left)
        this.renderButton(ctx, 'back', 30, 30, 100, 40, '← BACK', onBack);

        // Title
        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('HOW TO PLAY', GAME_WIDTH / 2, 70);

        // Instructions panel
        const panelX = GAME_WIDTH / 2 - 380;
        const panelY = 100;
        const panelWidth = 760;
        const panelHeight = 560;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 16);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        this.roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 16);
        ctx.stroke();

        // Instructions
        const instructions = [
            { icon: '🎮', text: 'P1: WASD keys | P2: Arrow keys | Touch: Joystick' },
            { icon: '🥚', text: 'Pick up eggs and bring them to nests before they crack' },
            { icon: '👻', text: 'Touch invaders to scare them away from nests' },
            { icon: '🔧', text: 'Stay near damaged nests to repair them' },
            { icon: '⚠️', text: 'Each lost egg adds 20% danger, each lost nest adds 35%' },
            { icon: '💀', text: 'Game over when DANGER reaches 100%!' },
            { icon: '🎯', text: 'Deliver the required number of eggs to WIN!' }
        ];

        ctx.font = '18px Arial';
        ctx.textAlign = 'left';

        instructions.forEach((inst, i) => {
            const y = 145 + i * 38;
            ctx.fillStyle = COLORS.UI_TEXT;
            ctx.fillText(inst.icon + '  ' + inst.text, panelX + 40, y);
        });

        // Power-up legend title
        ctx.fillStyle = '#f4d03f';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⭐ POWER-UPS ⭐', GAME_WIDTH / 2, 430);

        ctx.font = '15px Arial';

        // Power-ups in 2 rows, 3 columns layout
        const powerUpStartY = 465;
        const col1 = panelX + 130;
        const col2 = GAME_WIDTH / 2;
        const col3 = panelX + panelWidth - 130;

        // Row 1
        ctx.fillStyle = COLORS.POWERUP_WING;
        ctx.fillText('💨 Wing Boost', col1, powerUpStartY);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText('Speed up', col1, powerUpStartY + 20);

        ctx.fillStyle = COLORS.POWERUP_SCARE;
        ctx.fillText('💥 Big Scare', col2, powerUpStartY);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText('Scare all invaders', col2, powerUpStartY + 20);

        ctx.fillStyle = COLORS.POWERUP_SHIELD;
        ctx.fillText('🛡️ Nest Shield', col3, powerUpStartY);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText('Protect nests', col3, powerUpStartY + 20);

        // Row 2
        const row2Y = powerUpStartY + 55;
        ctx.fillStyle = COLORS.POWERUP_BANISH;
        ctx.fillText('🌀 Banish', col1, row2Y);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText('Remove invaders', col1, row2Y + 20);

        ctx.fillStyle = COLORS.POWERUP_DANGER;
        ctx.fillText('❤️ Danger Reduce', col2, row2Y);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText('Reduce danger by 20%', col2, row2Y + 20);

        // Hint at bottom
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '14px Arial';
        ctx.fillText('Power-ups disappear if not collected in time!', GAME_WIDTH / 2, panelY + panelHeight - 20);

        // Music toggle button
        this.renderMusicToggle(ctx);
    },

    // Render win screen with detailed score breakdown
    renderWin(ctx, score, eggsCollected, scoreBreakdown, onRestart, onMenu) {
        this.buttons = [];

        // Background overlay
        ctx.fillStyle = 'rgba(0, 50, 0, 0.92)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Victory text
        ctx.fillStyle = COLORS.CALM_BAR;
        ctx.font = 'bold 52px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎉 VICTORY! 🎉', GAME_WIDTH / 2, 70);

        // Main stats panel
        const panelX = GAME_WIDTH / 2 - 200;
        const panelY = 100;
        const panelWidth = 400;
        const panelHeight = 400;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 16);
        ctx.fill();

        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 3;
        this.roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 16);
        ctx.stroke();

        // Stats title
        ctx.fillStyle = '#f4d03f';
        ctx.font = 'bold 22px Arial';
        ctx.fillText('📊 SCORE BREAKDOWN', GAME_WIDTH / 2, panelY + 35);

        const stats = scoreBreakdown.stats;
        let y = panelY + 70;
        const lineHeight = 28;
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        const leftX = panelX + 30;
        const rightX = panelX + panelWidth - 30;

        // Bonuses (green)
        ctx.fillStyle = '#22c55e';
        ctx.fillText(`🥚 Eggs Delivered: ${stats.eggsDelivered}`, leftX, y);
        ctx.textAlign = 'right';
        ctx.fillText(`+${scoreBreakdown.deliveryBonus}`, rightX, y);
        y += lineHeight;

        ctx.textAlign = 'left';
        ctx.fillText(`⚡ Fast Deliveries: ${stats.fastDeliveries}`, leftX, y);
        ctx.textAlign = 'right';
        ctx.fillText(`+${scoreBreakdown.speedBonus}`, rightX, y);
        y += lineHeight;

        ctx.textAlign = 'left';
        ctx.fillText(`🔧 Nests Repaired: ${stats.nestsRepaired}`, leftX, y);
        ctx.textAlign = 'right';
        ctx.fillText(`+${scoreBreakdown.repairBonus}`, rightX, y);
        y += lineHeight;

        ctx.textAlign = 'left';
        ctx.fillText(`👻 Invaders Scared: ${stats.invadersScared}`, leftX, y);
        ctx.textAlign = 'right';
        ctx.fillText(`+${scoreBreakdown.scareBonus}`, rightX, y);
        y += lineHeight;

        ctx.textAlign = 'left';
        ctx.fillText(`⭐ Power-ups: ${stats.powerUpsCollected}`, leftX, y);
        ctx.textAlign = 'right';
        ctx.fillText(`+${scoreBreakdown.powerUpBonus}`, rightX, y);
        y += lineHeight;

        ctx.textAlign = 'left';
        ctx.fillText(`⏱️ Time Bonus (${this.formatTime(scoreBreakdown.gameTime)})`, leftX, y);
        ctx.textAlign = 'right';
        ctx.fillText(`+${scoreBreakdown.timeBonus}`, rightX, y);
        y += lineHeight + 5;

        // Penalties (red)
        ctx.fillStyle = '#ef4444';
        ctx.textAlign = 'left';
        ctx.fillText(`💔 Eggs Lost: ${stats.eggsLost}`, leftX, y);
        ctx.textAlign = 'right';
        ctx.fillText(`-${scoreBreakdown.eggsLostPenalty}`, rightX, y);
        y += lineHeight;

        ctx.textAlign = 'left';
        ctx.fillText(`😰 Eggs Dropped: ${stats.eggsDropped}`, leftX, y);
        ctx.textAlign = 'right';
        ctx.fillText(`-${scoreBreakdown.droppedPenalty}`, rightX, y);
        y += lineHeight;

        ctx.textAlign = 'left';
        ctx.fillText(`🔥 Nest Damage Taken`, leftX, y);
        ctx.textAlign = 'right';
        ctx.fillText(`-${scoreBreakdown.damagePenalty}`, rightX, y);
        y += lineHeight + 10;

        // Divider
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(leftX, y);
        ctx.lineTo(rightX, y);
        ctx.stroke();
        y += 25;

        // Final score
        ctx.fillStyle = '#f4d03f';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('FINAL SCORE: ' + scoreBreakdown.finalScore, GAME_WIDTH / 2, y);

        // Buttons
        this.renderButton(ctx, 'restart', GAME_WIDTH / 2 - 220, GAME_HEIGHT - 80, 200, 50, 'PLAY AGAIN', onRestart);
        this.renderButton(ctx, 'menu', GAME_WIDTH / 2 + 20, GAME_HEIGHT - 80, 200, 50, 'MENU', onMenu);
    },

    // Render lose screen with detailed score breakdown
    renderLose(ctx, score, eggsCollected, scoreBreakdown, onRestart, onMenu) {
        this.buttons = [];

        // Background overlay
        ctx.fillStyle = 'rgba(50, 0, 0, 0.92)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Defeat text
        ctx.fillStyle = COLORS.DANGER_BAR;
        ctx.font = 'bold 52px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('💀 DEFEAT 💀', GAME_WIDTH / 2, 70);

        // Main stats panel
        const panelX = GAME_WIDTH / 2 - 200;
        const panelY = 100;
        const panelWidth = 400;
        const panelHeight = 400;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 16);
        ctx.fill();

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        this.roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 16);
        ctx.stroke();

        // Stats title
        ctx.fillStyle = '#f4d03f';
        ctx.font = 'bold 22px Arial';
        ctx.fillText('📊 SCORE BREAKDOWN', GAME_WIDTH / 2, panelY + 35);

        const stats = scoreBreakdown.stats;
        let y = panelY + 70;
        const lineHeight = 28;
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        const leftX = panelX + 30;
        const rightX = panelX + panelWidth - 30;

        // Bonuses (green)
        ctx.fillStyle = '#22c55e';
        ctx.fillText(`🥚 Eggs Delivered: ${stats.eggsDelivered}`, leftX, y);
        ctx.textAlign = 'right';
        ctx.fillText(`+${scoreBreakdown.deliveryBonus}`, rightX, y);
        y += lineHeight;

        ctx.textAlign = 'left';
        ctx.fillText(`⚡ Fast Deliveries: ${stats.fastDeliveries}`, leftX, y);
        ctx.textAlign = 'right';
        ctx.fillText(`+${scoreBreakdown.speedBonus}`, rightX, y);
        y += lineHeight;

        ctx.textAlign = 'left';
        ctx.fillText(`🔧 Nests Repaired: ${stats.nestsRepaired}`, leftX, y);
        ctx.textAlign = 'right';
        ctx.fillText(`+${scoreBreakdown.repairBonus}`, rightX, y);
        y += lineHeight;

        ctx.textAlign = 'left';
        ctx.fillText(`👻 Invaders Scared: ${stats.invadersScared}`, leftX, y);
        ctx.textAlign = 'right';
        ctx.fillText(`+${scoreBreakdown.scareBonus}`, rightX, y);
        y += lineHeight;

        ctx.textAlign = 'left';
        ctx.fillText(`⭐ Power-ups: ${stats.powerUpsCollected}`, leftX, y);
        ctx.textAlign = 'right';
        ctx.fillText(`+${scoreBreakdown.powerUpBonus}`, rightX, y);
        y += lineHeight;

        ctx.textAlign = 'left';
        ctx.fillText(`⏱️ Time Survived (${this.formatTime(scoreBreakdown.gameTime)})`, leftX, y);
        ctx.textAlign = 'right';
        ctx.fillText(`+${scoreBreakdown.timeBonus}`, rightX, y);
        y += lineHeight + 5;

        // Penalties (red)
        ctx.fillStyle = '#ef4444';
        ctx.textAlign = 'left';
        ctx.fillText(`💔 Eggs Lost: ${stats.eggsLost}`, leftX, y);
        ctx.textAlign = 'right';
        ctx.fillText(`-${scoreBreakdown.eggsLostPenalty}`, rightX, y);
        y += lineHeight;

        ctx.textAlign = 'left';
        ctx.fillText(`😰 Eggs Dropped: ${stats.eggsDropped}`, leftX, y);
        ctx.textAlign = 'right';
        ctx.fillText(`-${scoreBreakdown.droppedPenalty}`, rightX, y);
        y += lineHeight;

        ctx.textAlign = 'left';
        ctx.fillText(`🔥 Nest Damage Taken`, leftX, y);
        ctx.textAlign = 'right';
        ctx.fillText(`-${scoreBreakdown.damagePenalty}`, rightX, y);
        y += lineHeight + 10;

        // Divider
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(leftX, y);
        ctx.lineTo(rightX, y);
        ctx.stroke();
        y += 25;

        // Final score
        ctx.fillStyle = '#f4d03f';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SCORE: ' + scoreBreakdown.finalScore, GAME_WIDTH / 2, y);

        // Buttons
        this.renderButton(ctx, 'restart', GAME_WIDTH / 2 - 220, GAME_HEIGHT - 80, 200, 50, 'TRY AGAIN', onRestart);
        this.renderButton(ctx, 'menu', GAME_WIDTH / 2 + 20, GAME_HEIGHT - 80, 200, 50, 'MENU', onMenu);
    },

    // Format time in mm:ss
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    // Helper: Render standard button
    renderButton(ctx, id, x, y, width, height, text, callback) {
        const isHovered = this.hoveredButton === id;

        this.buttons.push({ id, x, y, width, height, callback });

        ctx.fillStyle = isHovered ? COLORS.BUTTON_HOVER : COLORS.BUTTON;
        this.roundRect(ctx, x, y, width, height, 8);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        this.roundRect(ctx, x, y, width, height, 8);
        ctx.stroke();

        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, x + width / 2, y + height / 2 + 7);
    },

    // Helper: Render selection button (1/2 player)
    renderSelectionButton(ctx, id, x, y, width, height, text, selected, callback) {
        const isHovered = this.hoveredButton === id;

        this.buttons.push({ id, x, y, width, height, callback });

        // Background
        if (selected) {
            ctx.fillStyle = 'rgba(79, 70, 229, 0.8)';
        } else {
            ctx.fillStyle = isHovered ? 'rgba(79, 70, 229, 0.5)' : 'rgba(50, 50, 70, 0.7)';
        }
        this.roundRect(ctx, x, y, width, height, 12);
        ctx.fill();

        // Border
        ctx.strokeStyle = selected ? '#00ff88' : 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = selected ? 3 : 2;
        this.roundRect(ctx, x, y, width, height, 12);
        ctx.stroke();

        // Text at bottom
        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, x + width / 2, y + height - 20);
    },

    // Helper: Render level button
    renderLevelButton(ctx, id, x, y, width, height, name, color, icon, selected, callback) {
        const isHovered = this.hoveredButton === id;

        this.buttons.push({ id, x, y, width, height, callback });

        // Background with level color hint
        const bgColor = selected ? color : (isHovered ? 'rgba(79, 70, 229, 0.5)' : 'rgba(50, 50, 70, 0.7)');
        ctx.fillStyle = bgColor;
        this.roundRect(ctx, x, y, width, height, 12);
        ctx.fill();

        // Color preview bar
        ctx.fillStyle = color;
        ctx.fillRect(x + 10, y + 10, width - 20, 40);

        // Border
        ctx.strokeStyle = selected ? '#00ff88' : 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = selected ? 3 : 2;
        this.roundRect(ctx, x, y, width, height, 12);
        ctx.stroke();

        // Icon
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(icon, x + width / 2, y + 90);

        // Name
        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.font = 'bold 16px Arial';
        ctx.fillText(name, x + width / 2, y + height - 15);
    },

    // Helper: Render difficulty button
    renderDifficultyButton(ctx, id, x, y, width, height, name, color, desc, eggs, selected, callback) {
        const isHovered = this.hoveredButton === id;

        this.buttons.push({ id, x, y, width, height, callback });

        // Background
        if (selected) {
            ctx.fillStyle = color + '99';
        } else {
            ctx.fillStyle = isHovered ? 'rgba(79, 70, 229, 0.5)' : 'rgba(50, 50, 70, 0.7)';
        }
        this.roundRect(ctx, x, y, width, height, 12);
        ctx.fill();

        // Border
        ctx.strokeStyle = selected ? color : 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = selected ? 3 : 2;
        this.roundRect(ctx, x, y, width, height, 12);
        ctx.stroke();

        // Name
        ctx.fillStyle = color;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(name, x + width / 2, y + 35);

        // Description
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '14px Arial';
        ctx.fillText(desc, x + width / 2, y + 65);

        // Eggs requirement
        ctx.fillStyle = '#f4d03f';
        ctx.font = '13px Arial';
        ctx.fillText(eggs, x + width / 2, y + 95);
    },

    // Render name entry screen
    renderNameEntry(ctx, scoreBreakdown, isWin, onSubmit, onSkip) {
        this.buttons = [];
        this.menuAnimTime += 0.016;
        this.cursorBlink += 0.016;
        this.nameEntryCallback = onSubmit;

        // Epic background
        this.renderEpicBackground(ctx);

        // Overlay
        ctx.fillStyle = isWin ? 'rgba(0, 50, 0, 0.92)' : 'rgba(50, 0, 0, 0.92)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Title
        ctx.fillStyle = isWin ? '#22c55e' : '#ef4444';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(isWin ? 'NEW HIGH SCORE!' : 'GAME OVER', GAME_WIDTH / 2, 55);

        // Score display
        ctx.fillStyle = '#f4d03f';
        ctx.font = 'bold 28px Arial';
        ctx.fillText('SCORE: ' + scoreBreakdown.finalScore, GAME_WIDTH / 2, 95);

        // Name entry panel - enlarged to fit keyboard
        const panelX = GAME_WIDTH / 2 - 280;
        const panelY = 115;
        const panelWidth = 560;
        const panelHeight = 410;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 16);
        ctx.fill();

        ctx.strokeStyle = isWin ? '#22c55e' : '#ef4444';
        ctx.lineWidth = 3;
        this.roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 16);
        ctx.stroke();

        // Instructions
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = '20px Arial';
        ctx.fillText('Enter your name for the leaderboard', GAME_WIDTH / 2, panelY + 35);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '14px Arial';
        ctx.fillText('Max 10 characters (A-Z, 0-9)', GAME_WIDTH / 2, panelY + 58);

        // Name input box
        const inputX = GAME_WIDTH / 2 - 160;
        const inputY = panelY + 75;
        const inputWidth = 320;
        const inputHeight = 50;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.roundRect(ctx, inputX, inputY, inputWidth, inputHeight, 8);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        this.roundRect(ctx, inputX, inputY, inputWidth, inputHeight, 8);
        ctx.stroke();

        // Entered name with cursor
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px monospace';
        const displayName = this.enteredName + (Math.floor(this.cursorBlink * 2) % 2 === 0 ? '_' : ' ');
        ctx.fillText(displayName, GAME_WIDTH / 2, inputY + 35);

        // Character count
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '12px Arial';
        ctx.fillText(this.enteredName.length + '/10', GAME_WIDTH / 2 + 135, inputY + 38);

        // On-screen keyboard for touch devices
        this.renderOnScreenKeyboard(ctx, panelX + 25, inputY + 65, panelWidth - 50, onSubmit);

        // Skip button
        this.renderButton(ctx, 'skip', GAME_WIDTH / 2 - 80, panelY + panelHeight - 50, 160, 38, 'SKIP', onSkip);

        // Hint
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '13px Arial';
        ctx.fillText('Press ENTER to submit or use keyboard to type', GAME_WIDTH / 2, GAME_HEIGHT - 20);
    },

    // On-screen keyboard for touch devices
    renderOnScreenKeyboard(ctx, x, y, width, onSubmit) {
        const rows = [
            'QWERTYUIOP',
            'ASDFGHJKL',
            'ZXCVBNM'
        ];
        const keyWidth = 38;
        const keyHeight = 36;
        const keySpacing = 4;

        rows.forEach((row, rowIdx) => {
            const rowWidth = row.length * (keyWidth + keySpacing) - keySpacing;
            const rowX = x + (width - rowWidth) / 2;
            const rowY = y + rowIdx * (keyHeight + keySpacing);

            for (let i = 0; i < row.length; i++) {
                const char = row[i];
                const keyX = rowX + i * (keyWidth + keySpacing);
                const keyId = 'key_' + char;
                const isHovered = this.hoveredButton === keyId;

                this.buttons.push({
                    id: keyId,
                    x: keyX,
                    y: rowY,
                    width: keyWidth,
                    height: keyHeight,
                    callback: () => {
                        if (this.enteredName.length < 10) {
                            this.enteredName += char;
                            if (typeof Audio !== 'undefined' && Audio.playMenuSelect) {
                                Audio.playMenuSelect();
                            }
                        }
                    }
                });

                // Key background
                ctx.fillStyle = isHovered ? 'rgba(79, 70, 229, 0.8)' : 'rgba(60, 60, 80, 0.8)';
                this.roundRect(ctx, keyX, rowY, keyWidth, keyHeight, 6);
                ctx.fill();

                // Key border
                ctx.strokeStyle = isHovered ? '#6366f1' : 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 1;
                this.roundRect(ctx, keyX, rowY, keyWidth, keyHeight, 6);
                ctx.stroke();

                // Key label
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(char, keyX + keyWidth / 2, rowY + keyHeight / 2 + 6);
            }
        });

        // Bottom row: numbers, backspace, enter
        const bottomY = y + 3 * (keyHeight + keySpacing);

        // Number keys (0-9)
        const numRow = '1234567890';
        const numKeyWidth = 32;
        const numRowWidth = numRow.length * (numKeyWidth + keySpacing) - keySpacing;
        const numRowX = x + (width - numRowWidth - 140) / 2; // Leave space for backspace/enter

        for (let i = 0; i < numRow.length; i++) {
            const char = numRow[i];
            const keyX = numRowX + i * (numKeyWidth + keySpacing);
            const keyId = 'key_' + char;
            const isHovered = this.hoveredButton === keyId;

            this.buttons.push({
                id: keyId,
                x: keyX,
                y: bottomY,
                width: numKeyWidth,
                height: keyHeight,
                callback: () => {
                    if (this.enteredName.length < 10) {
                        this.enteredName += char;
                        if (typeof Audio !== 'undefined' && Audio.playMenuSelect) {
                            Audio.playMenuSelect();
                        }
                    }
                }
            });

            ctx.fillStyle = isHovered ? 'rgba(79, 70, 229, 0.8)' : 'rgba(60, 60, 80, 0.8)';
            this.roundRect(ctx, keyX, bottomY, numKeyWidth, keyHeight, 6);
            ctx.fill();

            ctx.strokeStyle = isHovered ? '#6366f1' : 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            this.roundRect(ctx, keyX, bottomY, numKeyWidth, keyHeight, 6);
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(char, keyX + numKeyWidth / 2, bottomY + keyHeight / 2 + 5);
        }

        // Backspace key
        const bkspX = numRowX + numRowWidth + keySpacing + 5;
        const bkspWidth = 60;
        const bkspHovered = this.hoveredButton === 'key_backspace';

        this.buttons.push({
            id: 'key_backspace',
            x: bkspX,
            y: bottomY,
            width: bkspWidth,
            height: keyHeight,
            callback: () => {
                this.enteredName = this.enteredName.slice(0, -1);
                if (typeof Audio !== 'undefined' && Audio.playMenuSelect) {
                    Audio.playMenuSelect();
                }
            }
        });

        ctx.fillStyle = bkspHovered ? 'rgba(239, 68, 68, 0.8)' : 'rgba(100, 50, 50, 0.8)';
        this.roundRect(ctx, bkspX, bottomY, bkspWidth, keyHeight, 6);
        ctx.fill();

        ctx.strokeStyle = bkspHovered ? '#ef4444' : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        this.roundRect(ctx, bkspX, bottomY, bkspWidth, keyHeight, 6);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('DEL', bkspX + bkspWidth / 2, bottomY + keyHeight / 2 + 4);

        // Enter key
        const enterX = bkspX + bkspWidth + keySpacing;
        const enterWidth = 60;
        const enterHovered = this.hoveredButton === 'key_enter';

        this.buttons.push({
            id: 'key_enter',
            x: enterX,
            y: bottomY,
            width: enterWidth,
            height: keyHeight,
            callback: () => {
                if (this.enteredName.length > 0 && onSubmit) {
                    onSubmit(this.enteredName);
                }
            }
        });

        ctx.fillStyle = enterHovered ? 'rgba(34, 197, 94, 0.8)' : 'rgba(50, 100, 50, 0.8)';
        this.roundRect(ctx, enterX, bottomY, enterWidth, keyHeight, 6);
        ctx.fill();

        ctx.strokeStyle = enterHovered ? '#22c55e' : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        this.roundRect(ctx, enterX, bottomY, enterWidth, keyHeight, 6);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('OK', enterX + enterWidth / 2, bottomY + keyHeight / 2 + 4);
    },

    // Render highscores display screen
    renderHighscores(ctx, onBack) {
        this.buttons = [];
        this.menuAnimTime += 0.016;

        // Epic background
        this.renderEpicBackground(ctx);

        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Title with trophy
        ctx.save();
        ctx.shadowColor = '#f4d03f';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#f4d03f';
        ctx.font = 'bold 42px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('HALL OF FAME', GAME_WIDTH / 2, 70);
        ctx.shadowBlur = 0;
        ctx.restore();

        // Back button
        this.renderButton(ctx, 'back', 30, 30, 100, 40, '← BACK', onBack);

        // Get highscores
        const scores = Highscores.getAll();

        // Leaderboard panel
        const panelX = GAME_WIDTH / 2 - 350;
        const panelY = 100;
        const panelWidth = 700;
        const panelHeight = 520;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 16);
        ctx.fill();

        ctx.strokeStyle = '#f4d03f';
        ctx.lineWidth = 2;
        this.roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 16);
        ctx.stroke();

        // Column headers
        const headerY = panelY + 40;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('RANK', panelX + 30, headerY);
        ctx.fillText('NAME', panelX + 100, headerY);
        ctx.fillText('SCORE', panelX + 260, headerY);
        ctx.fillText('LEVEL', panelX + 380, headerY);
        ctx.fillText('DIFF', panelX + 490, headerY);
        ctx.fillText('DATE', panelX + 590, headerY);

        // Divider line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(panelX + 20, headerY + 15);
        ctx.lineTo(panelX + panelWidth - 20, headerY + 15);
        ctx.stroke();

        if (scores.length === 0) {
            // No scores yet
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No highscores yet!', GAME_WIDTH / 2, panelY + 200);
            ctx.font = '18px Arial';
            ctx.fillText('Play a game to set the first record!', GAME_WIDTH / 2, panelY + 240);
        } else {
            // Display scores
            const rowHeight = 44;
            scores.forEach((entry, index) => {
                const rowY = headerY + 35 + index * rowHeight;
                const isTopThree = index < 3;

                // Row background for top 3
                if (isTopThree) {
                    const colors = ['rgba(255, 215, 0, 0.15)', 'rgba(192, 192, 192, 0.12)', 'rgba(205, 127, 50, 0.1)'];
                    ctx.fillStyle = colors[index];
                    this.roundRect(ctx, panelX + 15, rowY - 15, panelWidth - 30, rowHeight - 4, 6);
                    ctx.fill();
                }

                // Rank with medal for top 3
                ctx.textAlign = 'left';
                if (isTopThree) {
                    const medals = ['#FFD700', '#C0C0C0', '#CD7F32'];
                    ctx.fillStyle = medals[index];
                    ctx.font = 'bold 20px Arial';
                    const rankSymbols = ['1st', '2nd', '3rd'];
                    ctx.fillText(rankSymbols[index], panelX + 30, rowY + 8);
                } else {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                    ctx.font = '18px Arial';
                    ctx.fillText((index + 1) + '.', panelX + 35, rowY + 8);
                }

                // Name
                ctx.fillStyle = isTopThree ? '#ffffff' : 'rgba(255, 255, 255, 0.9)';
                ctx.font = isTopThree ? 'bold 18px Arial' : '18px Arial';
                ctx.fillText(entry.name, panelX + 100, rowY + 8);

                // Score
                ctx.fillStyle = '#f4d03f';
                ctx.font = 'bold 18px Arial';
                ctx.fillText(entry.score.toLocaleString(), panelX + 260, rowY + 8);

                // Level
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.font = '16px Arial';
                const levelNames = { mountain: 'Mountain', beach: 'Beach', forest: 'Forest', cave: 'Cave' };
                ctx.fillText(levelNames[entry.level] || entry.level, panelX + 380, rowY + 8);

                // Difficulty with color
                const diffColors = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' };
                ctx.fillStyle = diffColors[entry.difficulty] || '#ffffff';
                ctx.font = 'bold 14px Arial';
                ctx.fillText((entry.difficulty || 'N/A').toUpperCase(), panelX + 490, rowY + 8);

                // Date
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.font = '14px Arial';
                ctx.fillText(Highscores.formatDate(entry.date), panelX + 590, rowY + 8);
            });
        }

        // Footer hint
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Scores are saved locally on this device', GAME_WIDTH / 2, GAME_HEIGHT - 25);

        // Music toggle button
        this.renderMusicToggle(ctx);
    },

    // Reset name entry state
    resetNameEntry() {
        this.enteredName = '';
        this.pendingScore = null;
        this.cursorBlink = 0;
        this.nameEntryCallback = null;
    },

    // Render music toggle button (bottom right corner)
    renderMusicToggle(ctx) {
        const btnX = GAME_WIDTH - 55;
        const btnY = GAME_HEIGHT - 55;
        const btnSize = 40;
        const isEnabled = typeof Audio !== 'undefined' && Audio.isMusicEnabled ? Audio.isMusicEnabled() : true;
        const isHovered = this.hoveredButton === 'musicToggle';

        this.buttons.push({
            id: 'musicToggle',
            x: btnX,
            y: btnY,
            width: btnSize,
            height: btnSize,
            callback: () => {
                if (typeof Audio !== 'undefined') {
                    // Resume audio context if suspended (requires user interaction)
                    if (Audio.context && Audio.context.state === 'suspended') {
                        Audio.context.resume().then(() => {
                            if (Audio.toggleMusic) {
                                const nowEnabled = Audio.toggleMusic();
                                if (nowEnabled && Audio.startMenuMusic) {
                                    Audio.startMenuMusic();
                                }
                            }
                        });
                    } else if (Audio.toggleMusic) {
                        const nowEnabled = Audio.toggleMusic();
                        // Restart menu music if we just enabled it
                        if (nowEnabled && Audio.startMenuMusic) {
                            Audio.startMenuMusic();
                        }
                    }
                }
            }
        });

        // Button background
        ctx.fillStyle = isHovered ? 'rgba(79, 70, 229, 0.8)' : 'rgba(40, 40, 60, 0.8)';
        this.roundRect(ctx, btnX, btnY, btnSize, btnSize, 8);
        ctx.fill();

        // Button border
        ctx.strokeStyle = isHovered ? '#6366f1' : 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        this.roundRect(ctx, btnX, btnY, btnSize, btnSize, 8);
        ctx.stroke();

        // Music icon - speaker or muted
        ctx.fillStyle = isEnabled ? '#22c55e' : '#ef4444';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(isEnabled ? '♪' : '✕', btnX + btnSize / 2, btnY + btnSize / 2 + 7);

        // Small label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '9px Arial';
        ctx.fillText(isEnabled ? 'ON' : 'OFF', btnX + btnSize / 2, btnY + btnSize - 4);
    },

    // Helper: Draw rounded rectangle path
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
