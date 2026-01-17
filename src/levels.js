// ===========================================
// LEVELS SYSTEM - Level Definitions and Backgrounds
// ===========================================

const LEVELS = {
    mountain: {
        id: 'mountain',
        name: 'Mountain Peak',
        description: 'A rocky mountain top surrounded by cold waters',
        colors: {
            sky: '#5c94fc',
            grass: '#3d8c40',
            grassLight: '#4da050',
            grassDark: '#2d6c30',
            water: '#1e3a5f',
            waterLight: '#2e5a8f',
            waterWave: '#4a8ad4',
            waterSparkle: '#8ac4ff',
            cliff: '#5a4a3a',
            cliffLight: '#7a6a5a',
            cliffDark: '#3a2a1a',
            dirt: '#6b5a3a',
            rock: ['#5a5a5a', '#6a6a6a', '#4a4a4a'],
            flower: ['#ff6b6b', '#ffeb3b', '#ffffff']
        },
        nestPositions: [
            { x: 0.25, y: 0.35 },
            { x: 0.75, y: 0.35 },
            { x: 0.5, y: 0.7 }
        ]
    },

    beach: {
        id: 'beach',
        name: 'Beach Paradise',
        description: 'A tropical island with sandy shores',
        colors: {
            sky: '#87ceeb',
            grass: '#f4d03f', // Sandy
            grassLight: '#f9e076',
            grassDark: '#d4ac0d',
            water: '#006994',
            waterLight: '#40e0d0',
            waterWave: '#48d1cc',
            waterSparkle: '#afeeee',
            cliff: '#c2b280', // Sandy cliffs
            cliffLight: '#d4c494',
            cliffDark: '#a09060',
            dirt: '#deb887',
            rock: ['#c2b280', '#d4c494', '#a09060'],
            flower: ['#ff69b4', '#ff6347', '#ffd700'] // Tropical flowers
        },
        nestPositions: [
            { x: 0.3, y: 0.3 },
            { x: 0.7, y: 0.3 },
            { x: 0.5, y: 0.65 }
        ]
    },

    forest: {
        id: 'forest',
        name: 'Forest Glade',
        description: 'A peaceful clearing in an ancient forest',
        colors: {
            sky: '#228b22',
            grass: '#228b22',
            grassLight: '#32cd32',
            grassDark: '#006400',
            water: '#2f4f4f', // Dark river
            waterLight: '#3a5f5f',
            waterWave: '#4a7f7f',
            waterSparkle: '#5f9f9f',
            cliff: '#3d2817', // Tree bark brown
            cliffLight: '#5d4037',
            cliffDark: '#2d1807',
            dirt: '#4a3728',
            rock: ['#4a4a4a', '#3a3a3a', '#5a5a5a'], // Mossy rocks
            flower: ['#9370db', '#da70d6', '#98fb98'] // Forest flowers
        },
        nestPositions: [
            { x: 0.2, y: 0.4 },
            { x: 0.8, y: 0.4 },
            { x: 0.5, y: 0.75 }
        ]
    },

    cave: {
        id: 'cave',
        name: 'Crystal Cave',
        description: 'A glowing cavern filled with crystals',
        colors: {
            sky: '#1a1a2e', // Dark cave
            grass: '#2d2d44', // Cave floor
            grassLight: '#3d3d54',
            grassDark: '#1d1d34',
            water: '#0d0d1a', // Underground lake
            waterLight: '#1a1a30',
            waterWave: '#2a2a50',
            waterSparkle: '#9370db', // Crystal glow
            cliff: '#4a3a5a', // Purple-ish rock
            cliffLight: '#6a5a7a',
            cliffDark: '#2a1a3a',
            dirt: '#3a2a4a',
            rock: ['#6a5acd', '#9370db', '#8a2be2'], // Crystal colors
            flower: ['#00ffff', '#ff00ff', '#7fff00'] // Bioluminescent
        },
        nestPositions: [
            { x: 0.25, y: 0.35 },
            { x: 0.75, y: 0.35 },
            { x: 0.5, y: 0.7 }
        ]
    }
};

const Level = {
    current: null,
    bgGenerated: false,
    bgRocks: [],
    bgGrassTufts: [],
    bgWaterSparkles: [],
    bgDecorations: [],

    load(levelId) {
        this.current = LEVELS[levelId] || LEVELS.mountain;
        this.generateBackground();
    },

    generateBackground() {
        const seed = 12345;
        let rng = seed;
        const seededRandom = () => {
            rng = (rng * 1103515245 + 12345) & 0x7fffffff;
            return rng / 0x7fffffff;
        };

        // Generate rocks
        this.bgRocks = [];
        const rockCount = 12;
        for (let i = 0; i < rockCount; i++) {
            this.bgRocks.push({
                x: 100 + seededRandom() * (GAME_WIDTH - 200),
                y: 100 + seededRandom() * (GAME_HEIGHT - 200),
                size: 6 + seededRandom() * 8,
                shade: Math.floor(seededRandom() * 3)
            });
        }

        // Generate grass tufts
        this.bgGrassTufts = [];
        const grassCount = 25;
        for (let i = 0; i < grassCount; i++) {
            this.bgGrassTufts.push({
                x: 100 + seededRandom() * (GAME_WIDTH - 200),
                y: 100 + seededRandom() * (GAME_HEIGHT - 200),
                height: 6 + seededRandom() * 6
            });
        }

        // Generate water sparkles
        this.bgWaterSparkles = [];
        for (let i = 0; i < 20; i++) {
            const side = Math.floor(seededRandom() * 4);
            let x, y;
            switch (side) {
                case 0: x = seededRandom() * 45; y = seededRandom() * GAME_HEIGHT; break;
                case 1: x = GAME_WIDTH - seededRandom() * 45; y = seededRandom() * GAME_HEIGHT; break;
                case 2: x = seededRandom() * GAME_WIDTH; y = seededRandom() * 45; break;
                case 3: x = seededRandom() * GAME_WIDTH; y = GAME_HEIGHT - seededRandom() * 45; break;
            }
            this.bgWaterSparkles.push({ x, y, phase: seededRandom() * Math.PI * 2 });
        }

        // Level-specific decorations and obstacles
        this.bgDecorations = [];
        this.bgObstacles = []; // Visual-only obstacles for atmosphere

        if (this.current.id === 'mountain') {
            // Large boulders scattered around
            for (let i = 0; i < 8; i++) {
                this.bgObstacles.push({
                    type: 'boulder',
                    x: 100 + seededRandom() * (GAME_WIDTH - 200),
                    y: 100 + seededRandom() * (GAME_HEIGHT - 200),
                    size: 18 + seededRandom() * 15,
                    shade: seededRandom()
                });
            }
            // Snow patches
            for (let i = 0; i < 6; i++) {
                this.bgDecorations.push({
                    type: 'snowpatch',
                    x: 120 + seededRandom() * (GAME_WIDTH - 240),
                    y: 120 + seededRandom() * (GAME_HEIGHT - 240),
                    size: 20 + seededRandom() * 25
                });
            }
            // Small pebbles
            for (let i = 0; i < 15; i++) {
                this.bgDecorations.push({
                    type: 'pebbles',
                    x: 100 + seededRandom() * (GAME_WIDTH - 200),
                    y: 100 + seededRandom() * (GAME_HEIGHT - 200)
                });
            }
        } else if (this.current.id === 'beach') {
            // Palm trees along edges
            for (let i = 0; i < 8; i++) {
                this.bgDecorations.push({
                    type: 'palm',
                    x: 85 + (i % 2) * (GAME_WIDTH - 170) + seededRandom() * 20,
                    y: 100 + (i * 50) + seededRandom() * 30
                });
            }
            // Shells scattered
            for (let i = 0; i < 12; i++) {
                this.bgDecorations.push({
                    type: 'shell',
                    x: 100 + seededRandom() * (GAME_WIDTH - 200),
                    y: 100 + seededRandom() * (GAME_HEIGHT - 200),
                    rotation: seededRandom() * Math.PI * 2
                });
            }
            // Starfish
            for (let i = 0; i < 5; i++) {
                this.bgDecorations.push({
                    type: 'starfish',
                    x: 120 + seededRandom() * (GAME_WIDTH - 240),
                    y: 120 + seededRandom() * (GAME_HEIGHT - 240),
                    color: ['#ff6b6b', '#ffa07a', '#ffb347'][Math.floor(seededRandom() * 3)]
                });
            }
            // Coconuts
            for (let i = 0; i < 4; i++) {
                this.bgDecorations.push({
                    type: 'coconut',
                    x: 100 + seededRandom() * (GAME_WIDTH - 200),
                    y: 100 + seededRandom() * (GAME_HEIGHT - 200)
                });
            }
        } else if (this.current.id === 'forest') {
            // Large tree stumps
            for (let i = 0; i < 5; i++) {
                this.bgObstacles.push({
                    type: 'stump',
                    x: 120 + seededRandom() * (GAME_WIDTH - 240),
                    y: 120 + seededRandom() * (GAME_HEIGHT - 240),
                    size: 18 + seededRandom() * 12
                });
            }
            // Mushroom clusters
            for (let i = 0; i < 10; i++) {
                this.bgDecorations.push({
                    type: 'mushroom',
                    x: 100 + seededRandom() * (GAME_WIDTH - 200),
                    y: 100 + seededRandom() * (GAME_HEIGHT - 200),
                    color: ['#ff6347', '#ffd700', '#9370db'][Math.floor(seededRandom() * 3)],
                    size: 4 + seededRandom() * 4
                });
            }
            // Fallen logs
            for (let i = 0; i < 3; i++) {
                this.bgObstacles.push({
                    type: 'log',
                    x: 130 + seededRandom() * (GAME_WIDTH - 260),
                    y: 130 + seededRandom() * (GAME_HEIGHT - 260),
                    length: 40 + seededRandom() * 30,
                    angle: seededRandom() * Math.PI
                });
            }
            // Ferns
            for (let i = 0; i < 8; i++) {
                this.bgDecorations.push({
                    type: 'fern',
                    x: 100 + seededRandom() * (GAME_WIDTH - 200),
                    y: 100 + seededRandom() * (GAME_HEIGHT - 200)
                });
            }
        } else if (this.current.id === 'cave') {
            // Large crystal formations
            for (let i = 0; i < 12; i++) {
                this.bgObstacles.push({
                    type: 'crystal_large',
                    x: 100 + seededRandom() * (GAME_WIDTH - 200),
                    y: 100 + seededRandom() * (GAME_HEIGHT - 200),
                    size: 12 + seededRandom() * 18,
                    color: ['#9370db', '#00ffff', '#ff00ff', '#7fff00'][Math.floor(seededRandom() * 4)],
                    angle: seededRandom() * 0.6 - 0.3
                });
            }
            // Small crystal clusters
            for (let i = 0; i < 15; i++) {
                this.bgDecorations.push({
                    type: 'crystal_small',
                    x: 100 + seededRandom() * (GAME_WIDTH - 200),
                    y: 100 + seededRandom() * (GAME_HEIGHT - 200),
                    color: ['#9370db', '#00ffff', '#ff00ff'][Math.floor(seededRandom() * 3)]
                });
            }
            // Stalagmites
            for (let i = 0; i < 6; i++) {
                this.bgObstacles.push({
                    type: 'stalagmite',
                    x: 120 + seededRandom() * (GAME_WIDTH - 240),
                    y: 120 + seededRandom() * (GAME_HEIGHT - 240),
                    size: 15 + seededRandom() * 10
                });
            }
            // Glowing pools
            for (let i = 0; i < 3; i++) {
                this.bgDecorations.push({
                    type: 'glowpool',
                    x: 150 + seededRandom() * (GAME_WIDTH - 300),
                    y: 150 + seededRandom() * (GAME_HEIGHT - 300),
                    size: 20 + seededRandom() * 15
                });
            }
        }

        this.bgGenerated = true;
    },

    render(ctx, animTime) {
        if (!this.current) return;
        const c = this.current.colors;

        // Level-specific sky with gradient
        this.renderSky(ctx, animTime, c);

        // Water borders
        this.renderWater(ctx, animTime, c);

        // Cliffs with level-specific textures
        this.renderCliffs(ctx, c);

        // Main play area with enhanced terrain
        this.renderGrass(ctx, c);

        // Level-specific atmospheric effects
        this.renderAtmosphere(ctx, animTime);

        // Decorations
        this.renderDecorations(ctx, animTime, c);
    },

    renderSky(ctx, animTime, c) {
        // High fidelity sky backgrounds for each level
        if (this.current.id === 'mountain') {
            // Epic mountain sky with distant peaks and aurora
            const skyGrad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
            skyGrad.addColorStop(0, '#1a2a4a');
            skyGrad.addColorStop(0.2, '#3a5a8a');
            skyGrad.addColorStop(0.5, '#6a9ad0');
            skyGrad.addColorStop(0.8, '#8ab4e0');
            skyGrad.addColorStop(1, '#c8dae8');
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

            // Distant snow-capped mountains
            this.renderDistantMountains(ctx, animTime);

            // Subtle aurora effect
            this.renderAurora(ctx, animTime);

            // Clouds
            this.renderClouds(ctx, animTime, 'mountain');

        } else if (this.current.id === 'beach') {
            // Tropical paradise with sunset tones
            const skyGrad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
            skyGrad.addColorStop(0, '#4a90c0');
            skyGrad.addColorStop(0.3, '#60b8e8');
            skyGrad.addColorStop(0.5, '#87ceeb');
            skyGrad.addColorStop(0.7, '#a0e0f0');
            skyGrad.addColorStop(1, '#d0f0ff');
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

            // Sun with rays
            this.renderSun(ctx, animTime);

            // Fluffy tropical clouds
            this.renderClouds(ctx, animTime, 'beach');

            // Distant islands
            this.renderDistantIslands(ctx);

            // Seagulls flying
            this.renderSeagulls(ctx, animTime);

        } else if (this.current.id === 'forest') {
            // Deep enchanted forest with light filtering through canopy
            const skyGrad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
            skyGrad.addColorStop(0, '#0a1a0a');
            skyGrad.addColorStop(0.2, '#153015');
            skyGrad.addColorStop(0.5, '#1a4a1a');
            skyGrad.addColorStop(0.8, '#2a5a2a');
            skyGrad.addColorStop(1, '#3a6a3a');
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

            // Tree canopy silhouettes at edges
            this.renderForestCanopy(ctx, animTime);

            // Light rays filtering through
            this.renderForestLightRays(ctx, animTime);

            // Fireflies
            this.renderFireflies(ctx, animTime);

        } else if (this.current.id === 'cave') {
            // Mystical crystal cave with ambient glow
            const skyGrad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
            skyGrad.addColorStop(0, '#050510');
            skyGrad.addColorStop(0.3, '#0a0a1a');
            skyGrad.addColorStop(0.5, '#10102a');
            skyGrad.addColorStop(0.7, '#15153a');
            skyGrad.addColorStop(1, '#1a1a40');
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

            // Ceiling stalactites
            this.renderCaveCeiling(ctx, animTime);

            // Ambient crystal glow
            this.renderAmbientCrystalGlow(ctx, animTime);

            // Bioluminescent spores
            this.renderBioluminescentSpores(ctx, animTime);

        } else {
            ctx.fillStyle = c.sky;
            ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        }
    },

    // Mountain level - distant peaks
    renderDistantMountains(ctx, animTime) {
        // Far distant mountains (very faded)
        ctx.fillStyle = 'rgba(100, 130, 160, 0.4)';
        ctx.beginPath();
        ctx.moveTo(0, GAME_HEIGHT * 0.6);
        ctx.lineTo(80, GAME_HEIGHT * 0.45);
        ctx.lineTo(150, GAME_HEIGHT * 0.52);
        ctx.lineTo(220, GAME_HEIGHT * 0.38);
        ctx.lineTo(300, GAME_HEIGHT * 0.48);
        ctx.lineTo(380, GAME_HEIGHT * 0.35);
        ctx.lineTo(450, GAME_HEIGHT * 0.42);
        ctx.lineTo(520, GAME_HEIGHT * 0.32);
        ctx.lineTo(600, GAME_HEIGHT * 0.4);
        ctx.lineTo(680, GAME_HEIGHT * 0.36);
        ctx.lineTo(760, GAME_HEIGHT * 0.44);
        ctx.lineTo(840, GAME_HEIGHT * 0.38);
        ctx.lineTo(920, GAME_HEIGHT * 0.5);
        ctx.lineTo(GAME_WIDTH, GAME_HEIGHT * 0.45);
        ctx.lineTo(GAME_WIDTH, GAME_HEIGHT * 0.6);
        ctx.closePath();
        ctx.fill();

        // Snow caps on distant mountains
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.moveTo(220, GAME_HEIGHT * 0.38);
        ctx.lineTo(230, GAME_HEIGHT * 0.42);
        ctx.lineTo(210, GAME_HEIGHT * 0.42);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(380, GAME_HEIGHT * 0.35);
        ctx.lineTo(395, GAME_HEIGHT * 0.40);
        ctx.lineTo(365, GAME_HEIGHT * 0.40);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(520, GAME_HEIGHT * 0.32);
        ctx.lineTo(540, GAME_HEIGHT * 0.38);
        ctx.lineTo(500, GAME_HEIGHT * 0.38);
        ctx.closePath();
        ctx.fill();
    },

    // Mountain aurora effect
    renderAurora(ctx, animTime) {
        ctx.save();
        ctx.globalAlpha = 0.15 + Math.sin(animTime * 0.3) * 0.05;
        const auroraGrad = ctx.createLinearGradient(0, 0, GAME_WIDTH, GAME_HEIGHT * 0.4);
        auroraGrad.addColorStop(0, 'rgba(100, 255, 150, 0.3)');
        auroraGrad.addColorStop(0.3, 'rgba(100, 200, 255, 0.2)');
        auroraGrad.addColorStop(0.6, 'rgba(150, 100, 255, 0.2)');
        auroraGrad.addColorStop(1, 'rgba(100, 255, 200, 0.1)');
        ctx.fillStyle = auroraGrad;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let x = 0; x <= GAME_WIDTH; x += 50) {
            const y = 80 + Math.sin(x * 0.01 + animTime * 0.5) * 30 + Math.sin(x * 0.02 + animTime * 0.3) * 20;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(GAME_WIDTH, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    },

    // Clouds for multiple levels
    renderClouds(ctx, animTime, levelType) {
        const cloudColor = levelType === 'beach' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.4)';
        const cloudPositions = [
            { x: 100, y: 60, size: 40 },
            { x: 300, y: 40, size: 55 },
            { x: 550, y: 70, size: 45 },
            { x: 750, y: 50, size: 50 },
            { x: 900, y: 80, size: 35 }
        ];

        for (const cloud of cloudPositions) {
            const x = (cloud.x + animTime * 8) % (GAME_WIDTH + 100) - 50;
            this.renderCloud(ctx, x, cloud.y, cloud.size, cloudColor);
        }
    },

    renderCloud(ctx, x, y, size, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
        ctx.arc(x + size * 0.4, y - size * 0.1, size * 0.4, 0, Math.PI * 2);
        ctx.arc(x + size * 0.8, y, size * 0.45, 0, Math.PI * 2);
        ctx.arc(x + size * 0.4, y + size * 0.2, size * 0.35, 0, Math.PI * 2);
        ctx.fill();
    },

    // Beach level - sun
    renderSun(ctx, animTime) {
        const sunX = GAME_WIDTH - 120;
        const sunY = 100;

        // Sun glow
        const glowGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 150);
        glowGrad.addColorStop(0, 'rgba(255, 240, 180, 0.8)');
        glowGrad.addColorStop(0.3, 'rgba(255, 220, 100, 0.4)');
        glowGrad.addColorStop(0.6, 'rgba(255, 200, 50, 0.1)');
        glowGrad.addColorStop(1, 'rgba(255, 180, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 150, 0, Math.PI * 2);
        ctx.fill();

        // Sun rays
        ctx.save();
        ctx.globalAlpha = 0.2 + Math.sin(animTime) * 0.05;
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + animTime * 0.1;
            ctx.strokeStyle = 'rgba(255, 230, 150, 0.3)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(sunX + Math.cos(angle) * 50, sunY + Math.sin(angle) * 50);
            ctx.lineTo(sunX + Math.cos(angle) * 120, sunY + Math.sin(angle) * 120);
            ctx.stroke();
        }
        ctx.restore();

        // Sun core
        ctx.fillStyle = '#fff8dc';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 40, 0, Math.PI * 2);
        ctx.fill();
    },

    // Beach level - distant islands
    renderDistantIslands(ctx) {
        ctx.fillStyle = 'rgba(60, 100, 80, 0.3)';
        // Island 1
        ctx.beginPath();
        ctx.moveTo(50, GAME_HEIGHT * 0.55);
        ctx.quadraticCurveTo(80, GAME_HEIGHT * 0.48, 110, GAME_HEIGHT * 0.55);
        ctx.fill();
        // Palm silhouette
        ctx.fillStyle = 'rgba(40, 80, 60, 0.3)';
        ctx.beginPath();
        ctx.moveTo(78, GAME_HEIGHT * 0.50);
        ctx.lineTo(80, GAME_HEIGHT * 0.42);
        ctx.lineTo(82, GAME_HEIGHT * 0.50);
        ctx.fill();

        // Island 2
        ctx.fillStyle = 'rgba(60, 100, 80, 0.25)';
        ctx.beginPath();
        ctx.moveTo(700, GAME_HEIGHT * 0.58);
        ctx.quadraticCurveTo(750, GAME_HEIGHT * 0.50, 800, GAME_HEIGHT * 0.58);
        ctx.fill();
    },

    // Beach level - seagulls
    renderSeagulls(ctx, animTime) {
        ctx.strokeStyle = 'rgba(80, 80, 80, 0.5)';
        ctx.lineWidth = 2;

        const birds = [
            { x: 150, y: 120, phase: 0 },
            { x: 300, y: 90, phase: 1 },
            { x: 500, y: 140, phase: 2 },
            { x: 650, y: 100, phase: 0.5 }
        ];

        for (const bird of birds) {
            const x = (bird.x + animTime * 30) % (GAME_WIDTH + 100) - 50;
            const wingFlap = Math.sin(animTime * 8 + bird.phase) * 5;

            ctx.beginPath();
            ctx.moveTo(x - 8, bird.y + wingFlap);
            ctx.quadraticCurveTo(x, bird.y - 3, x + 8, bird.y + wingFlap);
            ctx.stroke();
        }
    },

    // Forest level - canopy
    renderForestCanopy(ctx, animTime) {
        // Dark tree silhouettes at top
        ctx.fillStyle = 'rgba(10, 30, 10, 0.8)';

        // Left side canopy
        for (let i = 0; i < 5; i++) {
            const x = i * 60 - 30;
            const size = 80 + Math.sin(i * 2) * 20;
            ctx.beginPath();
            ctx.arc(x, -20, size, 0, Math.PI);
            ctx.fill();
        }

        // Right side canopy
        for (let i = 0; i < 5; i++) {
            const x = GAME_WIDTH - i * 60 + 30;
            const size = 80 + Math.cos(i * 2) * 20;
            ctx.beginPath();
            ctx.arc(x, -20, size, 0, Math.PI);
            ctx.fill();
        }

        // Hanging vines
        ctx.strokeStyle = 'rgba(30, 80, 30, 0.6)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const x = 50 + i * 130;
            const sway = Math.sin(animTime + i) * 5;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.quadraticCurveTo(x + sway, 40, x + sway * 0.5, 80 + i * 5);
            ctx.stroke();
        }
    },

    // Forest level - light rays
    renderForestLightRays(ctx, animTime) {
        ctx.save();
        ctx.globalAlpha = 0.08 + Math.sin(animTime * 0.5) * 0.02;

        for (let i = 0; i < 5; i++) {
            const x = 150 + i * 180;
            const rayGrad = ctx.createLinearGradient(x, 0, x + 60, GAME_HEIGHT);
            rayGrad.addColorStop(0, 'rgba(200, 255, 150, 0.4)');
            rayGrad.addColorStop(0.5, 'rgba(200, 255, 150, 0.1)');
            rayGrad.addColorStop(1, 'rgba(200, 255, 150, 0)');

            ctx.fillStyle = rayGrad;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + 20, 0);
            ctx.lineTo(x + 100, GAME_HEIGHT);
            ctx.lineTo(x + 40, GAME_HEIGHT);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    },

    // Forest level - fireflies
    renderFireflies(ctx, animTime) {
        for (let i = 0; i < 20; i++) {
            const x = 100 + (i * 47) % (GAME_WIDTH - 200);
            const y = 100 + (i * 31) % (GAME_HEIGHT - 200);
            const pulse = Math.sin(animTime * 3 + i * 0.7) * 0.5 + 0.5;

            if (pulse > 0.3) {
                ctx.save();
                ctx.globalAlpha = pulse * 0.8;
                ctx.fillStyle = '#ccff66';
                ctx.shadowColor = '#ccff66';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(x + Math.sin(animTime + i) * 10, y + Math.cos(animTime * 0.7 + i) * 8, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
    },

    // Cave level - ceiling stalactites
    renderCaveCeiling(ctx, animTime) {
        // Rocky ceiling
        ctx.fillStyle = 'rgba(30, 20, 40, 0.9)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 40);
        for (let x = 0; x <= GAME_WIDTH; x += 30) {
            ctx.lineTo(x, 30 + Math.sin(x * 0.05) * 15);
        }
        ctx.lineTo(GAME_WIDTH, 0);
        ctx.closePath();
        ctx.fill();

        // Stalactites
        ctx.fillStyle = 'rgba(50, 40, 70, 0.8)';
        const stalactites = [
            { x: 80, length: 50 },
            { x: 200, length: 70 },
            { x: 350, length: 45 },
            { x: 500, length: 80 },
            { x: 620, length: 55 },
            { x: 780, length: 65 },
            { x: 900, length: 40 }
        ];

        for (const stal of stalactites) {
            ctx.beginPath();
            ctx.moveTo(stal.x - 8, 0);
            ctx.lineTo(stal.x, stal.length);
            ctx.lineTo(stal.x + 8, 0);
            ctx.fill();

            // Drip effect
            const dripY = (animTime * 50 + stal.x) % (stal.length + 100);
            if (dripY < stal.length) {
                ctx.fillStyle = 'rgba(100, 150, 200, 0.5)';
                ctx.beginPath();
                ctx.ellipse(stal.x, stal.length + dripY, 2, 3, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'rgba(50, 40, 70, 0.8)';
            }
        }
    },

    // Cave level - ambient glow
    renderAmbientCrystalGlow(ctx, animTime) {
        const glowSpots = [
            { x: 100, y: 150, color: 'rgba(147, 112, 219, 0.15)', size: 100 },
            { x: 300, y: 400, color: 'rgba(0, 255, 255, 0.1)', size: 120 },
            { x: 600, y: 200, color: 'rgba(255, 0, 255, 0.08)', size: 90 },
            { x: 800, y: 500, color: 'rgba(100, 255, 200, 0.12)', size: 110 },
            { x: 500, y: 600, color: 'rgba(147, 112, 219, 0.1)', size: 130 }
        ];

        for (const glow of glowSpots) {
            const pulse = 1 + Math.sin(animTime + glow.x * 0.01) * 0.2;
            const gradient = ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, glow.size * pulse);
            gradient.addColorStop(0, glow.color);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(glow.x, glow.y, glow.size * pulse, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    // Cave level - bioluminescent spores
    renderBioluminescentSpores(ctx, animTime) {
        const colors = ['#9370db', '#00ffff', '#ff00ff', '#7fff00'];

        for (let i = 0; i < 30; i++) {
            const baseX = 80 + (i * 33) % (GAME_WIDTH - 160);
            const baseY = 80 + (i * 23) % (GAME_HEIGHT - 160);
            const floatX = Math.sin(animTime * 0.5 + i * 0.4) * 15;
            const floatY = Math.cos(animTime * 0.3 + i * 0.3) * 20;
            const pulse = Math.sin(animTime * 2 + i) * 0.5 + 0.5;

            ctx.save();
            ctx.globalAlpha = 0.4 + pulse * 0.4;
            ctx.fillStyle = colors[i % 4];
            ctx.shadowColor = colors[i % 4];
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(baseX + floatX, baseY + floatY, 1.5 + pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    },

    renderAtmosphere(ctx, animTime) {
        // Level-specific atmospheric effects
        if (this.current.id === 'mountain') {
            // Subtle snow particles
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            for (let i = 0; i < 20; i++) {
                const x = (100 + i * 45 + animTime * 20) % GAME_WIDTH;
                const y = (50 + i * 30 + animTime * 30 + Math.sin(animTime + i) * 20) % GAME_HEIGHT;
                if (x > 75 && x < GAME_WIDTH - 75 && y > 75 && y < GAME_HEIGHT - 75) {
                    ctx.beginPath();
                    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        } else if (this.current.id === 'beach') {
            // Subtle light rays from sun
            ctx.save();
            ctx.globalAlpha = 0.05;
            const rayGrad = ctx.createRadialGradient(GAME_WIDTH - 80, 80, 0, GAME_WIDTH - 80, 80, 300);
            rayGrad.addColorStop(0, '#ffffff');
            rayGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = rayGrad;
            ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
            ctx.globalAlpha = 1;
            ctx.restore();
        } else if (this.current.id === 'forest') {
            // Floating pollen/spores
            ctx.fillStyle = 'rgba(200, 255, 150, 0.5)';
            for (let i = 0; i < 15; i++) {
                const x = (80 + i * 60 + Math.sin(animTime * 0.5 + i) * 30) % (GAME_WIDTH - 160) + 80;
                const y = (80 + i * 40 + Math.cos(animTime * 0.3 + i * 0.7) * 25) % (GAME_HEIGHT - 160) + 80;
                ctx.beginPath();
                ctx.arc(x, y, 1 + Math.sin(animTime + i) * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.current.id === 'cave') {
            // Glowing particle effects
            for (let i = 0; i < 12; i++) {
                const colors = ['rgba(147, 112, 219, 0.4)', 'rgba(0, 255, 255, 0.3)', 'rgba(255, 0, 255, 0.3)'];
                ctx.fillStyle = colors[i % 3];
                const x = (100 + i * 70 + Math.sin(animTime + i * 0.8) * 40) % (GAME_WIDTH - 160) + 80;
                const y = (100 + i * 50 + Math.cos(animTime * 0.7 + i) * 35) % (GAME_HEIGHT - 160) + 80;
                const size = 2 + Math.sin(animTime * 2 + i) * 1;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }

            // Ambient glow in corners
            ctx.save();
            const glowGrad = ctx.createRadialGradient(GAME_WIDTH / 2, GAME_HEIGHT / 2, 100, GAME_WIDTH / 2, GAME_HEIGHT / 2, 400);
            glowGrad.addColorStop(0, 'rgba(147, 112, 219, 0.05)');
            glowGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = glowGrad;
            ctx.fillRect(75, 75, GAME_WIDTH - 150, GAME_HEIGHT - 150);
            ctx.restore();
        }
    },

    renderWater(ctx, animTime, c) {
        // Deep water
        ctx.fillStyle = c.water;
        ctx.fillRect(0, 0, 55, GAME_HEIGHT);
        ctx.fillRect(GAME_WIDTH - 55, 0, 55, GAME_HEIGHT);
        ctx.fillRect(0, 0, GAME_WIDTH, 55);
        ctx.fillRect(0, GAME_HEIGHT - 55, GAME_WIDTH, 55);

        // Lighter water layer
        ctx.fillStyle = c.waterLight;
        ctx.fillRect(0, 0, 50, GAME_HEIGHT);
        ctx.fillRect(GAME_WIDTH - 50, 0, 50, GAME_HEIGHT);
        ctx.fillRect(0, 0, GAME_WIDTH, 50);
        ctx.fillRect(0, GAME_HEIGHT - 50, GAME_WIDTH, 50);

        // Wave animation
        const wavePhase = Math.floor(animTime * 3) % 4;
        ctx.fillStyle = c.waterWave;

        // Left waves
        for (let y = 10; y < GAME_HEIGHT - 10; y += 20) {
            const offset = ((y + wavePhase * 5) % 20) < 10 ? 2 : 0;
            ctx.fillRect(45 + offset, y, 4, 8);
        }

        // Right waves
        for (let y = 15; y < GAME_HEIGHT - 10; y += 20) {
            const offset = ((y + wavePhase * 5) % 20) < 10 ? -2 : 0;
            ctx.fillRect(GAME_WIDTH - 49 + offset, y, 4, 8);
        }

        // Top waves
        for (let x = 60; x < GAME_WIDTH - 60; x += 25) {
            const offset = ((x + wavePhase * 5) % 25) < 12 ? 2 : 0;
            ctx.fillRect(x, 45 + offset, 12, 4);
        }

        // Bottom waves
        for (let x = 70; x < GAME_WIDTH - 60; x += 25) {
            const offset = ((x + wavePhase * 5) % 25) < 12 ? -2 : 0;
            ctx.fillRect(x, GAME_HEIGHT - 49 + offset, 12, 4);
        }

        // Water sparkles
        ctx.fillStyle = c.waterSparkle;
        for (const sparkle of this.bgWaterSparkles) {
            const visible = Math.sin(animTime * 2 + sparkle.phase) > 0.5;
            if (visible) {
                ctx.fillRect(Math.floor(sparkle.x), Math.floor(sparkle.y), 3, 3);
            }
        }
    },

    renderCliffs(ctx, c) {
        // Main cliff color
        ctx.fillStyle = c.cliff;
        ctx.fillRect(50, 0, 25, GAME_HEIGHT);
        ctx.fillRect(GAME_WIDTH - 75, 0, 25, GAME_HEIGHT);
        ctx.fillRect(0, 50, GAME_WIDTH, 25);
        ctx.fillRect(0, GAME_HEIGHT - 75, GAME_WIDTH, 25);

        // Highlights
        ctx.fillStyle = c.cliffLight;
        for (let y = 20; y < GAME_HEIGHT - 20; y += 40) {
            ctx.fillRect(55, y, 8, 15);
        }
        for (let y = 35; y < GAME_HEIGHT - 20; y += 40) {
            ctx.fillRect(GAME_WIDTH - 63, y, 8, 15);
        }
        for (let x = 80; x < GAME_WIDTH - 80; x += 50) {
            ctx.fillRect(x, 55, 20, 8);
        }
        for (let x = 100; x < GAME_WIDTH - 80; x += 50) {
            ctx.fillRect(x, GAME_HEIGHT - 63, 20, 8);
        }

        // Shadows
        ctx.fillStyle = c.cliffDark;
        for (let y = 30; y < GAME_HEIGHT - 30; y += 60) {
            ctx.fillRect(68, y, 5, 12);
        }
        for (let y = 50; y < GAME_HEIGHT - 30; y += 60) {
            ctx.fillRect(GAME_WIDTH - 73, y, 5, 12);
        }

        // Corners
        ctx.fillStyle = c.cliff;
        ctx.fillRect(50, 50, 25, 25);
        ctx.fillRect(GAME_WIDTH - 75, 50, 25, 25);
        ctx.fillRect(50, GAME_HEIGHT - 75, 25, 25);
        ctx.fillRect(GAME_WIDTH - 75, GAME_HEIGHT - 75, 25, 25);
    },

    renderGrass(ctx, c) {
        // Base grass
        ctx.fillStyle = c.grass;
        ctx.fillRect(75, 75, GAME_WIDTH - 150, GAME_HEIGHT - 150);

        // Checkerboard pattern
        ctx.fillStyle = c.grassLight;
        const tileSize = 32;
        for (let x = 75; x < GAME_WIDTH - 75; x += tileSize * 2) {
            for (let y = 75; y < GAME_HEIGHT - 75; y += tileSize * 2) {
                ctx.fillRect(x, y, tileSize, tileSize);
                ctx.fillRect(x + tileSize, y + tileSize, tileSize, tileSize);
            }
        }

        // Darker patches
        ctx.fillStyle = c.grassDark;
        for (let x = 100; x < GAME_WIDTH - 100; x += 80) {
            for (let y = 100; y < GAME_HEIGHT - 100; y += 80) {
                ctx.fillRect(x, y, 16, 16);
            }
        }

        // Border edge
        ctx.fillStyle = c.dirt;
        ctx.fillRect(75, 75, GAME_WIDTH - 150, 6);
        ctx.fillRect(75, GAME_HEIGHT - 81, GAME_WIDTH - 150, 6);
        ctx.fillRect(75, 75, 6, GAME_HEIGHT - 150);
        ctx.fillRect(GAME_WIDTH - 81, 75, 6, GAME_HEIGHT - 150);
    },

    renderDecorations(ctx, animTime, c) {
        // Render obstacles first (they appear behind other elements)
        for (const obs of this.bgObstacles) {
            switch (obs.type) {
                case 'boulder':
                    this.renderBoulder(ctx, obs.x, obs.y, obs.size, obs.shade);
                    break;
                case 'stump':
                    this.renderTreeStump(ctx, obs.x, obs.y, obs.size);
                    break;
                case 'log':
                    this.renderLog(ctx, obs.x, obs.y, obs.length, obs.angle);
                    break;
                case 'crystal_large':
                    this.renderCrystal(ctx, obs.x, obs.y, obs.size, obs.color, obs.angle, animTime);
                    break;
                case 'stalagmite':
                    this.renderStalagmite(ctx, obs.x, obs.y, obs.size);
                    break;
            }
        }

        // Rocks
        for (const rock of this.bgRocks) {
            ctx.fillStyle = c.rock[rock.shade];
            const size = Math.floor(rock.size);
            ctx.fillRect(Math.floor(rock.x), Math.floor(rock.y), size, size - 2);
            ctx.fillStyle = c.rock[0];
            ctx.fillRect(Math.floor(rock.x), Math.floor(rock.y), size - 2, 3);
        }

        // Grass tufts
        ctx.fillStyle = c.grassDark;
        for (const tuft of this.bgGrassTufts) {
            const x = Math.floor(tuft.x);
            const y = Math.floor(tuft.y);
            const h = Math.floor(tuft.height);
            ctx.fillRect(x, y - h, 2, h);
            ctx.fillRect(x + 3, y - h + 2, 2, h - 2);
            ctx.fillRect(x - 2, y - h + 3, 2, h - 3);
        }

        // Flowers
        let flowerIndex = 0;
        for (let x = 150; x < GAME_WIDTH - 150; x += 120) {
            for (let y = 150; y < GAME_HEIGHT - 150; y += 100) {
                ctx.fillStyle = c.flower[flowerIndex % 3];
                ctx.fillRect(x, y, 4, 4);
                ctx.fillStyle = c.grassDark;
                ctx.fillRect(x + 1, y + 4, 2, 4);
                flowerIndex++;
            }
        }

        // Level-specific decorations
        for (const dec of this.bgDecorations) {
            switch (dec.type) {
                case 'palm':
                    this.renderPalmTree(ctx, dec.x, dec.y);
                    break;
                case 'stump':
                    this.renderTreeStump(ctx, dec.x, dec.y, dec.size);
                    break;
                case 'mushroom':
                    this.renderMushroom(ctx, dec.x, dec.y, dec.color, dec.size);
                    break;
                case 'crystal':
                case 'crystal_small':
                    this.renderSmallCrystal(ctx, dec.x, dec.y, dec.color, animTime);
                    break;
                case 'snowpatch':
                    this.renderSnowPatch(ctx, dec.x, dec.y, dec.size);
                    break;
                case 'pebbles':
                    this.renderPebbles(ctx, dec.x, dec.y);
                    break;
                case 'shell':
                    this.renderShell(ctx, dec.x, dec.y, dec.rotation);
                    break;
                case 'starfish':
                    this.renderStarfish(ctx, dec.x, dec.y, dec.color);
                    break;
                case 'coconut':
                    this.renderCoconut(ctx, dec.x, dec.y);
                    break;
                case 'fern':
                    this.renderFern(ctx, dec.x, dec.y);
                    break;
                case 'glowpool':
                    this.renderGlowPool(ctx, dec.x, dec.y, dec.size, animTime);
                    break;
            }
        }
    },

    renderPalmTree(ctx, x, y) {
        // Trunk
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(x - 3, y, 6, 25);
        // Leaves
        ctx.fillStyle = '#228b22';
        ctx.beginPath();
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x - 15, y + 5);
        ctx.lineTo(x, y);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x + 15, y + 5);
        ctx.lineTo(x, y);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x, y - 8);
        ctx.lineTo(x - 10, y - 15);
        ctx.lineTo(x, y - 3);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x, y - 8);
        ctx.lineTo(x + 10, y - 15);
        ctx.lineTo(x, y - 3);
        ctx.fill();
    },

    renderTreeStump(ctx, x, y, size) {
        ctx.fillStyle = '#4a3728';
        ctx.beginPath();
        ctx.ellipse(x, y, size, size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#5d4037';
        ctx.beginPath();
        ctx.ellipse(x, y - 3, size - 3, (size - 3) * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        // Rings
        ctx.strokeStyle = '#3d2817';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(x, y - 3, size * 0.5, size * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
    },

    renderMushroom(ctx, x, y, color) {
        // Stem
        ctx.fillStyle = '#f5f5dc';
        ctx.fillRect(x - 2, y, 4, 6);
        // Cap
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x, y, 6, 4, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        // Spots
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 3, y - 2, 2, 2);
        ctx.fillRect(x + 1, y - 1, 2, 2);
    },

    renderCrystal(ctx, x, y, size, color, angle, animTime) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Glow effect
        const glowIntensity = 0.3 + Math.sin(animTime * 2) * 0.2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10 * glowIntensity;

        // Crystal shape
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.4, 0);
        ctx.lineTo(0, size * 0.3);
        ctx.lineTo(-size * 0.4, 0);
        ctx.closePath();
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.moveTo(-size * 0.1, -size * 0.7);
        ctx.lineTo(size * 0.15, -size * 0.3);
        ctx.lineTo(-size * 0.05, -size * 0.2);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.restore();
    },

    // Mountain decorations
    renderBoulder(ctx, x, y, size, shade) {
        ctx.save();
        ctx.translate(x, y);

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(3, size * 0.3, size * 0.9, size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Main boulder shape (irregular)
        const baseColor = shade > 0.5 ? '#6a6a6a' : '#5a5a5a';
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.moveTo(-size * 0.8, 0);
        ctx.quadraticCurveTo(-size * 0.9, -size * 0.5, -size * 0.3, -size * 0.7);
        ctx.quadraticCurveTo(size * 0.2, -size * 0.8, size * 0.7, -size * 0.4);
        ctx.quadraticCurveTo(size * 0.9, 0, size * 0.6, size * 0.3);
        ctx.quadraticCurveTo(0, size * 0.4, -size * 0.8, 0);
        ctx.fill();

        // Highlight
        ctx.fillStyle = '#8a8a8a';
        ctx.beginPath();
        ctx.ellipse(-size * 0.2, -size * 0.4, size * 0.3, size * 0.2, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Cracks/details
        ctx.strokeStyle = '#4a4a4a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-size * 0.1, -size * 0.3);
        ctx.lineTo(size * 0.2, size * 0.1);
        ctx.stroke();

        ctx.restore();
    },

    renderSnowPatch(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x, y);

        // Main snow patch
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.ellipse(0, 0, size, size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sparkle highlights
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(-size * 0.3, -size * 0.1, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(size * 0.2, size * 0.1, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    renderPebbles(ctx, x, y) {
        const colors = ['#7a7a7a', '#8a8a8a', '#6a6a6a'];
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = colors[i % 3];
            ctx.beginPath();
            ctx.arc(x + (i % 2) * 8 - 4, y + Math.floor(i / 2) * 6 - 3, 2 + (i % 2), 0, Math.PI * 2);
            ctx.fill();
        }
    },

    // Beach decorations
    renderShell(ctx, x, y, rotation) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);

        // Shell shape (spiral)
        ctx.fillStyle = '#ffe4c4';
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shell ridges
        ctx.strokeStyle = '#deb887';
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, 2 + i * 1.5, -0.5, Math.PI + 0.5);
            ctx.stroke();
        }

        // Inner highlight
        ctx.fillStyle = '#fff5ee';
        ctx.beginPath();
        ctx.ellipse(-2, -1, 2, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    renderStarfish(ctx, x, y, color) {
        ctx.save();
        ctx.translate(x, y);

        ctx.fillStyle = color;

        // Draw 5-pointed star
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
            ctx.beginPath();
            ctx.ellipse(
                Math.cos(angle) * 6,
                Math.sin(angle) * 6,
                4, 2,
                angle,
                0, Math.PI * 2
            );
            ctx.fill();
        }

        // Center
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        // Highlight dots
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * 4, Math.sin(angle) * 4, 1, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    },

    renderCoconut(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(2, 4, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Coconut body
        ctx.fillStyle = '#8b4513';
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();

        // Coconut texture (three dots pattern)
        ctx.fillStyle = '#5d3a1a';
        ctx.beginPath();
        ctx.arc(-2, -1, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(2, -1, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 2, 2, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(-3, -3, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    // Forest decorations
    renderLog(ctx, x, y, length, angle) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(3, 5, length / 2 + 2, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Log body
        ctx.fillStyle = '#5d4037';
        ctx.beginPath();
        ctx.roundRect(-length / 2, -6, length, 12, 6);
        ctx.fill();

        // Bark texture
        ctx.strokeStyle = '#3d2817';
        ctx.lineWidth = 1;
        for (let i = -length / 2 + 10; i < length / 2 - 5; i += 12) {
            ctx.beginPath();
            ctx.moveTo(i, -4);
            ctx.lineTo(i + 3, 4);
            ctx.stroke();
        }

        // End rings
        ctx.fillStyle = '#8b7355';
        ctx.beginPath();
        ctx.ellipse(-length / 2, 0, 5, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(length / 2, 0, 5, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ring details
        ctx.strokeStyle = '#5d4037';
        ctx.beginPath();
        ctx.ellipse(-length / 2, 0, 3, 4, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(length / 2, 0, 3, 4, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    },

    renderFern(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);

        ctx.strokeStyle = '#228b22';
        ctx.lineWidth = 2;

        // Draw multiple fronds
        for (let f = 0; f < 5; f++) {
            const baseAngle = (f / 5) * Math.PI - Math.PI / 2;

            ctx.beginPath();
            ctx.moveTo(0, 0);

            // Main stem
            const stemLength = 12 + f % 2 * 4;
            const endX = Math.cos(baseAngle) * stemLength;
            const endY = Math.sin(baseAngle) * stemLength;
            ctx.lineTo(endX, endY);
            ctx.stroke();

            // Leaflets
            ctx.lineWidth = 1;
            for (let i = 1; i <= 3; i++) {
                const t = i / 4;
                const px = Math.cos(baseAngle) * stemLength * t;
                const py = Math.sin(baseAngle) * stemLength * t;

                // Left leaflet
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(px + Math.cos(baseAngle - 1) * 4, py + Math.sin(baseAngle - 1) * 4);
                ctx.stroke();

                // Right leaflet
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(px + Math.cos(baseAngle + 1) * 4, py + Math.sin(baseAngle + 1) * 4);
                ctx.stroke();
            }
            ctx.lineWidth = 2;
        }

        ctx.restore();
    },

    // Cave decorations
    renderSmallCrystal(ctx, x, y, color, animTime) {
        ctx.save();
        ctx.translate(x, y);

        // Subtle glow
        const glowIntensity = 0.2 + Math.sin(animTime * 3 + x) * 0.1;
        ctx.shadowColor = color;
        ctx.shadowBlur = 5 * glowIntensity;

        ctx.fillStyle = color;

        // Small crystal cluster (3 crystals)
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI - Math.PI / 2 + 0.3;
            const size = 4 + i * 2;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * 2, Math.sin(angle) * 2);
            ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size - 3);
            ctx.lineTo(Math.cos(angle) * size + 2, Math.sin(angle) * size);
            ctx.closePath();
            ctx.fill();
        }

        ctx.shadowBlur = 0;
        ctx.restore();
    },

    renderStalagmite(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x, y);

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(2, size * 0.3, size * 0.5, size * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Main stalagmite
        ctx.fillStyle = '#4a3a5a';
        ctx.beginPath();
        ctx.moveTo(-size * 0.4, size * 0.2);
        ctx.quadraticCurveTo(-size * 0.3, -size * 0.5, 0, -size);
        ctx.quadraticCurveTo(size * 0.3, -size * 0.5, size * 0.4, size * 0.2);
        ctx.closePath();
        ctx.fill();

        // Highlight edge
        ctx.fillStyle = '#6a5a7a';
        ctx.beginPath();
        ctx.moveTo(-size * 0.2, size * 0.1);
        ctx.quadraticCurveTo(-size * 0.15, -size * 0.4, 0, -size * 0.8);
        ctx.lineTo(size * 0.05, -size * 0.7);
        ctx.quadraticCurveTo(-size * 0.1, -size * 0.3, -size * 0.1, size * 0.1);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    },

    renderGlowPool(ctx, x, y, size, animTime) {
        ctx.save();
        ctx.translate(x, y);

        // Animated glow intensity
        const pulse = 0.5 + Math.sin(animTime * 1.5) * 0.3;

        // Outer glow
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
        gradient.addColorStop(0, `rgba(147, 112, 219, ${0.6 * pulse})`);
        gradient.addColorStop(0.5, `rgba(147, 112, 219, ${0.3 * pulse})`);
        gradient.addColorStop(1, 'rgba(147, 112, 219, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, size, size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright core
        ctx.fillStyle = `rgba(200, 180, 255, ${0.8 * pulse})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.4, size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sparkle particles
        ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
        for (let i = 0; i < 4; i++) {
            const sparkleAngle = animTime + (i / 4) * Math.PI * 2;
            const sparkleR = size * 0.5;
            ctx.beginPath();
            ctx.arc(
                Math.cos(sparkleAngle) * sparkleR * 0.6,
                Math.sin(sparkleAngle) * sparkleR * 0.4,
                1.5,
                0, Math.PI * 2
            );
            ctx.fill();
        }

        ctx.restore();
    },

    getNestPositions() {
        if (!this.current) return [];
        return this.current.nestPositions.map(pos => ({
            x: pos.x * GAME_WIDTH,
            y: pos.y * GAME_HEIGHT
        }));
    }
};
