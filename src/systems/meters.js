// ===========================================
// METERS SYSTEM - Danger tracking
// ===========================================

const Meters = {
    danger: 0,

    // Track specific loss counts for danger system
    eggsLost: 0,
    nestsLost: 0,

    // Track positive actions for phase progression
    eggsDelivered: 0,

    reset() {
        this.danger = 0; // Start at 0, danger builds from losses
        this.eggsLost = 0;
        this.nestsLost = 0;
        this.eggsDelivered = 0;
    },

    // Positive actions - reduce danger slightly
    onEggDelivered() {
        this.eggsDelivered++;
        this.danger = Math.max(0, this.danger + DANGER_EGG_DELIVERED);
    },

    onRepairToHealthy() {
        this.danger = Math.max(0, this.danger + DANGER_FULL_REPAIR);
    },

    onScare() {
        // Scaring invaders is good but doesn't affect danger
    },

    // Danger meter increases
    onHarass(dt, invaderCount) {
        // Per-second rate multiplied by delta time and number of invaders
        // This provides gradual tension but main danger comes from losses
        this.danger = Math.min(100, this.danger + DANGER_HARASS_PER_SEC * dt * invaderCount);
    },

    // Egg lost (cracked) - adds 20% danger
    onEggLost() {
        this.eggsLost++;
        this.danger = Math.min(100, this.danger + DANGER_EGG_LOST);
    },

    // Nest destroyed (health reached 0) - adds 35% danger
    onNestLost() {
        this.nestsLost++;
        this.danger = Math.min(100, this.danger + DANGER_NEST_LOST);
    },

    onEggCrack() {
        // Calls onEggLost for the danger system
        this.onEggLost();
    },

    onEggDrop() {
        this.danger = Math.min(100, this.danger + DANGER_EGG_DROP);
    },

    // Reduce danger (from power-up)
    reduceDanger(amount) {
        this.danger = Math.max(0, this.danger - amount);
    },

    checkLose() {
        // Lose when danger reaches 100% or above
        return this.danger >= 100;
    },

    // Get danger breakdown for UI display
    getDangerBreakdown() {
        return {
            eggsLost: this.eggsLost,
            nestsLost: this.nestsLost,
            totalDanger: this.danger
        };
    },

    // Get current game phase based on eggs delivered
    getCurrentPhase() {
        for (let i = PHASES.length - 1; i >= 0; i--) {
            if (this.eggsDelivered >= PHASES[i].eggsMin) {
                return PHASES[i];
            }
        }
        return PHASES[0];
    }
};
