// ===========================================
// HIGHSCORES SYSTEM - Combined Local + Server Storage
// ===========================================

const Highscores = {
    // API endpoint
    API_URL: '/api/highscores',

    // Local storage key
    LOCAL_STORAGE_KEY: 'dragonNestDefenderHighscores',

    // Cache for combined scores
    cachedScores: null,
    cacheTime: 0,
    CACHE_DURATION: 5000, // 5 seconds cache

    // Maximum number of highscores to DISPLAY (but save all)
    MAX_DISPLAY: 10,

    // Load and combine scores from all sources
    async load() {
        const now = Date.now();

        // Check cache first
        if (this.cachedScores && (now - this.cacheTime) < this.CACHE_DURATION) {
            return this.cachedScores;
        }

        let allScores = [];

        // 1. Load from localStorage first (always available)
        const localScores = this.loadFromLocalStorage();
        allScores = [...localScores];

        // 2. Try API endpoint
        try {
            const response = await fetch(this.API_URL);
            if (response.ok) {
                const apiScores = await response.json();
                allScores = this.mergeScores(allScores, apiScores);
            }
        } catch (e) {
            console.warn('Failed to load highscores from API:', e);
        }

        // 3. Fallback: try loading from static JSON file
        try {
            const response = await fetch('/highscores.json');
            if (response.ok) {
                const jsonScores = await response.json();
                allScores = this.mergeScores(allScores, jsonScores);
            }
        } catch (e) {
            console.warn('Failed to load highscores from JSON file:', e);
        }

        // Sort by score descending and cache ALL scores
        allScores.sort((a, b) => b.score - a.score);
        this.cachedScores = allScores;
        this.cacheTime = now;

        // Save merged scores to localStorage for persistence
        this.saveToLocalStorage(allScores);

        return allScores;
    },

    // Merge two score arrays, removing duplicates based on name+score+level+difficulty
    // This prevents the same game result from appearing multiple times
    mergeScores(scores1, scores2) {
        const merged = [...scores1];
        const existingKeys = new Set(
            scores1.map(s => `${s.name}-${s.score}-${s.level}-${s.difficulty}`)
        );

        for (const score of scores2) {
            const key = `${score.name}-${score.score}-${score.level}-${score.difficulty}`;
            if (!existingKeys.has(key)) {
                merged.push(score);
                existingKeys.add(key);
            }
        }

        return merged;
    },

    // Load scores from localStorage
    loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem(this.LOCAL_STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Failed to load from localStorage:', e);
        }
        return [];
    },

    // Save scores to localStorage (save ALL, not just top 10)
    saveToLocalStorage(scores) {
        try {
            localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(scores));
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
        }
    },

    // Synchronous version for rendering - returns only top MAX_DISPLAY
    getAll() {
        // Trigger async load in background if not loaded yet
        if (this.cachedScores === null) {
            this.load();
            // Also try to load from localStorage immediately for instant display
            const localScores = this.loadFromLocalStorage();
            if (localScores.length > 0) {
                this.cachedScores = localScores.sort((a, b) => b.score - a.score);
            }
        }

        // Return only top MAX_DISPLAY scores for display
        const scores = this.cachedScores || [];
        return scores
            .sort((a, b) => b.score - a.score)
            .slice(0, this.MAX_DISPLAY);
    },

    // Add a new score - saves to ALL storage locations
    async addScore(name, score, difficulty, level, eggsDelivered, gameTime) {
        const entry = {
            name: name.substring(0, 10).toUpperCase(),
            score: score,
            difficulty: difficulty,
            level: level,
            eggsDelivered: eggsDelivered,
            gameTime: gameTime,
            date: new Date().toISOString()
        };

        // 1. Add to local cache immediately
        if (!this.cachedScores) {
            this.cachedScores = [];
        }
        this.cachedScores.push(entry);
        this.cachedScores.sort((a, b) => b.score - a.score);

        // 2. Save ALL scores to localStorage
        this.saveToLocalStorage(this.cachedScores);

        // 3. Try to save to API (for cross-device sync)
        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(entry)
            });

            if (response.ok) {
                const result = await response.json();
                // Merge API response with local cache
                if (result.scores) {
                    this.cachedScores = this.mergeScores(this.cachedScores, result.scores);
                    this.cachedScores.sort((a, b) => b.score - a.score);
                    this.saveToLocalStorage(this.cachedScores);
                }
                return result.rank || this.getRank(entry);
            }
        } catch (e) {
            console.warn('Failed to save highscore to server:', e);
        }

        // Return local rank if API failed
        return this.getRank(entry);
    },

    // Get rank of a score entry
    getRank(entry) {
        const scores = this.cachedScores || [];
        for (let i = 0; i < scores.length; i++) {
            if (scores[i].name === entry.name &&
                scores[i].score === entry.score &&
                scores[i].date === entry.date) {
                return i + 1;
            }
        }
        return 0;
    },

    // Check if a score qualifies for the top display list
    isHighscore(score) {
        const displayedScores = this.getAll();
        if (displayedScores.length < this.MAX_DISPLAY) {
            return true;
        }
        // Check if score beats the lowest displayed score
        const lowestScore = displayedScores[displayedScores.length - 1]?.score || 0;
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

    // Initialize - preload scores from all sources
    init() {
        this.load();
    }
};

// Preload highscores when script loads
Highscores.init();
