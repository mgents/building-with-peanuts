"""
Vercel Serverless Function for Dragon Nest Defender Highscores
Handles GET and POST requests to /api/highscores
Uses Vercel Blob for persistent storage
"""

from http.server import BaseHTTPRequestHandler
import json
import os
from datetime import datetime
import urllib.request
import urllib.error

# No limit on stored scores - save ALL scores
MAX_STORED_SCORES = 500  # Generous limit for Blob storage

# Vercel Blob configuration
BLOB_READ_WRITE_TOKEN = os.environ.get('BLOB_READ_WRITE_TOKEN', '')
BLOB_STORE_ID = os.environ.get('BLOB_STORE_ID', '')
SCORES_FILENAME = 'highscores.json'

def get_default_scores():
    """Return default scores when no persistence is available"""
    return [
        {"name": "VIAFAR", "score": 2269, "difficulty": "medium", "level": "cave", "eggsDelivered": 50, "gameTime": 208, "date": "2026-01-18T04:51:46.989778"},
        {"name": "LEOFAR", "score": 2219, "difficulty": "medium", "level": "mountain", "eggsDelivered": 50, "gameTime": 0, "date": "2026-01-18T05:00:00.000000"},
        {"name": "VIALEO", "score": 2007, "difficulty": "medium", "level": "beach", "eggsDelivered": 42, "gameTime": 292, "date": "2026-01-17T21:38:47.089058"},
        {"name": "FARMOR", "score": 1842, "difficulty": "medium", "level": "mountain", "eggsDelivered": 41, "gameTime": 185, "date": "2026-01-17T22:25:44.988510"},
        {"name": "LEOFAR", "score": 1806, "difficulty": "medium", "level": "cave", "eggsDelivered": 45, "gameTime": 238, "date": "2026-01-17T21:18:36.370374"},
        {"name": "FAR", "score": 1741, "difficulty": "hard", "level": "cave", "eggsDelivered": 41, "gameTime": 227, "date": "2026-01-17T21:33:04.031147"},
        {"name": "FAR", "score": 1482, "difficulty": "medium", "level": "beach", "eggsDelivered": 22, "gameTime": 221, "date": "2026-01-17T22:17:52.971592"},
        {"name": "FAR", "score": 1327, "difficulty": "easy", "level": "mountain", "eggsDelivered": 30, "gameTime": 162, "date": "2026-01-17T21:00:24.534319"},
        {"name": "VIALEO", "score": 1198, "difficulty": "hard", "level": "beach", "eggsDelivered": 27, "gameTime": 194, "date": "2026-01-17T21:43:21.410195"}
    ]

def blob_get():
    """Get highscores from Vercel Blob"""
    if not BLOB_READ_WRITE_TOKEN:
        return None

    try:
        # List blobs to find our highscores file
        list_url = "https://blob.vercel-storage.com?prefix=highscores"
        req = urllib.request.Request(list_url)
        req.add_header('Authorization', f'Bearer {BLOB_READ_WRITE_TOKEN}')

        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode('utf-8'))
            blobs = data.get('blobs', [])

            # Find our highscores file
            for blob in blobs:
                if blob.get('pathname') == SCORES_FILENAME:
                    # Fetch the blob content
                    blob_url = blob.get('url')
                    if blob_url:
                        with urllib.request.urlopen(blob_url, timeout=5) as blob_response:
                            return json.loads(blob_response.read().decode('utf-8'))

        return None
    except Exception as e:
        print(f"Blob GET error: {e}")
        return None

def blob_put(scores):
    """Save highscores to Vercel Blob"""
    if not BLOB_READ_WRITE_TOKEN:
        return False

    try:
        # Upload to Vercel Blob
        url = f"https://blob.vercel-storage.com/{SCORES_FILENAME}"
        json_data = json.dumps(scores).encode('utf-8')

        req = urllib.request.Request(url, data=json_data, method='PUT')
        req.add_header('Authorization', f'Bearer {BLOB_READ_WRITE_TOKEN}')
        req.add_header('Content-Type', 'application/json')
        req.add_header('x-api-version', '7')
        req.add_header('x-content-type', 'application/json')

        with urllib.request.urlopen(req, timeout=10) as response:
            return response.status in [200, 201]
    except Exception as e:
        print(f"Blob PUT error: {e}")
        return False

# In-memory cache
_scores_cache = None

def load_scores():
    """Load scores from Vercel Blob with fallback to defaults"""
    global _scores_cache

    # Try to load from Blob
    scores = blob_get()
    if scores is not None:
        _scores_cache = scores
        return scores

    # If Blob is not configured or empty, use defaults
    if _scores_cache is None:
        _scores_cache = get_default_scores()
        # Try to save defaults to Blob
        blob_put(_scores_cache)

    return _scores_cache

def save_scores(scores):
    """Save scores to Vercel Blob"""
    global _scores_cache
    _scores_cache = scores

    # Always try to persist to Blob
    success = blob_put(scores)
    if not success:
        print("Warning: Failed to persist scores to Blob")

    return success

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Handle GET /api/highscores - return current highscores"""
        scores = load_scores()

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.end_headers()
        self.wfile.write(json.dumps(scores).encode('utf-8'))

    def do_POST(self):
        """Handle POST /api/highscores - add new score (NEVER overwrites)"""
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

            # Load existing scores from persistent storage
            scores = load_scores()

            # Create entry with server timestamp
            entry = {
                'name': name,
                'score': int(new_score['score']),
                'difficulty': str(new_score['difficulty']),
                'level': str(new_score['level']),
                'eggsDelivered': int(new_score.get('eggsDelivered', 0)),
                'gameTime': int(new_score.get('gameTime', 0)),
                'date': datetime.now().isoformat()
            }

            # ALWAYS ADD - never overwrite or reject scores
            scores.append(entry)

            # Sort by score descending
            scores.sort(key=lambda x: x['score'], reverse=True)

            # Keep top N scores (but generous limit - 500)
            scores = scores[:MAX_STORED_SCORES]

            # Persist to Blob storage immediately
            save_success = save_scores(scores)

            # Find rank of the new entry
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
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.end_headers()

            response_data = {
                'success': True,
                'rank': rank,
                'persisted': save_success,
                'scores': scores
            }
            self.wfile.write(json.dumps(response_data).encode('utf-8'))

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
