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

    // Calculate offset (canvas is horizontally centered, top-aligned)
    canvasOffsetX = (window.innerWidth - width) / 2;
    canvasOffsetY = 0; // Canvas is top-aligned now

    // Update canvas top margin to vertically center on larger screens
    // but stay at top on mobile to avoid issues with dynamic viewport
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isMobile && window.innerHeight > height) {
        const topMargin = (window.innerHeight - height) / 2;
        canvas.style.top = topMargin + 'px';
        canvasOffsetY = topMargin;
    } else {
        canvas.style.top = '0px';
        canvasOffsetY = 0;
    }
}

// Convert screen coordinates to game coordinates
function screenToGame(screenX, screenY) {
    // Use getBoundingClientRect for accurate canvas position
    // This handles all CSS transforms and positioning correctly
    const rect = canvas.getBoundingClientRect();
    return {
        x: (screenX - rect.left) / canvasScale,
        y: (screenY - rect.top) / canvasScale
    };
}

// Initialize canvas on load
window.addEventListener('resize', resizeCanvas);
setupCanvas();
