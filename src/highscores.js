// ===========================================
// HIGHSCORES SYSTEM - Server-based Score Storage
// ===========================================

const Highscores = {
    // API endpoint
    API_URL: '/api/highscores',

    // Cache for scores (to avoid excessive API calls)
    cachedScores: null,
    cacheTime: 0,
    CACHE_DURATION: 5000, // 5 seconds cache

    // Maximum number of highscores to display
    MAX_SCORES: 9,

    // Load highscores from server (with fallback to direct JSON file)
    async load() {
        // Check cache first
        const now = Date.now();
        if (this.cachedScores && (now - this.cacheTime) < this.CACHE_DURATION) {
            return this.cachedScores;
        }

        // Try API endpoint first
        try {
            const response = await fetch(this.API_URL);
            if (response.ok) {
                const scores = await response.json();
                this.cachedScores = scores;
                this.cacheTime = now;
                return scores;
            }
        } catch (e) {
            console.warn('Failed to load highscores from API:', e);
        }

        // Fallback: try loading directly from JSON file
        try {
            const response = await fetch('/highscores.json');
            if (response.ok) {
                const scores = await response.json();
                this.cachedScores = scores;
                this.cacheTime = now;
                console.log('Loaded highscores from JSON file');
                return scores;
            }
        } catch (e) {
            console.warn('Failed to load highscores from JSON file:', e);
        }

        // Return cached or empty if all methods fail
        return this.cachedScores || [];
    },

    // Synchronous version for rendering (uses cache)
    // Returns only top MAX_SCORES entries
    getAll() {
        // Trigger async load in background if not loaded yet
        if (this.cachedScores === null) {
            this.load();
        }
        // Return only top MAX_SCORES, sorted by score descending
        const scores = this.cachedScores || [];
        return scores
            .sort((a, b) => b.score - a.score)
            .slice(0, this.MAX_SCORES);
    },

    // Add a new score and return its rank (1-based), or 0 if not in top scores
    async addScore(name, score, difficulty, level, eggsDelivered, gameTime) {
        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name.substring(0, 10).toUpperCase(),
                    score: score,
                    difficulty: difficulty,
                    level: level,
                    eggsDelivered: eggsDelivered,
                    gameTime: gameTime
                })
            });

            if (response.ok) {
                const result = await response.json();
                // Update cache with new scores
                this.cachedScores = result.scores;
                this.cacheTime = Date.now();
                return result.rank;
            }
        } catch (e) {
            console.warn('Failed to save highscore to server:', e);
        }

        return 0;
    },

    // Check if a score qualifies for the highscore list
    isHighscore(score) {
        const scores = this.getAll();
        if (scores.length < this.MAX_SCORES) {
            return true;
        }
        // Check if score beats the lowest score in the list
        const lowestScore = scores[scores.length - 1]?.score || 0;
        return score > lowestScore;
    },

    // Format time for display
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    // Format date for display
    formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleDateString();
    },

    // Initialize - preload scores
    init() {
        this.load();
    }
};

// Preload highscores when script loads
Highscores.init();
