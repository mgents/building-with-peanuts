// ===========================================
// CANVAS SETUP AND SCALING
// ===========================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let canvasScale = 1;
let canvasOffsetX = 0;
let canvasOffsetY = 0;

function setupCanvas() {
    const dpr = window.devicePixelRatio || 1;

    // Set internal resolution
    canvas.width = GAME_WIDTH * dpr;
    canvas.height = GAME_HEIGHT * dpr;

    // Scale context for DPR
    ctx.scale(dpr, dpr);

    resizeCanvas();
}

function resizeCanvas() {
    const aspectRatio = GAME_WIDTH / GAME_HEIGHT;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Maintain aspect ratio
    if (width / height > aspectRatio) {
        width = height * aspectRatio;
    } else {
        height = width / aspectRatio;
    }

    // Apply visual size
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    // Calculate scale for input translation
    canvasScale = width / GAME_WIDTH;

    // Calculate offset (canvas is centered)
    canvasOffsetX = (window.innerWidth - width) / 2;
    canvasOffsetY = (window.innerHeight - height) / 2;
}

// Convert screen coordinates to game coordinates
function screenToGame(screenX, screenY) {
    return {
        x: (screenX - canvasOffsetX) / canvasScale,
        y: (screenY - canvasOffsetY) / canvasScale
    };
}

// Initialize canvas on load
window.addEventListener('resize', resizeCanvas);
setupCanvas();
