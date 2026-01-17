// ===========================================
// INPUT SYSTEM - Keyboard + Touch Joystick (Two-Player Support)
// ===========================================

const Input = {
    // Player 1 movement vector (WASD)
    p1Movement: { x: 0, y: 0 },

    // Player 2 movement vector (Arrow Keys)
    p2Movement: { x: 0, y: 0 },

    // Legacy single-player alias
    get movement() { return this.p1Movement; },

    // Player 1 keyboard state (WASD)
    p1Keys: {
        up: false,
        down: false,
        left: false,
        right: false
    },

    // Player 2 keyboard state (Arrow Keys)
    p2Keys: {
        up: false,
        down: false,
        left: false,
        right: false
    },

    // Touch state for Player 1 (left side joystick)
    p1Touch: {
        active: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0
    },

    // Touch state for Player 2 (right side joystick) - for two-player touch mode
    p2Touch: {
        active: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0
    },

    // Device detection
    isTouchDevice: false,

    // Two-player mode flag
    twoPlayerMode: false,

    init() {
        // Detect touch device
        this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

        // Keyboard events
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));

        // Touch events
        canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        canvas.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });
        canvas.addEventListener('touchcancel', (e) => this.onTouchEnd(e), { passive: false });

        // Mouse events (for testing joystick on desktop)
        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        canvas.addEventListener('mouseleave', (e) => this.onMouseUp(e));
    },

    setTwoPlayerMode(enabled) {
        this.twoPlayerMode = enabled;
    },

    onKeyDown(e) {
        // Player 1 - WASD
        switch(e.code) {
            case 'KeyW':
                this.p1Keys.up = true;
                break;
            case 'KeyS':
                this.p1Keys.down = true;
                break;
            case 'KeyA':
                this.p1Keys.left = true;
                break;
            case 'KeyD':
                this.p1Keys.right = true;
                break;
        }

        // Player 2 - Arrow Keys
        switch(e.code) {
            case 'ArrowUp':
                this.p2Keys.up = true;
                break;
            case 'ArrowDown':
                this.p2Keys.down = true;
                break;
            case 'ArrowLeft':
                this.p2Keys.left = true;
                break;
            case 'ArrowRight':
                this.p2Keys.right = true;
                break;
        }

        // In single player mode, arrow keys also control P1
        if (!this.twoPlayerMode) {
            switch(e.code) {
                case 'ArrowUp':
                    this.p1Keys.up = true;
                    break;
                case 'ArrowDown':
                    this.p1Keys.down = true;
                    break;
                case 'ArrowLeft':
                    this.p1Keys.left = true;
                    break;
                case 'ArrowRight':
                    this.p1Keys.right = true;
                    break;
            }
        }
    },

    onKeyUp(e) {
        // Player 1 - WASD
        switch(e.code) {
            case 'KeyW':
                this.p1Keys.up = false;
                break;
            case 'KeyS':
                this.p1Keys.down = false;
                break;
            case 'KeyA':
                this.p1Keys.left = false;
                break;
            case 'KeyD':
                this.p1Keys.right = false;
                break;
        }

        // Player 2 - Arrow Keys
        switch(e.code) {
            case 'ArrowUp':
                this.p2Keys.up = false;
                break;
            case 'ArrowDown':
                this.p2Keys.down = false;
                break;
            case 'ArrowLeft':
                this.p2Keys.left = false;
                break;
            case 'ArrowRight':
                this.p2Keys.right = false;
                break;
        }

        // In single player mode, arrow keys also control P1
        if (!this.twoPlayerMode) {
            switch(e.code) {
                case 'ArrowUp':
                    this.p1Keys.up = false;
                    break;
                case 'ArrowDown':
                    this.p1Keys.down = false;
                    break;
                case 'ArrowLeft':
                    this.p1Keys.left = false;
                    break;
                case 'ArrowRight':
                    this.p1Keys.right = false;
                    break;
            }
        }
    },

    onTouchStart(e) {
        e.preventDefault();

        for (let i = 0; i < e.touches.length; i++) {
            const touch = e.touches[i];
            const pos = screenToGame(touch.clientX, touch.clientY);

            if (this.twoPlayerMode) {
                // Two-player mode: left half = P1, right half = P2
                if (pos.x < GAME_WIDTH / 2) {
                    if (!this.p1Touch.active) {
                        this.p1Touch.active = true;
                        this.p1Touch.identifier = touch.identifier;
                        this.p1Touch.startX = pos.x;
                        this.p1Touch.startY = pos.y;
                        this.p1Touch.currentX = pos.x;
                        this.p1Touch.currentY = pos.y;
                    }
                } else {
                    if (!this.p2Touch.active) {
                        this.p2Touch.active = true;
                        this.p2Touch.identifier = touch.identifier;
                        this.p2Touch.startX = pos.x;
                        this.p2Touch.startY = pos.y;
                        this.p2Touch.currentX = pos.x;
                        this.p2Touch.currentY = pos.y;
                    }
                }
            } else {
                // Single player mode: left half of screen only
                if (pos.x < GAME_WIDTH / 2) {
                    this.p1Touch.active = true;
                    this.p1Touch.identifier = touch.identifier;
                    this.p1Touch.startX = pos.x;
                    this.p1Touch.startY = pos.y;
                    this.p1Touch.currentX = pos.x;
                    this.p1Touch.currentY = pos.y;
                }
            }
        }
    },

    onTouchMove(e) {
        e.preventDefault();

        for (let i = 0; i < e.touches.length; i++) {
            const touch = e.touches[i];
            const pos = screenToGame(touch.clientX, touch.clientY);

            if (this.p1Touch.active && touch.identifier === this.p1Touch.identifier) {
                this.p1Touch.currentX = pos.x;
                this.p1Touch.currentY = pos.y;
            }

            if (this.p2Touch.active && touch.identifier === this.p2Touch.identifier) {
                this.p2Touch.currentX = pos.x;
                this.p2Touch.currentY = pos.y;
            }
        }
    },

    onTouchEnd(e) {
        e.preventDefault();

        // Check which touches ended
        const activeTouches = new Set();
        for (let i = 0; i < e.touches.length; i++) {
            activeTouches.add(e.touches[i].identifier);
        }

        if (this.p1Touch.active && !activeTouches.has(this.p1Touch.identifier)) {
            this.p1Touch.active = false;
        }

        if (this.p2Touch.active && !activeTouches.has(this.p2Touch.identifier)) {
            this.p2Touch.active = false;
        }
    },

    onMouseDown(e) {
        const pos = screenToGame(e.clientX, e.clientY);

        if (this.twoPlayerMode) {
            // In two-player mode, mouse controls whoever's side it's on
            if (pos.x < GAME_WIDTH / 2) {
                this.p1Touch.active = true;
                this.p1Touch.startX = pos.x;
                this.p1Touch.startY = pos.y;
                this.p1Touch.currentX = pos.x;
                this.p1Touch.currentY = pos.y;
            } else {
                this.p2Touch.active = true;
                this.p2Touch.startX = pos.x;
                this.p2Touch.startY = pos.y;
                this.p2Touch.currentX = pos.x;
                this.p2Touch.currentY = pos.y;
            }
        } else {
            // Single player: only left half activates joystick
            if (pos.x < GAME_WIDTH / 2) {
                this.p1Touch.active = true;
                this.p1Touch.startX = pos.x;
                this.p1Touch.startY = pos.y;
                this.p1Touch.currentX = pos.x;
                this.p1Touch.currentY = pos.y;
            }
        }
    },

    onMouseMove(e) {
        const pos = screenToGame(e.clientX, e.clientY);

        if (this.p1Touch.active) {
            this.p1Touch.currentX = pos.x;
            this.p1Touch.currentY = pos.y;
        }

        if (this.p2Touch.active) {
            this.p2Touch.currentX = pos.x;
            this.p2Touch.currentY = pos.y;
        }
    },

    onMouseUp(e) {
        this.p1Touch.active = false;
        this.p2Touch.active = false;
    },

    // Calculate movement from keys and touch for a player
    calculateMovement(keys, touch) {
        let x = 0;
        let y = 0;

        // Process keyboard input
        if (keys.left) x -= 1;
        if (keys.right) x += 1;
        if (keys.up) y -= 1;
        if (keys.down) y += 1;

        // Normalize keyboard diagonal movement
        if (x !== 0 && y !== 0) {
            const length = Math.sqrt(x * x + y * y);
            x /= length;
            y /= length;
        }

        // Process touch/joystick input (overrides keyboard if active)
        if (touch.active) {
            const dx = touch.currentX - touch.startX;
            const dy = touch.currentY - touch.startY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                const clampedDistance = Math.min(distance, JOYSTICK_MAX_RADIUS);
                const normalizedDistance = clampedDistance / JOYSTICK_MAX_RADIUS;

                if (normalizedDistance > JOYSTICK_DEAD_ZONE) {
                    const adjustedMagnitude = (normalizedDistance - JOYSTICK_DEAD_ZONE) / (1 - JOYSTICK_DEAD_ZONE);
                    x = (dx / distance) * adjustedMagnitude;
                    y = (dy / distance) * adjustedMagnitude;
                }
            }
        }

        return { x, y };
    },

    update() {
        // Update Player 1 movement
        this.p1Movement = this.calculateMovement(this.p1Keys, this.p1Touch);

        // Update Player 2 movement (only in two-player mode)
        if (this.twoPlayerMode) {
            this.p2Movement = this.calculateMovement(this.p2Keys, this.p2Touch);
        } else {
            this.p2Movement = { x: 0, y: 0 };
        }
    },

    // Get touch state for joystick rendering
    getP1Touch() {
        return this.p1Touch;
    },

    getP2Touch() {
        return this.p2Touch;
    }
};
