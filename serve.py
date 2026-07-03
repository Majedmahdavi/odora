"""Tiny static dev server for Odora with caching disabled.

Plain `python -m http.server` lets the browser cache ES modules, so edits
don't show up without a hard refresh. This server sends no-store headers so
every reload fetches the latest files.
"""
import http.server
import socketserver

PORT = 5500


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), NoCacheHandler) as httpd:
        print(f"Odora dev server (no-cache) on http://localhost:{PORT}")
        httpd.serve_forever()
