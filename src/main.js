// ===========================================
// MAIN GAME LOOP - Dragon Nest Defender (v2)
// ===========================================

const Game = {
    // Game state
    state: GAME_STATES.MENU,

    // v2: Game settings
    numPlayers: 1,
    selectedLevel: 'mountain',
    selectedDifficulty: 'medium',

    // Highscore tracking
    lastScoreBreakdown: null,
    wasWin: false,

    // Entities
    dragon: null,
    dragon2: null, // Player 2 dragon
    nests: [],
    eggs: [],
    invaders: [],
    powerUp: null,

    // Active power-up effects
    activePowerUp: null,
    activePowerUpEndTime: 0,

    // Score
    score: 0,

    // v2: Eggs collected (win condition)
    eggsCollected: 0,
    eggsToWin: 50,

    // Timing settings (calculated based on difficulty and player count)
    eggCrackTime: 10000,
    spawnInterval: 10000,

    // Comprehensive scoring statistics
    stats: {
        eggsDelivered: 0,
        eggsLost: 0,              // Eggs that cracked
        eggsDropped: 0,           // Eggs dropped when scared
        totalDeliveryTime: 0,     // Sum of all delivery times (for average)
        fastDeliveries: 0,        // Deliveries under 5 seconds
        nestsRepaired: 0,         // Number of times nest crossed to healthy
        totalDamageTaken: 0,      // Total damage taken by all nests
        invadersScared: 0,        // Total invaders scared away
        powerUpsCollected: 0,     // Power-ups collected
        gameStartTime: 0,         // When game started
        lastEggPickupTime: 0      // For tracking delivery speed
    },

    // Timing
    lastTime: 0,

    // Background - pre-generated static elements (used as fallback)
    bgGenerated: false,
    bgRocks: [],
    bgGrassTufts: [],
    bgWaterSparkles: [],

    // Animation timer (for subtle animations only)
    animTime: 0,

    init() {
        // Generate static background elements once (fallback)
        this.generateBackground();

        // Initialize input system
        Input.init();

        // Initialize audio system
        Audio.init();

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

            // Resume the Audio system's context (the one actually used for sounds)
            // Music will only start when user explicitly clicks the music toggle
            if (Audio.context && Audio.context.state === 'suspended') {
                Audio.context.resume();
            }

            audioUnlocked = true;
        };

        // Use capture phase to ensure we get the event before buttons
        canvas.addEventListener('touchstart', unlock, { capture: true });
        canvas.addEventListener('click', unlock, { capture: true });
        canvas.addEventListener('mousedown', unlock, { capture: true });
    },

    startGame() {
        // Get settings from Screens
        this.numPlayers = Screens.selectedPlayers;
        this.selectedLevel = Screens.selectedLevel;
        this.selectedDifficulty = Screens.selectedDifficulty;

        // Apply difficulty settings - fallback to medium if invalid
        let diff = DIFFICULTY[this.selectedDifficulty];
        if (!diff) {
            console.error('Invalid difficulty:', this.selectedDifficulty, '- falling back to medium');
            this.selectedDifficulty = 'medium';
            diff = DIFFICULTY['medium'];
        }

        // Eggs to win based on player count (25 for 1P, 50 for 2P)
        this.eggsToWin = this.numPlayers === 2 ? EGGS_TO_WIN_2P : EGGS_TO_WIN_1P;

        // Calculate timing based on player count and difficulty
        const baseTimeout = this.numPlayers === 2 ? BASE_TIMEOUT_2P : BASE_TIMEOUT_1P;
        const baseSpawnInterval = this.numPlayers === 2 ? BASE_SPAWN_INTERVAL_2P : BASE_SPAWN_INTERVAL_1P;
        this.eggCrackTime = baseTimeout * diff.eggCrackTimeMultiplier;
        this.spawnInterval = baseSpawnInterval * diff.invaderSpawnMultiplier;

        // Reset systems
        Meters.reset();
        Spawner.reset();
        HUD.reset();
        this.score = 0;
        this.eggsCollected = 0;
        this.powerUp = null;
        this.activePowerUp = null;
        this.activePowerUpEndTime = 0;

        // Reset comprehensive stats
        this.stats = {
            eggsDelivered: 0,
            eggsLost: 0,
            eggsDropped: 0,
            totalDeliveryTime: 0,
            fastDeliveries: 0,
            nestsRepaired: 0,
            totalDamageTaken: 0,
            invadersScared: 0,
            powerUpsCollected: 0,
            gameStartTime: Date.now(),
            lastEggPickupTime: 0
        };

        // Set two-player mode in Input system
        Input.setTwoPlayerMode(this.numPlayers === 2);

        // Load selected level
        Level.load(this.selectedLevel);

        // Create dragon(s)
        if (this.numPlayers === 2) {
            // Two-player: start on opposite sides
            this.dragon = new Dragon(GAME_WIDTH * 0.3, GAME_HEIGHT / 2, 1);
            this.dragon2 = new Dragon(GAME_WIDTH * 0.7, GAME_HEIGHT / 2, 2);
        } else {
            this.dragon = new Dragon(GAME_WIDTH / 2, GAME_HEIGHT / 2, 1);
            this.dragon2 = null;
        }

        // Create nests based on level (positions are stored as ratios)
        const nestPositions = Level.current.nestPositions;
        this.nests = nestPositions.map(pos => new Nest(pos.x * GAME_WIDTH, pos.y * GAME_HEIGHT));

        this.eggs = [];
        this.invaders = [];
        this.eggs.push(Spawner.spawnEgg(this.nests));

        // Play start sound and music
        Audio.resume();
        Audio.playGameStart();
        Audio.startMusic();

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

        // Update player 1 dragon
        this.dragon.update(dt, Input.p1Movement);

        // Update player 2 dragon if in two-player mode
        if (this.dragon2) {
            this.dragon2.update(dt, Input.p2Movement);
        }

        // Get difficulty settings
        const diff = DIFFICULTY[this.selectedDifficulty];

        // Update eggs with the calculated crack time
        for (let i = this.eggs.length - 1; i >= 0; i--) {
            const egg = this.eggs[i];
            const cracked = egg.update(dt, this.eggCrackTime);
            if (cracked) {
                Meters.onEggCrack();
                this.stats.eggsLost++;
                this.score -= 8; // Penalty for losing an egg
                Audio.playEggCrack();
                this.eggs.splice(i, 1);
            }
        }

        // Build dragons array for AI
        const dragons = [this.dragon];
        if (this.dragon2) dragons.push(this.dragon2);

        // v2: Apply speed multiplier from difficulty and update with dragons array
        // Pass all invaders for even nest distribution
        for (const invader of this.invaders) {
            if (!invader.banished) {
                invader.setSpeedMultiplier(diff.invaderSpeedMultiplier);
                invader.update(dt, this.nests, { x: this.dragon.x, y: this.dragon.y }, dragons, this.invaders);
            }
        }

        // Handle banished invaders respawning
        for (let i = this.invaders.length - 1; i >= 0; i--) {
            if (this.invaders[i].shouldRespawn()) {
                // Respawn at edge
                this.invaders.splice(i, 1);
            }
        }

        if (this.powerUp) {
            this.powerUp.update(dt);
            // Remove expired power-ups
            if (this.powerUp.expired) {
                this.powerUp = null;
            }
        }

        Collision.applySoftRepulsion(this.invaders);
        this.processCollisions(dt);

        const phase = Meters.getCurrentPhase();
        const newEntities = Spawner.update(this.eggs, this.invaders, this.nests, phase, this.spawnInterval);

        for (const egg of newEntities.eggs) {
            this.eggs.push(egg);
        }
        for (const invader of newEntities.invaders) {
            invader.setSpeedMultiplier(diff.invaderSpeedMultiplier);
            this.invaders.push(invader);
        }

        // v2: Win condition is based on eggs collected
        if (this.eggsCollected >= this.eggsToWin) {
            this.handleGameEnd(true);
        } else if (Meters.checkLose()) {
            this.handleGameEnd(false);
        }
    },

    handleGameEnd(isWin) {
        this.wasWin = isWin;
        this.lastScoreBreakdown = this.calculateFinalScore();
        Audio.stopMusic();

        if (isWin) {
            Audio.playWin();
        } else {
            Audio.playLose();
        }

        // Check if this score qualifies for the highscore list
        if (Highscores.isHighscore(this.lastScoreBreakdown.finalScore)) {
            // Show name entry screen
            Screens.resetNameEntry();
            this.state = GAME_STATES.NAME_ENTRY;
        } else {
            // Show regular win/lose screen
            this.state = isWin ? GAME_STATES.WIN : GAME_STATES.LOSE;
        }
    },

    async submitHighscore(name) {
        const sb = this.lastScoreBreakdown;
        await Highscores.addScore(
            name,
            sb.finalScore,
            this.selectedDifficulty,
            this.selectedLevel,
            sb.stats.eggsDelivered,
            sb.gameTime
        );

        // Transition to win/lose screen
        this.state = this.wasWin ? GAME_STATES.WIN : GAME_STATES.LOSE;
    },

    skipHighscore() {
        // Skip name entry and go to win/lose screen
        this.state = this.wasWin ? GAME_STATES.WIN : GAME_STATES.LOSE;
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
        // Process collisions for all dragons
        const dragons = [this.dragon];
        if (this.dragon2) dragons.push(this.dragon2);

        for (const dragon of dragons) {
            // Egg pickup
            const pickedEgg = Collision.checkDragonEggPickup(dragon, this.eggs);
            if (pickedEgg) {
                dragon.pickupEgg(pickedEgg.id);
                dragon.eggPickupTime = Date.now(); // Track when egg was picked up
                Audio.playEggPickup();
                const idx = this.eggs.indexOf(pickedEgg);
                if (idx >= 0) this.eggs.splice(idx, 1);
            }

            // Nest overlap (deliver eggs, repair)
            const overlappingNest = Collision.checkDragonNestOverlap(dragon, this.nests);
            if (overlappingNest) {
                if (dragon.carrying !== null) {
                    // Calculate delivery time for scoring
                    const deliveryTime = (Date.now() - (dragon.eggPickupTime || Date.now())) / 1000;
                    const isFastDelivery = deliveryTime < 5; // Under 5 seconds

                    dragon.dropEgg();
                    overlappingNest.addEgg();
                    Meters.onEggDelivered();
                    this.eggsCollected++;
                    this.stats.eggsDelivered++;
                    this.stats.totalDeliveryTime += deliveryTime;

                    // Score based on delivery speed
                    let deliveryScore = 10;
                    if (isFastDelivery) {
                        deliveryScore = 25; // Bonus for fast delivery
                        this.stats.fastDeliveries++;
                    } else if (deliveryTime < 8) {
                        deliveryScore = 15; // Medium speed bonus
                    }
                    this.score += deliveryScore;

                    Audio.playEggDeliver();

                    if (Spawner.trackSuccessfulAction() && !this.powerUp) {
                        this.powerUp = Spawner.spawnPowerUp(this.nests, dragon, this.eggCrackTime);
                        if (this.powerUp) Audio.playPowerUpSpawn();
                    }
                }

                if (overlappingNest.health < NEST_MAX_HEALTH) {
                    const crossedToHealthy = overlappingNest.repair(NEST_REPAIR_PER_SEC * dt);
                    if (crossedToHealthy) {
                        Meters.onRepairToHealthy();
                        this.stats.nestsRepaired++;
                        this.score += 20; // Bonus for fully repairing a nest

                        if (Spawner.trackSuccessfulAction() && !this.powerUp) {
                            this.powerUp = Spawner.spawnPowerUp(this.nests, dragon, this.eggCrackTime);
                            if (this.powerUp) Audio.playPowerUpSpawn();
                        }
                    }
                }
            }

            // Scare invaders
            const scaredInvaders = Collision.checkDragonInvaderCollisions(dragon, this.invaders);
            for (const invader of scaredInvaders) {
                if (invader.banished) continue;

                const giveBonus = invader.scare(dragon.x, dragon.y);
                Audio.playInvaderScared();

                if (giveBonus) {
                    Meters.onScare();
                    this.stats.invadersScared++;
                    this.score += 5;

                    if (Spawner.trackSuccessfulAction() && !this.powerUp) {
                        this.powerUp = Spawner.spawnPowerUp(this.nests, dragon, this.eggCrackTime);
                        if (this.powerUp) Audio.playPowerUpSpawn();
                    }
                }

                if (dragon.carrying !== null) {
                    const droppedEggId = dragon.dropEgg();
                    const droppedEgg = new Egg(dragon.x, dragon.y, droppedEggId);
                    droppedEgg.setDropped();
                    this.eggs.push(droppedEgg);
                    this.stats.eggsDropped++;
                    this.score -= 3; // Small penalty for dropping egg
                    Meters.onEggDrop();
                }
            }

            // Power-up pickup
            if (Collision.checkDragonPowerUpPickup(dragon, this.powerUp)) {
                this.collectPowerUp(this.powerUp, dragon);
                this.powerUp = null;
            }
        }

        // Invader harassment (nests take damage)
        let harassingCount = 0;
        for (const invader of this.invaders) {
            if (invader.banished) continue;

            if (invader.state === INVADER_STATES.HARASS && invader.targetNest) {
                const nest = invader.targetNest;
                if (!nest.shielded && Collision.checkInvaderNestOverlap(invader, nest)) {
                    const damage = NEST_DAMAGE_PER_SEC * dt;
                    nest.takeDamage(damage);
                    this.stats.totalDamageTaken += damage;
                    harassingCount++;
                }
            }
        }

        if (harassingCount > 0) {
            Meters.onHarass(dt, harassingCount);
        }

        // Check for destroyed nests (health reached 0)
        for (let i = this.nests.length - 1; i >= 0; i--) {
            if (this.nests[i].health <= 0) {
                // Nest destroyed - adds 35% danger
                Meters.onNestLost();
                Audio.playNestDamage();

                // Remove the nest
                this.nests.splice(i, 1);

                // Redirect any invaders targeting this nest
                for (const invader of this.invaders) {
                    if (invader.targetNest && invader.targetNest.health <= 0) {
                        invader.targetNest = null;
                    }
                }
            }
        }
    },

    // Calculate final score breakdown
    calculateFinalScore() {
        const gameTime = (Date.now() - this.stats.gameStartTime) / 1000;
        const avgDeliveryTime = this.stats.eggsDelivered > 0
            ? this.stats.totalDeliveryTime / this.stats.eggsDelivered
            : 0;

        // Calculate bonuses
        const deliveryBonus = this.stats.eggsDelivered * 10;
        const speedBonus = this.stats.fastDeliveries * 15;
        const repairBonus = this.stats.nestsRepaired * 20;
        const scareBonus = this.stats.invadersScared * 5;
        const powerUpBonus = this.stats.powerUpsCollected * 20;

        // Calculate penalties
        const eggsLostPenalty = this.stats.eggsLost * 8;
        const droppedPenalty = this.stats.eggsDropped * 3;
        const damagePenalty = Math.floor(this.stats.totalDamageTaken / 10);

        // Time bonus (faster completion = more points)
        const timeBonus = Math.max(0, Math.floor(300 - gameTime / 2));

        const finalScore = Math.max(0,
            deliveryBonus + speedBonus + repairBonus + scareBonus + powerUpBonus + timeBonus
            - eggsLostPenalty - droppedPenalty - damagePenalty
        );

        return {
            gameTime: Math.floor(gameTime),
            avgDeliveryTime: avgDeliveryTime.toFixed(1),
            deliveryBonus,
            speedBonus,
            repairBonus,
            scareBonus,
            powerUpBonus,
            timeBonus,
            eggsLostPenalty,
            droppedPenalty,
            damagePenalty,
            finalScore,
            stats: { ...this.stats }
        };
    },

    collectPowerUp(powerUp, dragon) {
        this.activePowerUp = powerUp.type;
        this.stats.powerUpsCollected++;
        Audio.playPowerUpCollect();

        switch (powerUp.type) {
            case POWERUP_TYPES.WING_BOOST:
                // Apply to collecting dragon (and P2 if exists in co-op)
                dragon.activateSpeedBoost();
                if (this.dragon2 && dragon === this.dragon) {
                    this.dragon2.activateSpeedBoost();
                } else if (this.dragon2 && dragon === this.dragon2) {
                    this.dragon.activateSpeedBoost();
                }
                this.activePowerUpEndTime = Date.now() + WING_BOOST_DURATION;
                Audio.playWingBoost();
                break;

            case POWERUP_TYPES.BIG_SCARE:
                for (const invader of this.invaders) {
                    if (!invader.banished) {
                        invader.scare(dragon.x, dragon.y);
                    }
                }
                Audio.playBigScare();
                this.activePowerUp = null;
                break;

            case POWERUP_TYPES.NEST_SHIELD:
                for (const nest of this.nests) {
                    nest.shielded = true;
                }
                this.activePowerUpEndTime = Date.now() + NEST_SHIELD_DURATION;
                Audio.playNestShield();
                break;

            case POWERUP_TYPES.PERMANENT_BANISH:
                // Banish all current invaders temporarily
                for (const invader of this.invaders) {
                    if (!invader.banished) {
                        invader.banish();
                    }
                }
                Audio.playPermanentBanish();
                this.activePowerUp = null;
                break;

            case POWERUP_TYPES.DANGER_REDUCE:
                // Reduce danger level by 20%
                Meters.reduceDanger(DANGER_REDUCE_AMOUNT);
                Audio.playNestShield(); // Reuse healing-like sound
                this.activePowerUp = null;
                break;
        }

        this.score += 20;
    },

    render() {
        // Draw background based on state
        if (this.state === GAME_STATES.PLAYING || this.state === GAME_STATES.WIN ||
            this.state === GAME_STATES.LOSE || this.state === GAME_STATES.NAME_ENTRY) {
            // Use level-specific background during gameplay and end screens
            Level.render(ctx, this.animTime);
        } else {
            // Use default retro background for menus
            this.renderRetroBackground();
        }

        switch (this.state) {
            case GAME_STATES.MENU:
                Screens.renderMenu(ctx,
                    () => this.state = GAME_STATES.PLAYER_SELECT,
                    () => this.state = GAME_STATES.INSTRUCTIONS,
                    () => this.state = GAME_STATES.HIGHSCORES
                );
                break;

            case GAME_STATES.PLAYER_SELECT:
                Screens.renderPlayerSelect(ctx,
                    () => this.state = GAME_STATES.LEVEL_SELECT,
                    () => this.state = GAME_STATES.MENU
                );
                break;

            case GAME_STATES.LEVEL_SELECT:
                Screens.renderLevelSelect(ctx,
                    () => this.state = GAME_STATES.DIFFICULTY_SELECT,
                    () => this.state = GAME_STATES.PLAYER_SELECT
                );
                break;

            case GAME_STATES.DIFFICULTY_SELECT:
                Screens.renderDifficultySelect(ctx,
                    () => this.startGame(),
                    () => this.state = GAME_STATES.LEVEL_SELECT
                );
                break;

            case GAME_STATES.INSTRUCTIONS:
                Screens.renderInstructions(ctx,
                    () => this.state = GAME_STATES.MENU
                );
                break;

            case GAME_STATES.HIGHSCORES:
                Screens.renderHighscores(ctx,
                    () => this.state = GAME_STATES.MENU
                );
                break;

            case GAME_STATES.PLAYING:
                this.renderGameplay();
                break;

            case GAME_STATES.NAME_ENTRY:
                this.renderGameplay();
                Screens.renderNameEntry(ctx, this.lastScoreBreakdown, this.wasWin,
                    (name) => this.submitHighscore(name),
                    () => this.skipHighscore()
                );
                break;

            case GAME_STATES.WIN:
                this.renderGameplay();
                Screens.renderWin(ctx, this.score, this.eggsCollected,
                    this.lastScoreBreakdown || this.calculateFinalScore(),
                    () => this.state = GAME_STATES.PLAYER_SELECT,
                    () => this.state = GAME_STATES.MENU
                );
                break;

            case GAME_STATES.LOSE:
                this.renderGameplay();
                Screens.renderLose(ctx, this.score, this.eggsCollected,
                    this.lastScoreBreakdown || this.calculateFinalScore(),
                    () => this.state = GAME_STATES.PLAYER_SELECT,
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

        // Render invaders (skip banished ones or render them faded)
        for (const invader of this.invaders) {
            if (!invader.banished) {
                invader.render(ctx);
            }
        }

        // Render dragon(s) on top
        this.dragon.render(ctx);
        if (this.dragon2) {
            this.dragon2.render(ctx);
        }

        // Render joystick(s)
        Joystick.render(ctx, Input.getP1Touch(), 1);
        if (this.numPlayers === 2) {
            Joystick.render(ctx, Input.getP2Touch(), 2);
        }

        // Render HUD with egg counter
        HUD.render(ctx, Meters.danger, this.score,
            this.activePowerUp, this.activePowerUpEndTime,
            this.eggsCollected, this.eggsToWin);
    }
};

// Start the game when page loads
window.addEventListener('load', () => {
    Game.init();
});
