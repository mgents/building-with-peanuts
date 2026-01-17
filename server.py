#!/usr/bin/env python3
"""
Simple HTTP server with highscores API for Dragon Nest Defender
Serves static files and provides REST endpoints for highscores
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os
from datetime import datetime

PORT = 8000
HIGHSCORES_FILE = 'highscores.json'
MAX_SCORES = 10

def load_highscores():
    """Load highscores from JSON file"""
    if os.path.exists(HIGHSCORES_FILE):
        try:
            with open(HIGHSCORES_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            print(f"Error loading highscores: {e}")
            return []
    return []

def save_highscores(scores):
    """Save highscores to JSON file"""
    try:
        with open(HIGHSCORES_FILE, 'w', encoding='utf-8') as f:
            json.dump(scores, f, indent=2)
        return True
    except IOError as e:
        print(f"Error saving highscores: {e}")
        return False

class GameHandler(SimpleHTTPRequestHandler):
    def send_json_response(self, data, status=200):
        """Send JSON response with CORS headers"""
        response = json.dumps(data).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', len(response))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(response)

    def do_GET(self):
        # API endpoint: GET /api/highscores
        if self.path == '/api/highscores':
            scores = load_highscores()
            self.send_json_response(scores)
            return

        # Serve static files
        super().do_GET()

    def do_POST(self):
        # API endpoint: POST /api/highscores
        if self.path == '/api/highscores':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                new_score = json.loads(post_data.decode('utf-8'))

                # Validate required fields
                required = ['name', 'score', 'difficulty', 'level']
                if not all(field in new_score for field in required):
                    self.send_json_response({'error': 'Missing required fields'}, 400)
                    return

                # Sanitize name (max 10 chars, alphanumeric)
                name = ''.join(c for c in str(new_score['name'])[:10] if c.isalnum()).upper()
                if not name:
                    name = 'ANONYMOUS'

                # Load existing scores
                scores = load_highscores()

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

                # Keep only top scores
                scores = scores[:MAX_SCORES]

                # Save
                save_highscores(scores)

                # Find rank
                rank = 0
                for i, s in enumerate(scores):
                    if (s['name'] == entry['name'] and
                        s['score'] == entry['score'] and
                        s['date'] == entry['date']):
                        rank = i + 1
                        break

                # Send response
                self.send_json_response({'rank': rank, 'scores': scores})
                print(f"[API] Added highscore: {name} - {entry['score']}")

            except (json.JSONDecodeError, ValueError) as e:
                self.send_json_response({'error': f'Invalid data: {e}'}, 400)
            return

        self.send_error(404, 'Not found')

    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def log_message(self, format, *args):
        """Custom logging - only show API calls"""
        message = format % args
        if '/api/' in message:
            print(f"[API] {message}")

if __name__ == '__main__':
    # Change to script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    print(f"Dragon Nest Defender Server")
    print(f"=" * 40)
    print(f"URL: http://localhost:{PORT}")
    print(f"Highscores file: {os.path.abspath(HIGHSCORES_FILE)}")
    print(f"=" * 40)

    server = HTTPServer(('', PORT), GameHandler)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        server.shutdown()
