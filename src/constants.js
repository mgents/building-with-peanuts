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

// Meter values - Danger changes
// Game is lost when total danger reaches 100%
// Eggs lost: 20% each (5 eggs = 100% = game over)
// Nests lost: 35% each (3 nests = 105% = game over)
const DANGER_EGG_LOST = 20;        // Each egg lost adds 20% danger
const DANGER_NEST_LOST = 35;       // Each nest lost adds 35% danger
const DANGER_REDUCE_AMOUNT = 20;   // Danger reduction power-up removes 20%

// Legacy danger values (kept for gradual danger increase)
const DANGER_HARASS_PER_SEC = 0.5; // Reduced - main danger comes from losing eggs/nests
const DANGER_EGG_CRACK = 0;        // Now handled by DANGER_EGG_LOST
const DANGER_EGG_DROP = 2;         // Small penalty for dropping
const DANGER_EGG_DELIVERED = -1;   // Small reduction for delivery
const DANGER_FULL_REPAIR = -2;     // Small reduction for repairs

// Nest health
const NEST_MAX_HEALTH = 100;
const NEST_DAMAGE_PER_SEC = 8;
const NEST_REPAIR_PER_SEC = 12;
const NEST_HEALTHY_THRESHOLD = 70;
const NEST_DAMAGED_THRESHOLD = 30;

// Phase configuration - eggsMin determines when phase activates
// spawnSpeedMultiplier makes spawns faster as game progresses (lower = faster)
const PHASES = [
    { eggsMin: 0,  maxInvaders: 3, maxEggs: 2, spawnSpeedMultiplier: 1.0 },   // 0-9 eggs: normal speed
    { eggsMin: 10, maxInvaders: 4, maxEggs: 3, spawnSpeedMultiplier: 0.9 },   // 10-19 eggs: 10% faster
    { eggsMin: 20, maxInvaders: 4, maxEggs: 3, spawnSpeedMultiplier: 0.8 },   // 20-29 eggs: 20% faster
    { eggsMin: 30, maxInvaders: 5, maxEggs: 4, spawnSpeedMultiplier: 0.7 },   // 30-39 eggs: 30% faster
    { eggsMin: 40, maxInvaders: 5, maxEggs: 4, spawnSpeedMultiplier: 0.6 },   // 40-49 eggs: 40% faster
    { eggsMin: 50, maxInvaders: 6, maxEggs: 5, spawnSpeedMultiplier: 0.5 }    // 50+ eggs: 50% faster
];

// Power-ups
const POWERUP_ACTION_THRESHOLD = 3;
const POWERUP_SPAWN_CHANCE = 0.3;
const WING_BOOST_DURATION = 10000;  // 10 seconds
const BIG_SCARE_DURATION = 10000;   // 10 seconds
const NEST_SHIELD_DURATION = 10000; // 10 seconds
// Note: PERMANENT_BANISH and DANGER_REDUCE are instant effects, no duration needed

// Power-up types
const POWERUP_TYPES = {
    WING_BOOST: 'wingBoost',
    BIG_SCARE: 'bigScare',
    NEST_SHIELD: 'nestShield',
    PERMANENT_BANISH: 'permanentBanish',
    DANGER_REDUCE: 'dangerReduce'
};

// Power-up lifetime (disappears if not collected)
const POWERUP_LIFETIME = 10000; // 10 seconds, same as default egg crack time

// Permanent Banish settings
const BANISH_RESPAWN_DELAY = 30000; // 30 seconds before banished invader can respawn

// Game states
const GAME_STATES = {
    MENU: 'menu',
    PLAYER_SELECT: 'playerSelect',
    LEVEL_SELECT: 'levelSelect',
    DIFFICULTY_SELECT: 'difficultySelect',
    INSTRUCTIONS: 'instructions',
    HIGHSCORES: 'highscores',
    PLAYING: 'playing',
    WIN: 'win',
    LOSE: 'lose',
    NAME_ENTRY: 'nameEntry'
};

// Difficulty settings
// Base timing for 1 player medium: 10 sec spawn, 10 sec egg/powerup timeout
// Easy: 30% slower (1.3x multiplier), Hard: 30% faster (0.7x multiplier)
// 2 players: eggs spawn twice as fast, need 50 eggs to win (vs 25 for 1 player)
const DIFFICULTY = {
    easy: {
        id: 'easy',
        name: 'Easy',
        // Spawn timing: 1P = 13s, 2P = 6.5s (base * 1.3, 2P spawns 2x faster)
        invaderSpawnMultiplier: 1.3,
        // Egg/powerup timeout: 1P = 13s, 2P = 6.5s
        eggCrackTimeMultiplier: 1.3,
        invaderSpeedMultiplier: 0.85
    },
    medium: {
        id: 'medium',
        name: 'Medium',
        // Spawn timing: 1P = 10s, 2P = 5s (base * 1.0, 2P spawns 2x faster)
        invaderSpawnMultiplier: 1.0,
        // Egg/powerup timeout: 1P = 10s, 2P = 5s
        eggCrackTimeMultiplier: 1.0,
        invaderSpeedMultiplier: 1.0
    },
    hard: {
        id: 'hard',
        name: 'Hard',
        // Spawn timing: 1P = 7s, 2P = 3.5s (base * 0.7, 2P spawns 2x faster)
        invaderSpawnMultiplier: 0.7,
        // Egg/powerup timeout: 1P = 7s, 2P = 3.5s
        eggCrackTimeMultiplier: 0.7,
        invaderSpeedMultiplier: 1.15
    }
};

// Eggs to win: 25 for 1 player, 50 for 2 players (all difficulties)
const EGGS_TO_WIN_1P = 25;
const EGGS_TO_WIN_2P = 50;

// Base timing values (in ms)
const BASE_SPAWN_INTERVAL_1P = 10000;  // 10 seconds for 1 player
const BASE_SPAWN_INTERVAL_2P = 5000;   // 5 seconds for 2 players (2x faster)
const BASE_TIMEOUT_1P = 10000;         // 10 seconds for 1 player
const BASE_TIMEOUT_2P = 5000;          // 5 seconds for 2 players (2x faster)

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
    POWERUP_BANISH: '#9933ff',
    POWERUP_DANGER: '#ff3366',  // Red/pink for danger reduction

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

// Player 2 colors (Green dragon)
const COLORS_P2 = {
    DRAGON_BODY: '#22c55e',
    DRAGON_BODY_LIGHT: '#4ade80',
    DRAGON_BODY_DARK: '#15803d',
    DRAGON_BELLY: '#86efac',
    DRAGON_WING: '#16a34a',
    DRAGON_EYE: '#00ff88',
    DRAGON_EYE_DARK: '#00cc6a'
};
