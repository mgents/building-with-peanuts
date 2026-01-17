// ===========================================
// MAIN GAME LOOP - Dragon Nest Defender
// ===========================================

const Game = {
    // Game state
    state: GAME_STATES.MENU,

    // Entities
    dragon: null,
    nests: [],
    eggs: [],
    invaders: [],
    powerUp: null,

    // Active power-up effects
    activePowerUp: null,
    activePowerUpEndTime: 0,

    // Score
    score: 0,

    // Timing
    lastTime: 0,

    // Background - pre-generated static elements
    bgGenerated: false,
    bgRocks: [],
    bgGrassTufts: [],
    bgWaterSparkles: [],

    // Animation timer (for subtle animations only)
    animTime: 0,

    init() {
        // Generate static background elements once
        this.generateBackground();

        // Initialize input system
        Input.init();

        // Initialize screens
        Screens.init();

        // iOS audio unlock
        this.setupAudioUnlock();

        // Start game loop
        requestAnimationFrame((t) => this.loop(t));
    },

    generateBackground() {
        // Pre-generate rock positions with fixed random values
        const seed = 12345;
        let rng = seed;
        const seededRandom = () => {
            rng = (rng * 1103515245 + 12345) & 0x7fffffff;
            return rng / 0x7fffffff;
        };

        // Generate rocks
        this.bgRocks = [];
        const rockCount = 12;
        for (let i = 0; i < rockCount; i++) {
            this.bgRocks.push({
                x: 100 + seededRandom() * (GAME_WIDTH - 200),
                y: 100 + seededRandom() * (GAME_HEIGHT - 200),
                size: 6 + seededRandom() * 8,
                shade: Math.floor(seededRandom() * 3)
            });
        }

        // Generate grass tufts
        this.bgGrassTufts = [];
        const grassCount = 25;
        for (let i = 0; i < grassCount; i++) {
            this.bgGrassTufts.push({
                x: 100 + seededRandom() * (GAME_WIDTH - 200),
                y: 100 + seededRandom() * (GAME_HEIGHT - 200),
                height: 6 + seededRandom() * 6
            });
        }

        // Generate water sparkle positions
        this.bgWaterSparkles = [];
        for (let i = 0; i < 20; i++) {
            const side = Math.floor(seededRandom() * 4);
            let x, y;
            switch (side) {
                case 0: x = seededRandom() * 45; y = seededRandom() * GAME_HEIGHT; break;
                case 1: x = GAME_WIDTH - seededRandom() * 45; y = seededRandom() * GAME_HEIGHT; break;
                case 2: x = seededRandom() * GAME_WIDTH; y = seededRandom() * 45; break;
                case 3: x = seededRandom() * GAME_WIDTH; y = GAME_HEIGHT - seededRandom() * 45; break;
            }
            this.bgWaterSparkles.push({ x, y, phase: seededRandom() * Math.PI * 2 });
        }

        this.bgGenerated = true;
    },

    setupAudioUnlock() {
        let audioUnlocked = false;

        const unlock = () => {
            if (audioUnlocked) return;
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const buffer = audioCtx.createBuffer(1, 1, 22050);
            const source = audioCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(audioCtx.destination);
            source.start(0);
            audioUnlocked = true;
        };

        canvas.addEventListener('touchstart', unlock, { once: true });
        canvas.addEventListener('click', unlock, { once: true });
    },

    startGame() {
        Meters.reset();
        Spawner.reset();
        this.score = 0;
        this.powerUp = null;
        this.activePowerUp = null;
        this.activePowerUpEndTime = 0;

        this.dragon = new Dragon(GAME_WIDTH / 2, GAME_HEIGHT / 2);

        this.nests = [
            new Nest(GAME_WIDTH * 0.25, GAME_HEIGHT * 0.35),
            new Nest(GAME_WIDTH * 0.75, GAME_HEIGHT * 0.35),
            new Nest(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.7)
        ];

        this.eggs = [];
        this.invaders = [];
        this.eggs.push(Spawner.spawnEgg(this.nests));
        this.state = GAME_STATES.PLAYING;
    },

    loop(currentTime) {
        const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;

        // Simple animation timer
        this.animTime += dt;

        this.update(dt);
        this.render();

        requestAnimationFrame((t) => this.loop(t));
    },

    update(dt) {
        if (this.state !== GAME_STATES.PLAYING) return;

        Input.update();
        this.updatePowerUpEffects();
        this.dragon.update(dt, Input.movement);

        for (let i = this.eggs.length - 1; i >= 0; i--) {
            const egg = this.eggs[i];
            const cracked = egg.update(dt);
            if (cracked) {
                Meters.onEggCrack();
                this.eggs.splice(i, 1);
            }
        }

        for (const invader of this.invaders) {
            invader.update(dt, this.nests, { x: this.dragon.x, y: this.dragon.y });
        }

        if (this.powerUp) {
            this.powerUp.update(dt);
        }

        Collision.applySoftRepulsion(this.invaders);
        this.processCollisions(dt);

        const phase = Meters.getCurrentPhase();
        const newEntities = Spawner.update(this.eggs, this.invaders, this.nests, phase);

        for (const egg of newEntities.eggs) {
            this.eggs.push(egg);
        }
        for (const invader of newEntities.invaders) {
            this.invaders.push(invader);
        }

        if (Meters.checkWin()) {
            this.state = GAME_STATES.WIN;
        } else if (Meters.checkLose()) {
            this.state = GAME_STATES.LOSE;
        }
    },

    updatePowerUpEffects() {
        const now = Date.now();

        if (this.activePowerUp === POWERUP_TYPES.NEST_SHIELD && now > this.activePowerUpEndTime) {
            for (const nest of this.nests) {
                nest.shielded = false;
            }
            this.activePowerUp = null;
        }

        if (this.activePowerUp === POWERUP_TYPES.WING_BOOST && now > this.activePowerUpEndTime) {
            this.activePowerUp = null;
        }
    },

    processCollisions(dt) {
        const pickedEgg = Collision.checkDragonEggPickup(this.dragon, this.eggs);
        if (pickedEgg) {
            this.dragon.pickupEgg(pickedEgg.id);
            const idx = this.eggs.indexOf(pickedEgg);
            if (idx >= 0) this.eggs.splice(idx, 1);
        }

        const overlappingNest = Collision.checkDragonNestOverlap(this.dragon, this.nests);
        if (overlappingNest) {
            if (this.dragon.carrying !== null) {
                this.dragon.dropEgg();
                overlappingNest.addEgg();
                Meters.onEggDelivered();
                this.score += 10;

                if (Spawner.trackSuccessfulAction() && !this.powerUp) {
                    this.powerUp = Spawner.spawnPowerUp(this.nests, this.dragon);
                }
            }

            if (overlappingNest.health < NEST_MAX_HEALTH) {
                const crossedToHealthy = overlappingNest.repair(NEST_REPAIR_PER_SEC * dt);
                if (crossedToHealthy) {
                    Meters.onRepairToHealthy();
                    this.score += 15;

                    if (Spawner.trackSuccessfulAction() && !this.powerUp) {
                        this.powerUp = Spawner.spawnPowerUp(this.nests, this.dragon);
                    }
                }
            }
        }

        const scaredInvaders = Collision.checkDragonInvaderCollisions(this.dragon, this.invaders);
        for (const invader of scaredInvaders) {
            const giveBonus = invader.scare(this.dragon.x, this.dragon.y);
            if (giveBonus) {
                Meters.onScare();
                this.score += 5;

                if (Spawner.trackSuccessfulAction() && !this.powerUp) {
                    this.powerUp = Spawner.spawnPowerUp(this.nests, this.dragon);
                }
            }

            if (this.dragon.carrying !== null) {
                const droppedEggId = this.dragon.dropEgg();
                const droppedEgg = new Egg(this.dragon.x, this.dragon.y, droppedEggId);
                droppedEgg.setDropped();
                this.eggs.push(droppedEgg);
                Meters.onEggDrop();
            }
        }

        if (Collision.checkDragonPowerUpPickup(this.dragon, this.powerUp)) {
            this.collectPowerUp(this.powerUp);
            this.powerUp = null;
        }

        let harassingCount = 0;
        for (const invader of this.invaders) {
            if (invader.state === INVADER_STATES.HARASS && invader.targetNest) {
                const nest = invader.targetNest;
                if (Collision.checkInvaderNestOverlap(invader, nest)) {
                    nest.takeDamage(NEST_DAMAGE_PER_SEC * dt);
                    harassingCount++;
                }
            }
        }

        if (harassingCount > 0) {
            Meters.onHarass(dt, harassingCount);
        }
    },

    collectPowerUp(powerUp) {
        this.activePowerUp = powerUp.type;

        switch (powerUp.type) {
            case POWERUP_TYPES.WING_BOOST:
                this.dragon.activateSpeedBoost();
                this.activePowerUpEndTime = Date.now() + WING_BOOST_DURATION;
                break;

            case POWERUP_TYPES.BIG_SCARE:
                for (const invader of this.invaders) {
                    invader.scare(this.dragon.x, this.dragon.y);
                }
                this.activePowerUp = null;
                break;

            case POWERUP_TYPES.NEST_SHIELD:
                for (const nest of this.nests) {
                    nest.shielded = true;
                }
                this.activePowerUpEndTime = Date.now() + NEST_SHIELD_DURATION;
                break;
        }

        this.score += 20;
    },

    render() {
        // Draw retro-style background
        this.renderRetroBackground();

        switch (this.state) {
            case GAME_STATES.MENU:
                Screens.renderMenu(ctx,
                    () => this.startGame(),
                    () => this.state = GAME_STATES.INSTRUCTIONS
                );
                break;

            case GAME_STATES.INSTRUCTIONS:
                Screens.renderInstructions(ctx,
                    () => this.startGame()
                );
                break;

            case GAME_STATES.PLAYING:
                this.renderGameplay();
                break;

            case GAME_STATES.WIN:
                this.renderGameplay();
                Screens.renderWin(ctx, this.score,
                    () => this.startGame(),
                    () => this.state = GAME_STATES.MENU
                );
                break;

            case GAME_STATES.LOSE:
                this.renderGameplay();
                Screens.renderLose(ctx, this.score,
                    () => this.startGame(),
                    () => this.state = GAME_STATES.MENU
                );
                break;
        }
    },

    renderRetroBackground() {
        // === SKY (solid retro colors) ===
        ctx.fillStyle = '#5c94fc';  // Classic NES sky blue
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // === OCEAN WATER (borders) ===
        this.renderRetroWater();

        // === CLIFF EDGES ===
        this.renderRetroCliffs();

        // === MAIN PLAY AREA (grass) ===
        this.renderRetroGrass();

        // === DECORATIONS ===
        this.renderRetroDecorations();
    },

    renderRetroWater() {
        // Deep water color
        ctx.fillStyle = '#1e3a5f';
        ctx.fillRect(0, 0, 55, GAME_HEIGHT);                    // Left
        ctx.fillRect(GAME_WIDTH - 55, 0, 55, GAME_HEIGHT);      // Right
        ctx.fillRect(0, 0, GAME_WIDTH, 55);                     // Top
        ctx.fillRect(0, GAME_HEIGHT - 55, GAME_WIDTH, 55);      // Bottom

        // Lighter water layer
        ctx.fillStyle = '#2e5a8f';
        ctx.fillRect(0, 0, 50, GAME_HEIGHT);
        ctx.fillRect(GAME_WIDTH - 50, 0, 50, GAME_HEIGHT);
        ctx.fillRect(0, 0, GAME_WIDTH, 50);
        ctx.fillRect(0, GAME_HEIGHT - 50, GAME_WIDTH, 50);

        // Animated wave lines (simple pixel style)
        const wavePhase = Math.floor(this.animTime * 3) % 4;
        ctx.fillStyle = '#4a8ad4';

        // Left waves
        for (let y = 10; y < GAME_HEIGHT - 10; y += 20) {
            const offset = ((y + wavePhase * 5) % 20) < 10 ? 2 : 0;
            ctx.fillRect(45 + offset, y, 4, 8);
        }

        // Right waves
        for (let y = 15; y < GAME_HEIGHT - 10; y += 20) {
            const offset = ((y + wavePhase * 5) % 20) < 10 ? -2 : 0;
            ctx.fillRect(GAME_WIDTH - 49 + offset, y, 4, 8);
        }

        // Top waves
        for (let x = 60; x < GAME_WIDTH - 60; x += 25) {
            const offset = ((x + wavePhase * 5) % 25) < 12 ? 2 : 0;
            ctx.fillRect(x, 45 + offset, 12, 4);
        }

        // Bottom waves
        for (let x = 70; x < GAME_WIDTH - 60; x += 25) {
            const offset = ((x + wavePhase * 5) % 25) < 12 ? -2 : 0;
            ctx.fillRect(x, GAME_HEIGHT - 49 + offset, 12, 4);
        }

        // Water sparkles (subtle animation)
        ctx.fillStyle = '#8ac4ff';
        for (const sparkle of this.bgWaterSparkles) {
            const visible = Math.sin(this.animTime * 2 + sparkle.phase) > 0.5;
            if (visible) {
                ctx.fillRect(Math.floor(sparkle.x), Math.floor(sparkle.y), 3, 3);
            }
        }
    },

    renderRetroCliffs() {
        // Main cliff color (dark grey/brown rock)
        ctx.fillStyle = '#5a4a3a';

        // Left cliff
        ctx.fillRect(50, 0, 25, GAME_HEIGHT);

        // Right cliff
        ctx.fillRect(GAME_WIDTH - 75, 0, 25, GAME_HEIGHT);

        // Top cliff
        ctx.fillRect(0, 50, GAME_WIDTH, 25);

        // Bottom cliff
        ctx.fillRect(0, GAME_HEIGHT - 75, GAME_WIDTH, 25);

        // Cliff highlights (lighter rock)
        ctx.fillStyle = '#7a6a5a';

        // Left highlight blocks
        for (let y = 20; y < GAME_HEIGHT - 20; y += 40) {
            ctx.fillRect(55, y, 8, 15);
        }

        // Right highlight blocks
        for (let y = 35; y < GAME_HEIGHT - 20; y += 40) {
            ctx.fillRect(GAME_WIDTH - 63, y, 8, 15);
        }

        // Top highlight blocks
        for (let x = 80; x < GAME_WIDTH - 80; x += 50) {
            ctx.fillRect(x, 55, 20, 8);
        }

        // Bottom highlight blocks
        for (let x = 100; x < GAME_WIDTH - 80; x += 50) {
            ctx.fillRect(x, GAME_HEIGHT - 63, 20, 8);
        }

        // Cliff shadows (darker)
        ctx.fillStyle = '#3a2a1a';

        // Left shadow
        for (let y = 30; y < GAME_HEIGHT - 30; y += 60) {
            ctx.fillRect(68, y, 5, 12);
        }

        // Right shadow
        for (let y = 50; y < GAME_HEIGHT - 30; y += 60) {
            ctx.fillRect(GAME_WIDTH - 73, y, 5, 12);
        }

        // Corner pieces (rounded look with blocks)
        ctx.fillStyle = '#5a4a3a';
        // Top-left corner fill
        ctx.fillRect(50, 50, 25, 25);
        // Top-right corner fill
        ctx.fillRect(GAME_WIDTH - 75, 50, 25, 25);
        // Bottom-left corner fill
        ctx.fillRect(50, GAME_HEIGHT - 75, 25, 25);
        // Bottom-right corner fill
        ctx.fillRect(GAME_WIDTH - 75, GAME_HEIGHT - 75, 25, 25);
    },

    renderRetroGrass() {
        // Main grass area (base green)
        ctx.fillStyle = '#3d8c40';
        ctx.fillRect(75, 75, GAME_WIDTH - 150, GAME_HEIGHT - 150);

        // Grass pattern - checkerboard style for retro feel
        ctx.fillStyle = '#4da050';
        const tileSize = 32;
        for (let x = 75; x < GAME_WIDTH - 75; x += tileSize * 2) {
            for (let y = 75; y < GAME_HEIGHT - 75; y += tileSize * 2) {
                ctx.fillRect(x, y, tileSize, tileSize);
                ctx.fillRect(x + tileSize, y + tileSize, tileSize, tileSize);
            }
        }

        // Darker grass patches
        ctx.fillStyle = '#2d6c30';
        for (let x = 100; x < GAME_WIDTH - 100; x += 80) {
            for (let y = 100; y < GAME_HEIGHT - 100; y += 80) {
                ctx.fillRect(x, y, 16, 16);
            }
        }

        // Border edge (dirt/transition)
        ctx.fillStyle = '#6b5a3a';
        // Top edge
        ctx.fillRect(75, 75, GAME_WIDTH - 150, 6);
        // Bottom edge
        ctx.fillRect(75, GAME_HEIGHT - 81, GAME_WIDTH - 150, 6);
        // Left edge
        ctx.fillRect(75, 75, 6, GAME_HEIGHT - 150);
        // Right edge
        ctx.fillRect(GAME_WIDTH - 81, 75, 6, GAME_HEIGHT - 150);
    },

    renderRetroDecorations() {
        // Rocks (pre-generated positions)
        const rockColors = ['#5a5a5a', '#6a6a6a', '#4a4a4a'];
        for (const rock of this.bgRocks) {
            ctx.fillStyle = rockColors[rock.shade];
            // Pixel-style rock (simple rectangle with highlight)
            const size = Math.floor(rock.size);
            ctx.fillRect(Math.floor(rock.x), Math.floor(rock.y), size, size - 2);

            // Rock highlight
            ctx.fillStyle = '#7a7a7a';
            ctx.fillRect(Math.floor(rock.x), Math.floor(rock.y), size - 2, 3);
        }

        // Grass tufts (pre-generated)
        ctx.fillStyle = '#2d7030';
        for (const tuft of this.bgGrassTufts) {
            const x = Math.floor(tuft.x);
            const y = Math.floor(tuft.y);
            const h = Math.floor(tuft.height);

            // Simple pixel grass blades
            ctx.fillRect(x, y - h, 2, h);
            ctx.fillRect(x + 3, y - h + 2, 2, h - 2);
            ctx.fillRect(x - 2, y - h + 3, 2, h - 3);
        }

        // Small flowers (fixed positions based on grid)
        const flowerColors = ['#ff6b6b', '#ffeb3b', '#ffffff'];
        let flowerIndex = 0;
        for (let x = 150; x < GAME_WIDTH - 150; x += 120) {
            for (let y = 150; y < GAME_HEIGHT - 150; y += 100) {
                ctx.fillStyle = flowerColors[flowerIndex % 3];
                ctx.fillRect(x, y, 4, 4);
                ctx.fillStyle = '#2d7030';
                ctx.fillRect(x + 1, y + 4, 2, 4);
                flowerIndex++;
            }
        }
    },

    renderGameplay() {
        // Render nests
        for (const nest of this.nests) {
            nest.render(ctx);
        }

        // Render eggs
        for (const egg of this.eggs) {
            egg.render(ctx);
        }

        // Render power-up
        if (this.powerUp) {
            this.powerUp.render(ctx);
        }

        // Render invaders
        for (const invader of this.invaders) {
            invader.render(ctx);
        }

        // Render dragon (on top)
        this.dragon.render(ctx);

        // Render joystick
        Joystick.render(ctx);

        // Render HUD
        HUD.render(ctx, Meters.calm, Meters.danger, this.score, this.activePowerUp, this.activePowerUpEndTime);
    }
};

// Start the game when page loads
window.addEventListener('load', () => {
    Game.init();
});
