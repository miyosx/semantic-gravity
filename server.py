#!/usr/bin/env python3
"""
Semantic Gravity local server.
Serves static files and proxies URL fetches to avoid CORS.

Usage:
    python3 server.py
    # Open http://localhost:8000
"""

import http.server
import json
import urllib.request
import urllib.parse
import urllib.error
import os

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/fetch':
            self.handle_fetch(parsed)
        else:
            super().do_GET()

    def handle_fetch(self, parsed):
        params = urllib.parse.parse_qs(parsed.query)
        url = params.get('url', [None])[0]

        if not url:
            self.send_error(400, 'Missing ?url= parameter')
            return

        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url

        try:
            req = urllib.request.Request(url, headers={
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            })
            with urllib.request.urlopen(req, timeout=15) as resp:
                content_type = resp.headers.get('Content-Type', '')
                raw = resp.read()

                # Try to decode
                encoding = 'utf-8'
                if 'charset=' in content_type:
                    encoding = content_type.split('charset=')[-1].split(';')[0].strip()
                try:
                    html = raw.decode(encoding)
                except (UnicodeDecodeError, LookupError):
                    html = raw.decode('utf-8', errors='replace')

            body = json.dumps({'html': html}).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', len(body))
            self.end_headers()
            self.wfile.write(body)

        except urllib.error.HTTPError as e:
            self.send_error(e.code, f'Remote server returned {e.code}')
        except urllib.error.URLError as e:
            self.send_error(502, f'Could not reach URL: {e.reason}')
        except Exception as e:
            self.send_error(500, str(e))


if __name__ == '__main__':
    with http.server.HTTPServer(('', PORT), Handler) as httpd:
        print(f'Semantic Gravity server running at http://localhost:{PORT}')
        httpd.serve_forever()
