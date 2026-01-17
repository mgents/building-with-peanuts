// ===========================================
// AUDIO SYSTEM - Sound Effects and Music
// ===========================================

const Audio = {
    context: null,
    initialized: false,
    musicVolume: 0.3,
    sfxVolume: 0.5,
    musicPlaying: false,
    menuMusicPlaying: false,
    musicEnabled: false,
    musicOscillators: [],

    // HTML5 Audio element for menu music
    menuMusicAudio: null,

    init() {
        if (this.initialized) return;

        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;

            // Initialize menu music audio element
            this.menuMusicAudio = new window.Audio('assets/Dragon Nest Defenders (Loading Loop).mp3');
            this.menuMusicAudio.loop = true;
            this.menuMusicAudio.volume = this.musicVolume;
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    },

    resume() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    },

    // Create a simple oscillator-based sound
    createTone(frequency, duration, type = 'square', volume = 0.3) {
        if (!this.context) return;

        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);

        gainNode.gain.setValueAtTime(volume * this.sfxVolume, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + duration);
    },

    // Play multi-tone sequence for more complex sounds
    playSequence(notes, interval = 0.1) {
        if (!this.context) return;

        notes.forEach((note, index) => {
            setTimeout(() => {
                this.createTone(note.freq, note.duration || 0.15, note.type || 'square', note.volume || 0.3);
            }, index * interval * 1000);
        });
    },

    // Sound effect definitions
    playMenuSelect() {
        this.createTone(440, 0.1, 'square', 0.2);
    },

    playGameStart() {
        this.playSequence([
            { freq: 262, duration: 0.1 },
            { freq: 330, duration: 0.1 },
            { freq: 392, duration: 0.1 },
            { freq: 523, duration: 0.2 }
        ], 0.1);
    },

    playEggPickup() {
        this.createTone(600, 0.1, 'sine', 0.25);
        setTimeout(() => this.createTone(800, 0.1, 'sine', 0.2), 50);
    },

    playEggDeliver() {
        this.playSequence([
            { freq: 523, duration: 0.1, type: 'sine' },
            { freq: 659, duration: 0.1, type: 'sine' },
            { freq: 784, duration: 0.15, type: 'sine' }
        ], 0.08);
    },

    playEggCrack() {
        this.createTone(150, 0.2, 'sawtooth', 0.3);
        setTimeout(() => this.createTone(100, 0.15, 'sawtooth', 0.25), 100);
    },

    playInvaderScared() {
        this.createTone(800, 0.05, 'sawtooth', 0.2);
        setTimeout(() => this.createTone(400, 0.1, 'sawtooth', 0.15), 50);
    },

    playNestDamage() {
        this.createTone(100, 0.15, 'square', 0.25);
    },

    playPowerUpSpawn() {
        this.playSequence([
            { freq: 400, duration: 0.08, type: 'sine' },
            { freq: 500, duration: 0.08, type: 'sine' },
            { freq: 600, duration: 0.08, type: 'sine' },
            { freq: 700, duration: 0.12, type: 'sine' }
        ], 0.06);
    },

    playPowerUpCollect() {
        this.playSequence([
            { freq: 523, duration: 0.1, type: 'square' },
            { freq: 659, duration: 0.1, type: 'square' },
            { freq: 784, duration: 0.1, type: 'square' },
            { freq: 1047, duration: 0.2, type: 'square' }
        ], 0.07);
    },

    playWingBoost() {
        this.createTone(300, 0.1, 'sine', 0.2);
        setTimeout(() => this.createTone(450, 0.15, 'sine', 0.25), 80);
    },

    playBigScare() {
        // Roar effect
        this.createTone(150, 0.3, 'sawtooth', 0.4);
        this.createTone(200, 0.25, 'sawtooth', 0.3);
        setTimeout(() => this.createTone(100, 0.2, 'sawtooth', 0.35), 150);
    },

    playNestShield() {
        this.playSequence([
            { freq: 400, duration: 0.15, type: 'sine', volume: 0.25 },
            { freq: 500, duration: 0.15, type: 'sine', volume: 0.25 },
            { freq: 600, duration: 0.2, type: 'sine', volume: 0.3 }
        ], 0.1);
    },

    playPermanentBanish() {
        // Vortex/whoosh effect
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.createTone(600 - i * 50, 0.08, 'sine', 0.2 - i * 0.02);
            }, i * 40);
        }
    },

    playWin() {
        this.playSequence([
            { freq: 523, duration: 0.15, type: 'square' },
            { freq: 523, duration: 0.15, type: 'square' },
            { freq: 523, duration: 0.15, type: 'square' },
            { freq: 659, duration: 0.3, type: 'square' },
            { freq: 587, duration: 0.15, type: 'square' },
            { freq: 523, duration: 0.15, type: 'square' },
            { freq: 587, duration: 0.15, type: 'square' },
            { freq: 659, duration: 0.4, type: 'square' }
        ], 0.15);
    },

    playLose() {
        this.playSequence([
            { freq: 392, duration: 0.3, type: 'sawtooth', volume: 0.25 },
            { freq: 349, duration: 0.3, type: 'sawtooth', volume: 0.25 },
            { freq: 330, duration: 0.3, type: 'sawtooth', volume: 0.25 },
            { freq: 262, duration: 0.5, type: 'sawtooth', volume: 0.3 }
        ], 0.25);
    },

    playMilestone() {
        this.playSequence([
            { freq: 523, duration: 0.1, type: 'square' },
            { freq: 659, duration: 0.1, type: 'square' },
            { freq: 784, duration: 0.15, type: 'square' },
            { freq: 1047, duration: 0.25, type: 'square' }
        ], 0.08);
    },

    // Background music - simple chiptune loop
    startMusic() {
        if (!this.context || this.musicPlaying || !this.musicEnabled) return;
        this.stopMenuMusic(); // Stop menu music when game starts
        this.musicPlaying = true;
        this.playMusicLoop();
    },

    stopMusic() {
        this.musicPlaying = false;
        this.musicOscillators.forEach(osc => {
            try { osc.stop(); } catch (e) {}
        });
        this.musicOscillators = [];
    },

    playMusicLoop() {
        if (!this.musicPlaying || !this.context || !this.musicEnabled) return;

        // Simple melody pattern
        const melody = [
            { freq: 262, duration: 0.2 }, // C
            { freq: 294, duration: 0.2 }, // D
            { freq: 330, duration: 0.2 }, // E
            { freq: 294, duration: 0.2 }, // D
            { freq: 262, duration: 0.4 }, // C
            { freq: 196, duration: 0.2 }, // G (low)
            { freq: 220, duration: 0.2 }, // A
            { freq: 262, duration: 0.4 }, // C
        ];

        const loopDuration = melody.reduce((sum, note) => sum + note.duration, 0) * 1000 + 200;

        melody.forEach((note, index) => {
            const startTime = melody.slice(0, index).reduce((sum, n) => sum + n.duration, 0);
            setTimeout(() => {
                if (this.musicPlaying && this.musicEnabled) {
                    this.createTone(note.freq, note.duration * 0.9, 'triangle', this.musicVolume * 0.5);
                }
            }, startTime * 1000);
        });

        // Loop
        setTimeout(() => this.playMusicLoop(), loopDuration);
    },

    // Menu music - MP3 file
    startMenuMusic() {
        if (!this.menuMusicAudio || this.menuMusicPlaying || !this.musicEnabled) return;
        this.menuMusicPlaying = true;
        this.menuMusicAudio.currentTime = 0;
        this.menuMusicAudio.volume = this.musicVolume;
        this.menuMusicAudio.play().catch(e => {
            console.warn('Menu music play failed:', e);
            this.menuMusicPlaying = false;
        });
    },

    stopMenuMusic() {
        this.menuMusicPlaying = false;
        if (this.menuMusicAudio) {
            this.menuMusicAudio.pause();
            this.menuMusicAudio.currentTime = 0;
        }
    },

    // Toggle music on/off
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (!this.musicEnabled) {
            this.stopMusic();
            this.stopMenuMusic();
        }
        return this.musicEnabled;
    },

    isMusicEnabled() {
        return this.musicEnabled;
    },

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.menuMusicAudio) {
            this.menuMusicAudio.volume = this.musicVolume;
        }
    },

    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
};
