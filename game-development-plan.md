# Dragon Nest Defender - Game Development Plan

Based on the gameplay spec v1, this document outlines the complete build plan with cross-platform browser compatibility considerations.

---

## Technology Choice

**Vanilla JavaScript + HTML5 Canvas** is the chosen framework.

| Requirement | Support |
|-------------|---------|
| Runs in browser (PC/Mac/iPad) | Native support, no plugins |
| Keyboard input (WASD/Arrows) | `keydown`/`keyup` events |
| Touch input (iPad joystick) | `touchstart`/`touchmove`/`touchend` |
| 2D rendering | Canvas 2D context is optimized for this |
| 60fps game loop | `requestAnimationFrame` |
| No installation required | Just open HTML file or URL |

### Why Not Other Frameworks?

| Framework | Verdict |
|-----------|---------|
| Phaser.js | Overkill for this scope, adds 1MB+ dependency |
| PixiJS | WebGL-focused, unnecessary for simple 2D |
| Unity WebGL | Heavy build size, slow load times on mobile |
| TypeScript | Optional enhancement, adds build step complexity |

---

## Project Structure

```
/dragon-nest-defender
├── index.html              # Entry point with meta tags for mobile
├── style.css               # Full-screen, no-scroll styles
├── src/
│   ├── main.js             # Game loop with requestAnimationFrame
│   ├── constants.js        # Tuning values + canvas dimensions
│   ├── input.js            # Unified keyboard + touch input
│   ├── canvas.js           # Scaling, DPR handling, resize
│   ├── entities/
│   │   ├── Dragon.js
│   │   ├── Nest.js
│   │   ├── Egg.js
│   │   ├── Invader.js
│   │   └── PowerUp.js
│   ├── systems/
│   │   ├── collision.js
│   │   ├── spawner.js
│   │   └── meters.js
│   └── ui/
│       ├── screens.js
│       ├── hud.js
│       └── joystick.js     # Virtual joystick rendering + logic
└── assets/
    ├── images/
    └── sounds/
```

---

## Build Phases

### Phase 1: Project Setup
1. Initialize project structure (HTML, CSS, JS)
2. Set up canvas rendering context with DPR support
3. Create game loop with fixed timestep (60fps target)
4. Define constants file for all tuning values from spec
5. Add mobile viewport meta tags and touch-action CSS

### Phase 2: Input System (Spec Section 4)
1. Create input abstraction layer that outputs normalized `(x, y)` vector
2. Implement keyboard handler (WASD + Arrow keys)
   - Normalize diagonal movement
3. Implement virtual joystick for iPad
   - Dead zone threshold (< 0.15 = zero)
   - Touch start/move/end handlers with `preventDefault()`
   - Visual joystick rendering (left side of screen)
   - Dynamic origin positioning based on touch start location

### Phase 3: Player (Dragon) Movement (Spec Section 4)
1. Create Dragon entity with position, velocity, radius (18)
2. Apply movement vector × base speed
3. Implement carrying state speed penalty (0.85×)
4. Boundary clamping to arena edges
5. Basic dragon sprite/placeholder rendering

### Phase 4: World & Nests (Spec Sections 3, 7)
1. Define arena dimensions (single-screen, no scroll)
   - Internal resolution: 1024×768 (4:3 aspect ratio)
2. Create Nest entity class
   - Position, radius (22), health (0-100)
   - Visual states: Healthy (70-100), Damaged (30-69), Critical (0-29)
3. Place 2-3 nests with adequate spacing
4. Implement repair mechanic (+12/sec when dragon in range)

### Phase 5: Eggs (Spec Section 6)
1. Create Egg entity with position, radius (10)
2. Spawn system respecting max eggs per phase
3. Pickup logic (dragon intersects + not carrying)
4. Deposit logic (dragon intersects nest + carrying)
5. Crack timer (10 seconds → Danger +10, egg destroyed)
6. Drop-on-hit with 1-second grace period

### Phase 6: Invaders (Spec Section 8)
1. Create Invader entity with position, radius (16)
2. Implement state machine:
   - **Seek Nest**: Target most damaged (or closest on tie)
   - **Harass Nest**: Stop at nest, deal damage (-8 hp/sec)
   - **Flee**: Move away from dragon at 1.25× speed for 2s
   - **Recover**: Pause 0.5s, then re-target
3. Touch scare trigger (dragon intersects invader → Flee)
4. Spawning from Wild Zone (edges/corners)

### Phase 7: Collision System (Spec Section 5)
1. Circle-circle collision detection
2. Push-out resolution (no overlaps after frame)
3. Invader soft repulsion (prevent clumping)
4. Dragon-invader collision triggers scare + egg drop if carrying

### Phase 8: Meters & Win/Lose (Spec Sections 2, 10)
1. **Calm Meter** (0-100):
   - +8 egg delivered
   - +10 repair crosses to Healthy
   - +3 per scare (rate-limited per invader)
   - Win at 100
2. **Danger Meter** (0-100):
   - +2/sec per harassing invader
   - +10 egg crack
   - +4 egg drop on hit
   - -2 egg delivered
   - -1 full repair
   - Lose at 100

### Phase 9: Difficulty Phases (Spec Section 9)
1. Track current phase based on Calm value
2. **Phase 1 (Calm 0-30)**: 2 max invaders, 8-10s spawn, 1 max egg
3. **Phase 2 (Calm 31-60)**: 4 max invaders, 6-8s spawn, 2 max eggs
4. **Phase 3 (Calm 61-90)**: 6 max invaders, 4-6s spawn, 3 max eggs
5. **Phase 4 (Calm 91-100)**: 7 max invaders, 3-5s spawn

### Phase 10: Power-ups (Spec Section 11)
1. Track successful actions counter (3 actions → 30% spawn chance)
2. Only one power-up on map at a time
3. Implement 3 power-ups:
   - **Wing Boost**: 1.3× speed for 5s
   - **Big Scare**: All invaders flee for 2s
   - **Nest Shield**: Nests immune to damage for 10s
4. Only one effect active at a time

### Phase 11: UI & Screens (Spec Section 12)
1. Game state machine: MENU → INSTRUCTIONS → PLAYING → WIN/LOSE
2. **Menu Screen**: Title + Start button
3. **Instructions Screen**: Simple rules + Play button
4. **HUD**: Calm bar (green), Danger bar (red), mute button
5. **Win Screen**: "Island Safe!" + Restart/Menu
6. **Lose Screen**: "Oh no!" + Restart/Menu

### Phase 12: Polish & Testing
1. Add placeholder/simple art for all entities
2. Add sound effects with iOS audio unlock workaround
3. Test on desktop (keyboard) - Chrome, Firefox, Safari, Edge
4. Test on iPad (touch + joystick) - Safari
5. Balance tuning adjustments
6. Bug fixes and edge case handling

---

## Cross-Platform Technical Requirements

### 1. HTML Meta Tags for Mobile
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
```

### 2. CSS for Full-Screen Play
```css
html, body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    touch-action: none;
    position: fixed;
    width: 100%;
    height: 100%;
    background: #000;
}

canvas {
    display: block;
    margin: auto;
}
```

### 3. Touch + Mouse Coexistence
```javascript
canvas.addEventListener('touchstart', handleTouch, { passive: false });
canvas.addEventListener('mousedown', handleMouse);

function handleTouch(e) {
    e.preventDefault(); // Critical for iPad - prevents scroll/zoom
}
```

### 4. Responsive Canvas Scaling
```javascript
function resizeCanvas() {
    const aspectRatio = 4 / 3;
    let width = window.innerWidth;
    let height = window.innerHeight;

    if (width / height > aspectRatio) {
        width = height * aspectRatio;
    } else {
        height = width / aspectRatio;
    }

    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
}
window.addEventListener('resize', resizeCanvas);
```

### 5. Device Pixel Ratio (Retina Displays)
```javascript
const dpr = window.devicePixelRatio || 1;
canvas.width = GAME_WIDTH * dpr;
canvas.height = GAME_HEIGHT * dpr;
canvas.style.width = GAME_WIDTH + 'px';
canvas.style.height = GAME_HEIGHT + 'px';
ctx.scale(dpr, dpr);
```

### 6. Virtual Joystick Positioning
```javascript
// Joystick origin is set dynamically on touch start (left half of screen)
let joystickOrigin = null;

function onTouchStart(e) {
    const touch = e.touches[0];
    if (touch.clientX < canvas.width / 2) {
        joystickOrigin = { x: touch.clientX, y: touch.clientY };
    }
}
```

### 7. iOS Audio Unlock
```javascript
let audioUnlocked = false;

function unlockAudio() {
    if (audioUnlocked) return;
    const silence = new Audio();
    silence.play().then(() => {
        audioUnlocked = true;
    }).catch(() => {});
}

canvas.addEventListener('touchstart', unlockAudio, { once: true });
canvas.addEventListener('click', unlockAudio, { once: true });
```

---

## Game Constants (from Spec)

### Canvas
```javascript
const GAME_WIDTH = 1024;
const GAME_HEIGHT = 768;
```

### Entity Radii
```javascript
const DRAGON_RADIUS = 18;
const INVADER_RADIUS = 16;
const EGG_RADIUS = 10;
const NEST_RADIUS = 22;
```

### Movement Speeds
```javascript
const DRAGON_BASE_SPEED = 200;        // pixels per second
const DRAGON_CARRY_MULTIPLIER = 0.85;
const DRAGON_BOOST_MULTIPLIER = 1.3;
const INVADER_SPEED = 80;
const INVADER_FLEE_MULTIPLIER = 1.25;
```

### Timers
```javascript
const EGG_CRACK_TIME = 10000;         // 10 seconds
const INVADER_FLEE_DURATION = 2000;   // 2 seconds
const INVADER_RECOVER_PAUSE = 500;    // 0.5 seconds
const EGG_GRACE_PERIOD = 1000;        // 1 second after drop
```

### Meter Values
```javascript
// Calm increases
const CALM_EGG_DELIVERED = 8;
const CALM_REPAIR_TO_HEALTHY = 10;
const CALM_SCARE = 3;

// Danger increases
const DANGER_HARASS_PER_SEC = 2;
const DANGER_EGG_CRACK = 10;
const DANGER_EGG_DROP = 4;

// Danger decreases
const DANGER_EGG_DELIVERED = -2;
const DANGER_FULL_REPAIR = -1;
```

### Nest Health
```javascript
const NEST_MAX_HEALTH = 100;
const NEST_DAMAGE_PER_SEC = 8;
const NEST_REPAIR_PER_SEC = 12;
const NEST_HEALTHY_THRESHOLD = 70;
const NEST_DAMAGED_THRESHOLD = 30;
```

### Phase Configuration
```javascript
const PHASES = [
    { calmMin: 0,  calmMax: 30,  maxInvaders: 2, spawnInterval: [8000, 10000], maxEggs: 1 },
    { calmMin: 31, calmMax: 60,  maxInvaders: 4, spawnInterval: [6000, 8000],  maxEggs: 2 },
    { calmMin: 61, calmMax: 90,  maxInvaders: 6, spawnInterval: [4000, 6000],  maxEggs: 3 },
    { calmMin: 91, calmMax: 100, maxInvaders: 7, spawnInterval: [3000, 5000],  maxEggs: 3 }
];
```

### Power-ups
```javascript
const POWERUP_ACTION_THRESHOLD = 3;
const POWERUP_SPAWN_CHANCE = 0.3;
const WING_BOOST_DURATION = 5000;
const BIG_SCARE_DURATION = 2000;
const NEST_SHIELD_DURATION = 10000;
```

---

## MVP Scope Summary

- 1 invader type
- 2-3 nests
- Eggs: pickup, carry, deposit, crack timer
- Nest: health + repair
- Calm win + Danger lose
- Phase-based spawn scaling
- 3 power-ups
- Menu + Instructions + Start + Win/Lose screens
- Desktop keyboard + iPad touch/joystick support

---

**End of development plan.**
