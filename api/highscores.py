"""
Vercel Serverless Function for Dragon Nest Defender Highscores
Handles GET and POST requests to /api/highscores
"""

from http.server import BaseHTTPRequestHandler
import json
import os
from datetime import datetime

# No limit on stored scores - save ALL scores
# Only the client decides how many to display
MAX_STORED_SCORES = 100  # Reasonable limit for in-memory storage

# Use Vercel KV or environment variable for persistence
# For simple demo, we'll use a JSON file approach with fallback
# Note: Vercel serverless functions are stateless, so we need external storage

def get_scores_from_env():
    """Get scores from environment variable (for Vercel)"""
    scores_json = os.environ.get('HIGHSCORES_DATA', '[]')
    try:
        return json.loads(scores_json)
    except:
        return []

def get_default_scores():
    """Return default scores when no persistence is available"""
    return [
        {"name": "VIAFAR", "score": 2269, "difficulty": "medium", "level": "cave", "eggsDelivered": 50, "gameTime": 208, "date": "2026-01-18T04:51:46.989778"},
        {"name": "VIALEO", "score": 2007, "difficulty": "medium", "level": "beach", "eggsDelivered": 42, "gameTime": 292, "date": "2026-01-17T21:38:47.089058"},
        {"name": "FARMOR", "score": 1842, "difficulty": "medium", "level": "mountain", "eggsDelivered": 41, "gameTime": 185, "date": "2026-01-17T22:25:44.988510"},
        {"name": "LEOFAR", "score": 1806, "difficulty": "medium", "level": "cave", "eggsDelivered": 45, "gameTime": 238, "date": "2026-01-17T21:18:36.370374"},
        {"name": "FAR", "score": 1741, "difficulty": "hard", "level": "cave", "eggsDelivered": 41, "gameTime": 227, "date": "2026-01-17T21:33:04.031147"},
        {"name": "FAR", "score": 1482, "difficulty": "medium", "level": "beach", "eggsDelivered": 22, "gameTime": 221, "date": "2026-01-17T22:17:52.971592"},
        {"name": "FAR", "score": 1327, "difficulty": "easy", "level": "mountain", "eggsDelivered": 30, "gameTime": 162, "date": "2026-01-17T21:00:24.534319"},
        {"name": "VIALEO", "score": 1198, "difficulty": "hard", "level": "beach", "eggsDelivered": 27, "gameTime": 194, "date": "2026-01-17T21:43:21.410195"}
    ]

# In-memory storage for the current deployment instance
# Note: This will reset when the function cold starts
_scores_cache = None

def load_scores():
    """Load scores from available storage"""
    global _scores_cache

    if _scores_cache is not None:
        return _scores_cache

    # Try environment variable first
    scores = get_scores_from_env()
    if scores:
        _scores_cache = scores
        return scores

    # Fall back to default scores
    _scores_cache = get_default_scores()
    return _scores_cache

def save_scores(scores):
    """Save scores (in-memory for serverless)"""
    global _scores_cache
    _scores_cache = scores
    # Note: In a production app, you'd save to a database like Vercel KV,
    # Supabase, or similar persistent storage

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Handle GET /api/highscores - return current highscores"""
        scores = load_scores()

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(scores).encode('utf-8'))

    def do_POST(self):
        """Handle POST /api/highscores - add new score"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            new_score = json.loads(post_data.decode('utf-8'))

            # Validate required fields
            required = ['name', 'score', 'difficulty', 'level']
            if not all(field in new_score for field in required):
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Missing required fields'}).encode('utf-8'))
                return

            # Sanitize name (max 10 chars, alphanumeric)
            name = ''.join(c for c in str(new_score['name'])[:10] if c.isalnum()).upper()
            if not name:
                name = 'ANONYMOUS'

            # Load existing scores
            scores = load_scores()

            # Create entry
            entry = {
                'name': name,
                'score': int(new_score['score']),
                'difficulty': str(new_score['difficulty']),
                'level': str(new_score['level']),
                'eggsDelivered': int(new_score.get('eggsDelivered', 0)),
                'gameTime': int(new_score.get('gameTime', 0)),
                'date': datetime.now().isoformat()
            }

            # Add and sort
            scores.append(entry)
            scores.sort(key=lambda x: x['score'], reverse=True)

            # Keep reasonable limit for memory (but save more than just top 10)
            scores = scores[:MAX_STORED_SCORES]

            # Save (in-memory)
            save_scores(scores)

            # Find rank
            rank = 0
            for i, s in enumerate(scores):
                if (s['name'] == entry['name'] and
                    s['score'] == entry['score'] and
                    s['date'] == entry['date']):
                    rank = i + 1
                    break

            # Send response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'rank': rank, 'scores': scores}).encode('utf-8'))

        except (json.JSONDecodeError, ValueError) as e:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': f'Invalid data: {e}'}).encode('utf-8'))

    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
