// ===========================================
// COLLISION SYSTEM - Circle-based collisions
// ===========================================

const Collision = {
    // Check if two circles overlap
    circlesOverlap(x1, y1, r1, x2, y2, r2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.hypot(dx, dy);
        return dist < r1 + r2;
    },

    // Get overlap amount and direction between two circles
    getOverlap(x1, y1, r1, x2, y2, r2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.hypot(dx, dy);
        const overlap = (r1 + r2) - dist;

        if (overlap <= 0) return null;

        // Normalize direction
        const nx = dist > 0 ? dx / dist : 1;
        const ny = dist > 0 ? dy / dist : 0;

        return {
            overlap,
            nx,
            ny
        };
    },

    // Push two circles apart so they don't overlap
    resolveCircleCollision(obj1, obj2) {
        const result = this.getOverlap(obj1.x, obj1.y, obj1.radius, obj2.x, obj2.y, obj2.radius);

        if (!result) return false;

        // Push each object half the overlap distance
        const pushX = result.nx * result.overlap * 0.5;
        const pushY = result.ny * result.overlap * 0.5;

        obj1.x -= pushX;
        obj1.y -= pushY;
        obj2.x += pushX;
        obj2.y += pushY;

        return true;
    },

    // Push a moving object away from a static object
    resolveStaticCollision(movingObj, staticObj) {
        const result = this.getOverlap(
            movingObj.x, movingObj.y, movingObj.radius,
            staticObj.x, staticObj.y, staticObj.radius
        );

        if (!result) return false;

        // Push moving object fully out
        movingObj.x -= result.nx * result.overlap;
        movingObj.y -= result.ny * result.overlap;

        return true;
    },

    // Apply soft repulsion between invaders to prevent clumping
    applySoftRepulsion(invaders, strength = 0.5) {
        for (let i = 0; i < invaders.length; i++) {
            for (let j = i + 1; j < invaders.length; j++) {
                const inv1 = invaders[i];
                const inv2 = invaders[j];

                const dx = inv2.x - inv1.x;
                const dy = inv2.y - inv1.y;
                const dist = Math.hypot(dx, dy);

                // Apply repulsion when closer than 2x radius
                const minDist = (inv1.radius + inv2.radius) * 1.5;

                if (dist < minDist && dist > 0) {
                    const force = (minDist - dist) * strength;
                    const nx = dx / dist;
                    const ny = dy / dist;

                    inv1.x -= nx * force * 0.5;
                    inv1.y -= ny * force * 0.5;
                    inv2.x += nx * force * 0.5;
                    inv2.y += ny * force * 0.5;
                }
            }
        }
    },

    // Check dragon vs egg pickup
    checkDragonEggPickup(dragon, eggs) {
        if (dragon.carrying !== null) return null;

        for (const egg of eggs) {
            if (egg.cracked || egg.isInGracePeriod) continue;

            if (this.circlesOverlap(dragon.x, dragon.y, dragon.radius, egg.x, egg.y, egg.radius)) {
                return egg;
            }
        }

        return null;
    },

    // Check dragon vs nest (for deposit or repair)
    checkDragonNestOverlap(dragon, nests) {
        for (const nest of nests) {
            if (this.circlesOverlap(dragon.x, dragon.y, dragon.radius, nest.x, nest.y, nest.radius)) {
                return nest;
            }
        }
        return null;
    },

    // Check dragon vs invader (for scare)
    checkDragonInvaderCollisions(dragon, invaders) {
        const scared = [];

        for (const invader of invaders) {
            if (invader.state === INVADER_STATES.FLEE) continue;

            if (this.circlesOverlap(dragon.x, dragon.y, dragon.radius, invader.x, invader.y, invader.radius)) {
                scared.push(invader);
            }
        }

        return scared;
    },

    // Check dragon vs power-up
    checkDragonPowerUpPickup(dragon, powerUp) {
        if (!powerUp || powerUp.collected) return false;

        return this.circlesOverlap(dragon.x, dragon.y, dragon.radius, powerUp.x, powerUp.y, powerUp.radius);
    },

    // Check invader vs nest (for harass detection)
    checkInvaderNestOverlap(invader, nest) {
        return this.circlesOverlap(invader.x, invader.y, invader.radius, nest.x, nest.y, nest.radius);
    }
};
