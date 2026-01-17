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
        this.lastInvaderSpawn = Date.now();
        this.lastEggSpawn = Date.now();
        this.currentSpawnInterval = 8000;
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
    spawnPowerUp(nests, dragon) {
        const pos = this.getRandomPlayAreaPosition(nests, 60);

        // Random type
        const types = Object.values(POWERUP_TYPES);
        const type = types[Math.floor(Math.random() * types.length)];

        return new PowerUp(pos.x, pos.y, type);
    },

    // Update spawn timers and return new entities
    update(eggs, invaders, nests, phase) {
        const now = Date.now();
        const newEntities = {
            eggs: [],
            invaders: []
        };

        // Update spawn interval based on phase
        const [minInterval, maxInterval] = phase.spawnInterval;
        this.currentSpawnInterval = minInterval + Math.random() * (maxInterval - minInterval);

        // Spawn invaders
        if (now - this.lastInvaderSpawn > this.currentSpawnInterval) {
            if (invaders.length < phase.maxInvaders) {
                newEntities.invaders.push(this.spawnInvader());
                this.lastInvaderSpawn = now;
            }
        }

        // Spawn eggs (less frequently, and only if below max)
        const eggSpawnInterval = 5000 + Math.random() * 3000;
        if (now - this.lastEggSpawn > eggSpawnInterval) {
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
