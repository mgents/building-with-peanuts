# Dragon Nest Defender — Gameplay Spec (V1, Build-Safe)

This document captures the **full, end-to-end gameplay design** for **Dragon Nest Defender (V1)** so there’s minimal interpretation during the build and less bug-fixing later.

---

## 1) High-level concept

**Fantasy:** You are a **young dragon** protecting a **magical island nursery**. Eggs can roll away, nests can be damaged, and invaders try to harass the nests. You keep the island calm by saving eggs, repairing nests, and scaring invaders away.

**Platform:** 2D **browser game** that runs in the browser.

**Controls:** Works on **desktop (keyboard)** and **iPad (touch + virtual joystick)**.

---

## 2) Win/Lose conditions

### Win
- **Win when:** **Calm Meter** reaches **100**.

### Lose
- **Lose when:** **Danger Meter** reaches **100**.

Both meters are always visible on the HUD.

---

## 3) World, camera, and play area

### Camera / view
- **Top-down** 2D view.
- **Single-screen arena** (no scrolling camera).

### Layout (recommended)
- **2–3 nests** placed far enough apart to create movement.
- A **Wild Zone** (edges/corners) where invaders spawn.
- Optional: **Repair Stones** (1–2 spots) that can speed repair later, but **not required for V1**.

---

## 4) Player (dragon) controls and movement

### Input abstraction (important)
All input sources must produce the same **movement vector**:

- Desktop: **WASD / Arrow keys**
- iPad: **virtual joystick** (left side of screen)

### Virtual joystick rules (iPad)
- Joystick returns a vector `(x, y)` where each component is in `[-1..1]`.
- Apply a **dead zone**:
  - If vector length `< 0.15`, treat as `(0, 0)`.
- Normalize diagonals and scale by speed.

### Keyboard rules (desktop)
- Convert key presses into `(x, y)`.
- Normalize diagonals so diagonal speed is not faster than cardinal directions.

### Movement constants (recommended)
- Base speed: `S`
- Carrying egg speed: `0.85 * S`
- Optional power-up speed boost: `1.3 * S` for the boost duration

### Movement stability
Use simple, stable movement:
1. Compute desired velocity from input vector.
2. Apply velocity to propose a new position.
3. Resolve collisions (push-out) so moving entities do not overlap.
4. Clamp within world boundaries.

---

## 5) Collision shapes and overlap prevention (no ambiguity)

Use **circles** for all moving entities to keep collisions reliable.

### Radii (recommended)
- Dragon: **18**
- Invader: **16**
- Egg (when on ground): **10**
- Nest: **22** (static)

### Rule: no overlaps after resolution
- After each update step, **moving circles must not overlap**.
- If overlaps occur, push them apart along the shortest separation vector.

### Invader separation (to avoid clumping)
- Add a small **soft repulsion** when invaders are too close, so they spread naturally and don’t stack.

---

## 6) Eggs: pickup, carrying, deposit, cracking

### Dragon carry state
- `carrying = None` or `carrying = eggId`

### Egg pickup
- Condition: dragon intersects egg AND `carrying == None`
- Result:
  - Egg is removed from world (no longer collides)
  - `carrying = eggId`
  - Dragon speed becomes `0.85 * S`

### Egg deposit into nest
- Condition: dragon intersects ANY nest AND `carrying != None`
- Result:
  - `carrying = None`
  - **Calm +8**
  - **Score +10** (if score is implemented)
  - **Danger -2** (small relief)

### Egg drop on hit (carrying penalty)
- If dragon is carrying and is hit by an invader:
  - Egg drops at dragon position.
  - Egg gains a **1-second safety grace** (cannot be instantly re-hit/knocked).
  - **Danger +4**
  - `carrying = None`

### Egg cracking (urgency mechanic)
Eggs on the ground have a risk timer:
- If an egg is on the ground for **10 seconds** without being picked up or deposited:
  - Egg cracks and disappears
  - **Danger +10**
  - Optional: crack animation + sad sound

---

## 7) Nests: health, damage, and repair

### Nest health
Each nest has:
- `health` from **0..100`

### Nest state labels (for visuals only)
- Healthy: **70–100**
- Damaged: **30–69**
- Critical: **0–29**

### Invader harassment = nest damage
If an invader is within nest radius:
- Nest health decreases **-8 per second**
- Danger increases **+2 per second** (per invader harassing)

### Repair (clear and interruptible)
If dragon is within nest radius:
- Repair occurs at **+12 per second**
- Repair stops immediately if dragon moves away or is hit.

**Anti-frustration rule:** Dragon **can repair while carrying an egg** (just slower movement).

---

## 8) Invaders (NPCs): “clever” behavior with simple rules

Invaders run a small finite-state machine so they feel intentional.

### Invader states
1. **Seek Nest**
2. **Harass Nest**
3. **Flee (Scared)**
4. **Recover / Re-route**

### Seek Nest (target selection)
- Choose target nest using:
  1. Prefer the **most damaged** nest (lowest health).
  2. If tie, choose the **closest** nest.

Then move toward the target.

### Harass Nest
- If within nest radius:
  - Stop moving (or lightly circle).
  - Apply damage + danger rules (see Nest section).

### Flee (Scared)
Triggered by:
- **Touch scare** (recommended for V1): dragon intersects invader
- Optional later: Puff button

Flee behavior:
- Move away from dragon at **1.25x speed** for **2 seconds**
- Cannot harass nests while fleeing

### Recover / Re-route
- After fleeing ends:
  - Pause **0.5 seconds**
  - Choose a new target nest and return to Seek

### Preventing unnatural overlaps
- Invaders use circle collision resolution.
- Add soft separation to prevent piles.

---

## 9) Difficulty progression (gradual, intended)

V1 uses a **phase system based on Calm Meter** so difficulty ramps naturally.

### Core difficulty lever (V1)
- **Increase invader spawn rate over time**
- Also increase **max invaders** by phase

### Phases (based on Calm)
**Phase 1 (Calm 0–30): onboarding**
- Max invaders: **2**
- Spawn interval: **8–10s**
- Max eggs on ground: **1**

**Phase 2 (Calm 31–60): real game**
- Max invaders: **4**
- Spawn interval: **6–8s**
- Max eggs on ground: **2**

**Phase 3 (Calm 61–90): pressure**
- Max invaders: **6**
- Spawn interval: **4–6s**
- Max eggs on ground: **3**
- Target selection weights damaged nests more strongly

**Phase 4 (Calm 91–100): final push**
- Max invaders: **7**
- Spawn interval: **3–5s**
- Optional simple event every 15s: “storm pulse” spawns +1 egg (still respecting max egg limit)

**Rule:** Do **not** add new enemy types in V1.

---

## 10) Meters and tuning values (exact)

### Calm Meter (0–100)
- **+8** per egg delivered
- **+10** when a repair crosses from Damaged → Healthy (health reaches 70+)
- **+3** per scare event (first scare per invader per 5 seconds)

**Win at:** 100

### Danger Meter (0–100)
- **+2 per second** per invader harassing a nest
- **+10** when an egg cracks
- **+4** if dragon is hit while carrying (egg drop penalty)
- **-2** per egg delivered
- **-1** per full repair completion (or per meaningful repair milestone)

**Lose at:** 100

---

## 11) Power-ups (V1: keep it clean)

### Drop rule
- Every time the player completes **3 successful actions** (egg delivered OR full repair OR scare):
  - **30% chance** to spawn a power-up
- Only **one power-up** may exist on the map at a time.

### V1 power-ups (3 total)
1. **Wing Boost (5s)**  
   - Speed = **1.3x**
2. **Big Scare (instant)**  
   - All invaders enter Flee for **2 seconds**
3. **Nest Shield (10s)**  
   - Nests cannot take damage during the duration

**Rule:** Only one power-up effect active at a time.

---

## 12) UI flow and screens (simple, kid-friendly)

### Game states
- `MENU`
- `INSTRUCTIONS`
- `PLAYING`
- `WIN`
- `LOSE`

### Menu screen
- Title
- Big **Start** button

### Instructions screen (9-year-old simple text)
**HOW TO PLAY**
- Move with joystick / arrows
- Pick up eggs and bring them to nests
- Stop invaders from reaching nests
- Don’t let the red Danger bar fill up
- Fill the green Calm bar to win

Big **Play** button

### HUD (during play)
- Calm bar (green)
- Danger bar (red)
- Optional: score
- Mute button

### End screens
- Win: “Island Safe!” + Restart + Menu
- Lose: “Oh no!” + Restart + Menu

---

## 13) “No surprises” build order (recommended)

Build in this order to reduce bugs:
1. Input vector (keyboard + joystick)
2. Dragon movement + boundary clamp
3. Nests (static placement)
4. Egg spawn + pickup + deposit
5. Invader Seek → Harass loop
6. Collision resolution (push-out) + invader separation
7. Nest health + repair
8. Calm/Danger meters
9. Phases (max invaders + spawn intervals + max eggs)
10. Power-ups
11. UI states + screens

---

## 14) Locked decision for V1 (to avoid scope creep)

**Scare mechanic:** Use **Touch Scare** in V1  
- Dragon touching an invader triggers flee  
- No action button required

(You can add a “Puff” action in V2 if desired.)

---

## 15) MVP scope summary (one-day friendly)

- 1 invader type
- 2–3 nests
- Eggs: pickup, carry, deposit, crack timer
- Nest: health + repair
- Calm win + Danger lose
- Phase-based spawn scaling
- 3 power-ups
- Menu + Instructions + Start + Win/Lose screens
- Desktop + iPad joystick support

---

**End of spec.**
