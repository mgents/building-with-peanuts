# Dragon Nest Defender v2 - Development Plan

## Overview

This document outlines the development plan for version 2.0 of Dragon Nest Defender. The update introduces major new features including two-player cooperative mode, enhanced audio, improved AI, multiple levels, and a new win condition.

---

## Feature 1: Two-Player Mode

### Description
Add a local two-player cooperative mode where two dragons work together to defend the nests.

### Implementation Details

#### 1.1 Menu System Changes
- Add player selection screen after main menu:
  - "1 Player" button
  - "2 Players" button
- Store selection in `Game.playerCount`

#### 1.2 Input System Updates (`src/input.js`)
- Create separate input handlers:
  - **Player 1**: WASD keys (W=up, A=left, S=down, D=right)
  - **Player 2**: Arrow keys (Up, Down, Left, Right)
- Maintain two movement vectors: `Input.p1Movement` and `Input.p2Movement`
- Update `Input.init()` to register both control schemes simultaneously

#### 1.3 Dragon Entity Changes (`src/entities/Dragon.js`)
- Add `playerId` property to Dragon constructor
- Add visual differentiation:
  - **Player 1**: Blue dragon (current design)
  - **Player 2**: Green dragon with emerald eyes
- Create `Dragon.renderAsPlayer2()` method with alternate color palette

#### 1.4 Game State Updates (`src/main.js`)
- Add `dragon2` property to Game object
- Initialize second dragon at offset position (e.g., `GAME_WIDTH * 0.6, GAME_HEIGHT / 2`)
- Update game loop to call `dragon2.update()` with `Input.p2Movement`
- Update collision system to handle both dragons
- Render both dragons

#### 1.5 Collision Considerations
- Both dragons can pick up eggs independently
- Both dragons can scare invaders
- Both dragons can repair nests
- Add soft collision between the two dragons (prevent overlap)

### Files to Modify
- `src/input.js` - Dual input handling
- `src/entities/Dragon.js` - Player 2 variant
- `src/main.js` - Two-dragon game logic
- `src/ui/screens.js` - Player count selection
- `src/systems/collision.js` - Two-dragon collision handling

---

## Feature 2: Enhanced Power-Ups with Sound Effects

### Description
Improve power-up visuals with clear iconography and add a new "Permanent Banish" power-up. Add sound effects for all power-ups and game actions.

### Implementation Details

#### 2.1 Power-Up Visual Improvements (`src/entities/PowerUp.js`)
- **Wing Boost**: Render wing icon with speed lines
- **Big Scare**: Render roar/shockwave icon
- **Nest Shield**: Render shield icon with glow
- **Permanent Banish** (NEW): Render portal/vortex icon

#### 2.2 New Power-Up: Permanent Banish
- Add to `POWERUP_TYPES` in constants.js:
  ```javascript
  PERMANENT_BANISH: 'permanentBanish'
  ```
- Effect: Instantly removes the nearest invader from the game permanently (does not respawn for 30 seconds)
- Rarity: Lower spawn chance than other power-ups (15% of power-up spawns)
- Visual: Dark purple vortex effect on collection

#### 2.3 Audio System (`src/audio.js` - NEW FILE)
Create new audio management system:

```javascript
const Audio = {
    context: null,
    sounds: {},
    musicVolume: 0.3,
    sfxVolume: 0.5,

    init() { /* Initialize Web Audio API */ },
    loadSounds() { /* Load all game sounds */ },
    playSound(name) { /* Play a sound effect */ },
    playMusic() { /* Start background music */ },
    stopMusic() { /* Stop background music */ }
};
```

#### 2.4 Sound Effects to Implement
| Sound | Trigger | Style |
|-------|---------|-------|
| `menu_select` | Button click | Short blip |
| `game_start` | Game begins | Rising fanfare |
| `egg_pickup` | Dragon picks up egg | Soft chime |
| `egg_deliver` | Egg delivered to nest | Success jingle |
| `egg_crack` | Egg timer expires | Crack/break |
| `invader_scared` | Invader enters flee state | Screech/whoosh |
| `nest_damage` | Nest taking damage | Thud/impact |
| `powerup_spawn` | Power-up appears | Sparkle |
| `powerup_collect` | Power-up collected | Unique per type |
| `wing_boost` | Speed boost active | Whoosh |
| `big_scare` | AOE scare activated | Roar |
| `nest_shield` | Shield activated | Energy hum |
| `permanent_banish` | Invader banished | Vortex sound |
| `win` | Game won | Victory fanfare |
| `lose` | Game lost | Sad trombone |

#### 2.5 Background Music
- Create retro-style chiptune background track
- Use Web Audio API oscillators for procedural generation
- OR embed base64-encoded short loop

### Files to Create
- `src/audio.js` - Audio management system

### Files to Modify
- `src/constants.js` - New power-up type, audio settings
- `src/entities/PowerUp.js` - Visual improvements, new power-up
- `src/main.js` - Audio integration, banish logic
- `src/ui/screens.js` - Menu sounds
- `src/systems/collision.js` - Banish effect trigger

---

## Feature 3: Improved Invader AI

### Description
Make invaders behave more intelligently: disperse when fleeing, vary target selection, and counter player camping strategies.

### Implementation Details

#### 3.1 Dispersed Fleeing (`src/entities/Invader.js`)
Current: Invaders flee directly away from dragon
New: Add randomized flee angle variation

```javascript
scare(dragonX, dragonY) {
    // Calculate base flee direction
    const dx = this.x - dragonX;
    const dy = this.y - dragonY;
    const baseAngle = Math.atan2(dy, dx);

    // Add random spread (-45 to +45 degrees)
    const spread = (Math.random() - 0.5) * Math.PI / 2;
    this.fleeAngle = baseAngle + spread;

    // Set flee state
    this.state = INVADER_STATES.FLEE;
    this.fleeEndTime = Date.now() + INVADER_FLEE_DURATION;
}
```

#### 3.2 Smart Target Selection
Current: Invaders always target the nearest/same nest
New: Weighted target selection based on:

1. **Nest Health**: Prefer damaged nests (easier targets)
2. **Distance**: Factor in travel time
3. **Dragon Proximity**: Avoid nests near the dragon
4. **Recent Harassment**: Avoid nests that were just defended

```javascript
selectTarget(nests, dragonPos) {
    let bestScore = -Infinity;
    let bestNest = null;

    for (const nest of nests) {
        let score = 0;

        // Prefer damaged nests
        score += (NEST_MAX_HEALTH - nest.health) * 0.5;

        // Distance penalty (closer is better, but not too close to dragon)
        const distToNest = this.distanceTo(nest);
        const dragonDistToNest = distance(dragonPos, nest);
        score -= distToNest * 0.1;
        score += dragonDistToNest * 0.3;

        // Avoid recently defended nests
        if (nest.lastDefendedTime && Date.now() - nest.lastDefendedTime < 5000) {
            score -= 50;
        }

        if (score > bestScore) {
            bestScore = score;
            bestNest = nest;
        }
    }

    return bestNest;
}
```

#### 3.3 Anti-Camping Behavior
Detect when dragon is camping near a single nest:

```javascript
// In Invader update
if (this.state === INVADER_STATES.SEEK) {
    // Check if dragon is camping (staying near one nest)
    const dragonNearNest = this.isNearAnyNest(dragonPos, nests, 80);

    if (dragonNearNest && this.targetNest === dragonNearNest) {
        // Switch to a different nest
        this.targetNest = this.selectAlternateTarget(nests, dragonNearNest);
    }
}
```

#### 3.4 Coordinated Attacks (Phase 3+)
In later phases, invaders coordinate:
- One invader acts as "distraction" targeting the defended nest
- Others target undefended nests
- Track which nests have invaders heading toward them

### Files to Modify
- `src/entities/Invader.js` - AI improvements
- `src/entities/Nest.js` - Add `lastDefendedTime` property
- `src/constants.js` - AI tuning parameters

---

## Feature 4: Polished Level Backgrounds

### Description
Create a non-square, organic-shaped island background while maintaining the mountain/water theme. Implement multiple themed levels.

### Implementation Details

#### 4.1 Island Shape System
Replace rectangular boundaries with organic island shape:

```javascript
// Define island boundary as a series of points
const islandBoundary = [
    { x: 100, y: 200 },
    { x: 150, y: 100 },
    { x: 400, y: 80 },
    { x: 700, y: 100 },
    { x: 900, y: 200 },
    { x: 950, y: 400 },
    { x: 900, y: 600 },
    { x: 700, y: 680 },
    { x: 400, y: 700 },
    { x: 150, y: 680 },
    { x: 80, y: 500 },
    { x: 100, y: 200 }
];

// Check if point is inside island
isInsideIsland(x, y) {
    // Ray casting algorithm
    // Return true if inside boundary
}
```

#### 4.2 Level Themes
Create 4 distinct level backgrounds:

**Mountain Peak (Default)**
- Grey/brown rocky terrain
- Snow-capped edges
- Alpine grass
- Cold blue water surrounding

**Beach Paradise**
- Sandy yellow terrain
- Palm tree decorations
- Tropical flowers
- Turquoise shallow water
- Coral reef elements visible in water

**Forest Glade**
- Deep green grass
- Large tree stumps as obstacles
- Mushroom decorations
- River cutting through (playable area)
- Dense forest edges

**Crystal Cave**
- Purple/blue crystalline ground
- Glowing crystal formations
- Underground lake (darker water)
- Stalactites as ceiling decoration
- Bioluminescent plants

#### 4.3 Level Data Structure (`src/levels.js` - NEW FILE)

```javascript
const LEVELS = {
    mountain: {
        name: "Mountain Peak",
        background: {
            baseColor: '#3d8c40',
            waterColor: '#1e3a5f',
            accentColor: '#5a4a3a'
        },
        nestPositions: [
            { x: 0.25, y: 0.35 },
            { x: 0.75, y: 0.35 },
            { x: 0.5, y: 0.7 }
        ],
        decorations: ['rocks', 'grass', 'flowers'],
        boundaryType: 'mountain'
    },
    beach: { /* ... */ },
    forest: { /* ... */ },
    cave: { /* ... */ }
};
```

#### 4.4 Boundary Collision Updates
Update dragon and invader movement to respect island boundaries:

```javascript
// In Dragon.update()
const newX = this.x + vx * dt;
const newY = this.y + vy * dt;

if (Level.isInsidePlayArea(newX, newY)) {
    this.x = newX;
    this.y = newY;
} else {
    // Slide along boundary
    this.slideAlongBoundary(newX, newY);
}
```

### Files to Create
- `src/levels.js` - Level definitions and backgrounds

### Files to Modify
- `src/main.js` - Level loading and rendering
- `src/entities/Dragon.js` - Boundary collision
- `src/entities/Invader.js` - Boundary collision

---

## Feature 5: Level Selection Menu

### Description
Add a level selection screen allowing players to choose their arena and difficulty setting.

### Implementation Details

#### 5.1 Menu Flow
```
Main Menu
    |
    +-- 1 Player / 2 Players
            |
            +-- Level Select (Mountain / Beach / Forest / Cave)
                    |
                    +-- Difficulty Select (Easy / Medium / Hard)
                            |
                            +-- Game Start
```

#### 5.2 Level Select Screen (`src/ui/screens.js`)
- Display 4 level buttons with preview thumbnails
- Show level name and brief description
- Highlight locked levels (if implementing progression)
- Selected level has visual border/glow

#### 5.3 Difficulty Settings (`src/constants.js`)

**Easy Mode**
- Invaders spawn 30% slower
- Invader speed reduced by 20%
- Egg crack time extended to 15 seconds
- Nest damage rate reduced by 25%
- Win condition: 35 eggs

**Medium Mode (Default)**
- Current game balance
- Win condition: 50 eggs

**Hard Mode**
- Invaders spawn 20% faster
- Invader speed increased by 15%
- Egg crack time reduced to 8 seconds
- Max invaders +2 per phase
- Win condition: 50 eggs

```javascript
const DIFFICULTY = {
    easy: {
        invaderSpawnMultiplier: 1.3,
        invaderSpeedMultiplier: 0.8,
        eggCrackTime: 15000,
        nestDamageMultiplier: 0.75,
        winCondition: 35
    },
    medium: {
        invaderSpawnMultiplier: 1.0,
        invaderSpeedMultiplier: 1.0,
        eggCrackTime: 10000,
        nestDamageMultiplier: 1.0,
        winCondition: 50
    },
    hard: {
        invaderSpawnMultiplier: 0.8,
        invaderSpeedMultiplier: 1.15,
        eggCrackTime: 8000,
        nestDamageMultiplier: 1.25,
        winCondition: 50
    }
};
```

#### 5.4 Game State Updates
- Add `Game.selectedLevel` property
- Add `Game.difficulty` property
- Apply difficulty modifiers in `startGame()`
- Load appropriate level background

### Files to Modify
- `src/constants.js` - Difficulty settings
- `src/ui/screens.js` - Level and difficulty selection UI
- `src/main.js` - Apply difficulty, load level

---

## Feature 6: New Win Condition - 50 Eggs Saved

### Description
Change the win condition from "Calm Meter reaches 100" to "Save 50 eggs total".

### Implementation Details

#### 6.1 Tracking Eggs Saved
- Add `Game.totalEggsSaved` counter
- Increment on each successful egg delivery
- Display progress in HUD

#### 6.2 HUD Updates (`src/ui/hud.js`)
- Replace or augment Calm meter with egg counter
- Display: "Eggs Saved: 23/50"
- Add visual milestone markers (10, 25, 40, 50)
- Celebration effect at milestones

#### 6.3 Win Condition Check (`src/main.js`)

```javascript
// Replace Meters.checkWin() with:
if (this.totalEggsSaved >= Game.difficulty.winCondition) {
    this.state = GAME_STATES.WIN;
}
```

#### 6.4 Calm Meter Repurpose
- Keep Calm meter but use it for:
  - Phase progression (determines difficulty scaling)
  - Score multiplier
- Remove it as win condition

#### 6.5 Visual Feedback
- Show "+1 Egg!" floating text on delivery
- Egg counter pulses when incremented
- Milestone celebrations (every 10 eggs):
  - Brief screen flash
  - Sound effect
  - "10 Eggs Saved!" message

### Files to Modify
- `src/main.js` - Egg counting, win condition
- `src/ui/hud.js` - Egg counter display
- `src/systems/meters.js` - Repurpose calm meter

---

## Implementation Order

### Phase 1: Core Infrastructure
1. Audio system setup
2. Level data structure
3. Difficulty settings

### Phase 2: Menu System
1. Player count selection
2. Level selection screen
3. Difficulty selection screen

### Phase 3: Gameplay Features
1. Two-player mode
2. New win condition (50 eggs)
3. Invader AI improvements

### Phase 4: Content & Polish
1. Power-up improvements + Permanent Banish
2. Level backgrounds (all 4 themes)
3. Sound effects integration
4. Background music

### Phase 5: Testing & Balance
1. Two-player balance testing
2. Difficulty balance per level
3. AI behavior tuning
4. Audio mixing

---

## New File Structure

```
Dragon Nest Defender/
├── index.html
├── style.css
├── src/
│   ├── constants.js      (MODIFIED - difficulty, new power-up)
│   ├── canvas.js
│   ├── input.js          (MODIFIED - two-player input)
│   ├── audio.js          (NEW - audio system)
│   ├── levels.js         (NEW - level definitions)
│   ├── entities/
│   │   ├── Dragon.js     (MODIFIED - player 2 variant)
│   │   ├── Nest.js       (MODIFIED - defense tracking)
│   │   ├── Egg.js
│   │   ├── Invader.js    (MODIFIED - improved AI)
│   │   └── PowerUp.js    (MODIFIED - new visuals, banish)
│   ├── systems/
│   │   ├── collision.js  (MODIFIED - two dragons)
│   │   ├── spawner.js    (MODIFIED - difficulty scaling)
│   │   └── meters.js     (MODIFIED - egg counting)
│   ├── ui/
│   │   ├── screens.js    (MODIFIED - new menus)
│   │   ├── hud.js        (MODIFIED - egg counter)
│   │   └── joystick.js
│   └── main.js           (MODIFIED - major changes)
└── assets/               (NEW - audio files if not procedural)
    └── sounds/
```

---

## Technical Considerations

### Performance
- Pre-generate level backgrounds to avoid runtime calculations
- Use object pooling for frequently created/destroyed entities
- Optimize audio by preloading all sounds

### Mobile/Touch Support
- Two-player mode: Touch-only devices show split joysticks
- Level/difficulty selection: Touch-friendly button sizes
- Audio: Handle iOS audio unlock for all new sounds

### Browser Compatibility
- Web Audio API has good support but include fallbacks
- Test organic boundaries on various screen sizes
- Ensure responsive scaling works with new UI elements

---

## Summary Checklist

- [ ] Two-player mode with WASD/Arrow controls
- [ ] Player count selection menu
- [ ] Green dragon variant for Player 2
- [ ] Enhanced power-up graphics (icons)
- [ ] Permanent Banish power-up
- [ ] Audio system implementation
- [ ] Background music (chiptune style)
- [ ] Sound effects for all actions
- [ ] Improved invader flee dispersion
- [ ] Smart nest target selection
- [ ] Anti-camping AI behavior
- [ ] Organic island boundary shape
- [ ] Mountain Peak level (polish existing)
- [ ] Beach Paradise level
- [ ] Forest Glade level
- [ ] Crystal Cave level
- [ ] Level selection menu
- [ ] Difficulty selection (Easy/Medium/Hard)
- [ ] 50 eggs win condition
- [ ] Egg counter HUD display
- [ ] Milestone celebrations
