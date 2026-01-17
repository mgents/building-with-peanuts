// ===========================================
// METERS SYSTEM - Calm and Danger tracking
// ===========================================

const Meters = {
    calm: 0,
    danger: 0,

    reset() {
        this.calm = 0;
        this.danger = 20; // Start with some danger to create tension
    },

    // Calm meter increases
    onEggDelivered() {
        this.calm = Math.min(100, this.calm + CALM_EGG_DELIVERED);
        this.danger = Math.max(0, this.danger + DANGER_EGG_DELIVERED);
    },

    onRepairToHealthy() {
        this.calm = Math.min(100, this.calm + CALM_REPAIR_TO_HEALTHY);
        this.danger = Math.max(0, this.danger + DANGER_FULL_REPAIR);
    },

    onScare() {
        this.calm = Math.min(100, this.calm + CALM_SCARE);
    },

    // Danger meter increases
    onHarass(dt, invaderCount) {
        // Per-second rate multiplied by delta time and number of invaders
        this.danger = Math.min(100, this.danger + DANGER_HARASS_PER_SEC * dt * invaderCount);
    },

    onEggCrack() {
        this.danger = Math.min(100, this.danger + DANGER_EGG_CRACK);
    },

    onEggDrop() {
        this.danger = Math.min(100, this.danger + DANGER_EGG_DROP);
    },

    // Check win/lose conditions
    checkWin() {
        return this.calm >= 100;
    },

    checkLose() {
        return this.danger >= 100;
    },

    // Get current game phase based on calm
    getCurrentPhase() {
        for (let i = PHASES.length - 1; i >= 0; i--) {
            if (this.calm >= PHASES[i].calmMin) {
                return PHASES[i];
            }
        }
        return PHASES[0];
    }
};
