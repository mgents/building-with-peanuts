// ===========================================
// SPAWNER SYSTEM - Eggs, Invaders, Power-ups
// ===========================================

const Spawner = {
    nextEggId: 1,
    nextInvaderId: 1,

    lastInvaderSpawn: 0,
    lastEggSpawn: 0,
    currentSpawnInterval: 8000,

    successfulActions: 0,

    reset() {
        this.nextEggId = 1;
        this.nextInvaderId = 1;
        // Set spawn times so first spawn happens after 5 seconds
        // We set lastSpawn to (now - interval + 5000) so the check passes after 5 seconds
        const now = Date.now();
        this.firstSpawnDelay = 5000;
        this.lastInvaderSpawn = now;
        this.lastEggSpawn = now;
        this.isFirstSpawn = true;
        this.currentSpawnInterval = 10000;
        this.successfulActions = 0;
    },

    // Get random spawn position along edges (Wild Zone)
    getEdgeSpawnPosition() {
        const edge = Math.floor(Math.random() * 4);
        const margin = 30;

        switch (edge) {
            case 0: // Top
                return { x: margin + Math.random() * (GAME_WIDTH - margin * 2), y: margin };
            case 1: // Right
                return { x: GAME_WIDTH - margin, y: margin + Math.random() * (GAME_HEIGHT - margin * 2) };
            case 2: // Bottom
                return { x: margin + Math.random() * (GAME_WIDTH - margin * 2), y: GAME_HEIGHT - margin };
            case 3: // Left
                return { x: margin, y: margin + Math.random() * (GAME_HEIGHT - margin * 2) };
        }
    },

    // Get random position within the play area (avoiding nests)
    getRandomPlayAreaPosition(nests, minDistFromNests = 100) {
        const margin = 80;
        let attempts = 0;
        const maxAttempts = 50;

        while (attempts < maxAttempts) {
            const x = margin + Math.random() * (GAME_WIDTH - margin * 2);
            const y = margin + Math.random() * (GAME_HEIGHT - margin * 2);

            // Check distance from all nests
            let valid = true;
            for (const nest of nests) {
                const dist = Math.hypot(x - nest.x, y - nest.y);
                if (dist < minDistFromNests) {
                    valid = false;
                    break;
                }
            }

            if (valid) {
                return { x, y };
            }

            attempts++;
        }

        // Fallback to edge spawn if no valid position found
        return this.getEdgeSpawnPosition();
    },

    // Spawn an egg
    spawnEgg(nests) {
        const pos = this.getRandomPlayAreaPosition(nests, 80);
        const egg = new Egg(pos.x, pos.y, this.nextEggId++);
        return egg;
    },

    // Spawn an invader
    spawnInvader() {
        const pos = this.getEdgeSpawnPosition();
        const invader = new Invader(pos.x, pos.y, this.nextInvaderId++);
        return invader;
    },

    // Spawn a power-up
    spawnPowerUp(nests, dragon, lifetime = POWERUP_LIFETIME) {
        const pos = this.getRandomPlayAreaPosition(nests, 60);

        // Random type
        const types = Object.values(POWERUP_TYPES);
        const type = types[Math.floor(Math.random() * types.length)];

        return new PowerUp(pos.x, pos.y, type, lifetime);
    },

    // Update spawn timers and return new entities
    // spawnInterval: the base spawn interval in ms (calculated by Game based on difficulty/players)
    update(eggs, invaders, nests, phase, spawnInterval) {
        const now = Date.now();
        const newEntities = {
            eggs: [],
            invaders: []
        };

        // Apply phase speed multiplier to base spawn interval
        // As more eggs are delivered, spawns get faster
        this.currentSpawnInterval = spawnInterval * phase.spawnSpeedMultiplier;

        // For first spawn, use 5 second delay; after that use normal interval
        const effectiveInterval = this.isFirstSpawn ? this.firstSpawnDelay : this.currentSpawnInterval;

        // Count active (non-banished) invaders
        const activeInvaders = invaders.filter(inv => !inv.banished);

        // Spawn invaders at fixed interval
        if (now - this.lastInvaderSpawn > effectiveInterval) {
            if (activeInvaders.length < phase.maxInvaders) {
                newEntities.invaders.push(this.spawnInvader());
                this.lastInvaderSpawn = now;
                this.isFirstSpawn = false; // After first spawn, use normal interval
            }
        }

        // Spawn eggs at the same interval as invaders
        if (now - this.lastEggSpawn > effectiveInterval) {
            const groundEggs = eggs.filter(e => !e.cracked);
            if (groundEggs.length < phase.maxEggs) {
                newEntities.eggs.push(this.spawnEgg(nests));
                this.lastEggSpawn = now;
            }
        }

        return newEntities;
    },

    // Track successful action for power-up spawning
    trackSuccessfulAction() {
        this.successfulActions++;

        if (this.successfulActions >= POWERUP_ACTION_THRESHOLD) {
            this.successfulActions = 0;

            // 30% chance to spawn power-up
            return Math.random() < POWERUP_SPAWN_CHANCE;
        }

        return false;
    }
};
