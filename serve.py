"""Tiny static dev server for Odora with caching disabled.

Plain `python -m http.server` lets the browser cache ES modules, so edits
don't show up without a hard refresh. This server sends no-store headers so
every reload fetches the latest files.

/api/* requests are proxied to the production API (the VPS), so the
server-backed features (gift tests) work in local development too.
"""
import http.server
import socketserver
import urllib.request

PORT = 5500
API_UPSTREAM = "http://84.32.10.66"  # production API behind nginx /api


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    # --- /api proxy ------------------------------------------------------
    def proxy_api(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length) if length else None
        req = urllib.request.Request(
            API_UPSTREAM + self.path,
            data=body,
            method=self.command,
            headers={"Content-Type": self.headers.get("Content-Type", "application/json")},
        )
        try:
            with urllib.request.urlopen(req, timeout=20) as res:
                payload = res.read()
                self.send_response(res.status)
        except urllib.error.HTTPError as err:  # 4xx/5xx still carry JSON
            payload = err.read()
            self.send_response(err.code)
        except Exception:
            payload = b'{"error":"upstream-unreachable"}'
            self.send_response(502)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        if self.path.startswith("/api/"):
            return self.proxy_api()
        super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api/"):
            return self.proxy_api()
        self.send_error(501)


if __name__ == "__main__":
    with socketserver.ThreadingTCPServer(("", PORT), NoCacheHandler) as httpd:
        print(f"Odora dev server (no-cache, /api -> {API_UPSTREAM}) on http://localhost:{PORT}")
        httpd.serve_forever()
