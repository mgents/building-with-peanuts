// ===========================================
// INPUT SYSTEM - Keyboard + Touch Joystick
// ===========================================

const Input = {
    // Unified movement vector (-1 to 1 for each axis)
    movement: { x: 0, y: 0 },

    // Keyboard state
    keys: {
        up: false,
        down: false,
        left: false,
        right: false
    },

    // Touch state
    touch: {
        active: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0
    },

    // Device detection
    isTouchDevice: false,

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

    onKeyDown(e) {
        switch(e.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.keys.up = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.keys.down = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.keys.left = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.keys.right = true;
                break;
        }
    },

    onKeyUp(e) {
        switch(e.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.keys.up = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.keys.down = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.keys.left = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.keys.right = false;
                break;
        }
    },

    onTouchStart(e) {
        e.preventDefault();

        const touch = e.touches[0];
        const pos = screenToGame(touch.clientX, touch.clientY);

        // Only activate joystick on left half of screen
        if (pos.x < GAME_WIDTH / 2) {
            this.touch.active = true;
            this.touch.startX = pos.x;
            this.touch.startY = pos.y;
            this.touch.currentX = pos.x;
            this.touch.currentY = pos.y;
        }
    },

    onTouchMove(e) {
        e.preventDefault();

        if (!this.touch.active) return;

        const touch = e.touches[0];
        const pos = screenToGame(touch.clientX, touch.clientY);

        this.touch.currentX = pos.x;
        this.touch.currentY = pos.y;
    },

    onTouchEnd(e) {
        e.preventDefault();
        this.touch.active = false;
    },

    onMouseDown(e) {
        const pos = screenToGame(e.clientX, e.clientY);

        // Only activate joystick on left half of screen
        if (pos.x < GAME_WIDTH / 2) {
            this.touch.active = true;
            this.touch.startX = pos.x;
            this.touch.startY = pos.y;
            this.touch.currentX = pos.x;
            this.touch.currentY = pos.y;
        }
    },

    onMouseMove(e) {
        if (!this.touch.active) return;

        const pos = screenToGame(e.clientX, e.clientY);
        this.touch.currentX = pos.x;
        this.touch.currentY = pos.y;
    },

    onMouseUp(e) {
        this.touch.active = false;
    },

    update() {
        // Reset movement vector
        this.movement.x = 0;
        this.movement.y = 0;

        // Process keyboard input
        if (this.keys.left) this.movement.x -= 1;
        if (this.keys.right) this.movement.x += 1;
        if (this.keys.up) this.movement.y -= 1;
        if (this.keys.down) this.movement.y += 1;

        // Normalize keyboard diagonal movement
        if (this.movement.x !== 0 && this.movement.y !== 0) {
            const length = Math.sqrt(this.movement.x * this.movement.x + this.movement.y * this.movement.y);
            this.movement.x /= length;
            this.movement.y /= length;
        }

        // Process touch/joystick input (overrides keyboard if active)
        if (this.touch.active) {
            const dx = this.touch.currentX - this.touch.startX;
            const dy = this.touch.currentY - this.touch.startY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                // Normalize to max radius
                const clampedDistance = Math.min(distance, JOYSTICK_MAX_RADIUS);
                const normalizedDistance = clampedDistance / JOYSTICK_MAX_RADIUS;

                // Apply dead zone
                if (normalizedDistance > JOYSTICK_DEAD_ZONE) {
                    const adjustedMagnitude = (normalizedDistance - JOYSTICK_DEAD_ZONE) / (1 - JOYSTICK_DEAD_ZONE);
                    this.movement.x = (dx / distance) * adjustedMagnitude;
                    this.movement.y = (dy / distance) * adjustedMagnitude;
                }
            }
        }
    }
};
