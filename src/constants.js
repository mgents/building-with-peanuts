// ===========================================
// DRAGON NEST DEFENDER - GAME CONSTANTS
// ===========================================

// Canvas dimensions (internal resolution)
const GAME_WIDTH = 1024;
const GAME_HEIGHT = 768;

// Entity radii (for circle collisions)
const DRAGON_RADIUS = 18;
const INVADER_RADIUS = 16;
const EGG_RADIUS = 10;
const NEST_RADIUS = 40;
const POWERUP_RADIUS = 15;

// Movement speeds (pixels per second)
const DRAGON_BASE_SPEED = 250;
const DRAGON_CARRY_MULTIPLIER = 0.85;
const DRAGON_BOOST_MULTIPLIER = 1.3;
const INVADER_BASE_SPEED = 100;
const INVADER_FLEE_MULTIPLIER = 1.25;

// Timers (milliseconds)
const EGG_CRACK_TIME = 10000;
const INVADER_FLEE_DURATION = 2000;
const INVADER_RECOVER_PAUSE = 500;
const EGG_GRACE_PERIOD = 1000;
const SCARE_COOLDOWN = 5000;

// Meter values - Calm increases
const CALM_EGG_DELIVERED = 8;
const CALM_REPAIR_TO_HEALTHY = 10;
const CALM_SCARE = 3;

// Meter values - Danger changes
const DANGER_HARASS_PER_SEC = 2;
const DANGER_EGG_CRACK = 10;
const DANGER_EGG_DROP = 4;
const DANGER_EGG_DELIVERED = -2;
const DANGER_FULL_REPAIR = -1;

// Nest health
const NEST_MAX_HEALTH = 100;
const NEST_DAMAGE_PER_SEC = 8;
const NEST_REPAIR_PER_SEC = 12;
const NEST_HEALTHY_THRESHOLD = 70;
const NEST_DAMAGED_THRESHOLD = 30;

// Phase configuration
const PHASES = [
    { calmMin: 0,  calmMax: 30,  maxInvaders: 2, spawnInterval: [8000, 10000], maxEggs: 1 },
    { calmMin: 31, calmMax: 60,  maxInvaders: 4, spawnInterval: [6000, 8000],  maxEggs: 2 },
    { calmMin: 61, calmMax: 90,  maxInvaders: 6, spawnInterval: [4000, 6000],  maxEggs: 3 },
    { calmMin: 91, calmMax: 100, maxInvaders: 7, spawnInterval: [3000, 5000],  maxEggs: 3 }
];

// Power-ups
const POWERUP_ACTION_THRESHOLD = 3;
const POWERUP_SPAWN_CHANCE = 0.3;
const WING_BOOST_DURATION = 5000;
const BIG_SCARE_DURATION = 2000;
const NEST_SHIELD_DURATION = 10000;

// Power-up types
const POWERUP_TYPES = {
    WING_BOOST: 'wingBoost',
    BIG_SCARE: 'bigScare',
    NEST_SHIELD: 'nestShield'
};

// Game states
const GAME_STATES = {
    MENU: 'menu',
    INSTRUCTIONS: 'instructions',
    PLAYING: 'playing',
    WIN: 'win',
    LOSE: 'lose'
};

// Invader states
const INVADER_STATES = {
    SEEK: 'seek',
    HARASS: 'harass',
    FLEE: 'flee',
    RECOVER: 'recover'
};

// Colors
const COLORS = {
    // Environment
    GRASS: '#3d8b37',
    GRASS_DARK: '#2d6b27',

    // Dragon
    DRAGON_BODY: '#8b5cf6',
    DRAGON_BELLY: '#c4b5fd',
    DRAGON_WING: '#7c3aed',

    // Nests
    NEST_HEALTHY: '#8b6914',
    NEST_DAMAGED: '#a67c00',
    NEST_CRITICAL: '#cc0000',
    NEST_INNER: '#5c4a1f',

    // Eggs
    EGG_SHELL: '#f5f5dc',
    EGG_SPOT: '#e8d5a3',

    // Invaders
    INVADER_BODY: '#4a4a4a',
    INVADER_EYE: '#ff4444',

    // Power-ups
    POWERUP_WING: '#00bfff',
    POWERUP_SCARE: '#ff6600',
    POWERUP_SHIELD: '#00ff88',

    // UI
    CALM_BAR: '#22c55e',
    DANGER_BAR: '#ef4444',
    UI_BG: 'rgba(0, 0, 0, 0.7)',
    UI_TEXT: '#ffffff',
    BUTTON: '#4f46e5',
    BUTTON_HOVER: '#6366f1'
};

// Joystick settings
const JOYSTICK_DEAD_ZONE = 0.15;
const JOYSTICK_MAX_RADIUS = 50;
const JOYSTICK_VISUAL_RADIUS = 40;
