import socket
import threading
import webbrowser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


HOST = "127.0.0.1"


def get_free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind((HOST, 0))
        return sock.getsockname()[1]


def main() -> None:
    base_dir = Path(__file__).resolve().parent
    port = get_free_port()
    handler = partial(SimpleHTTPRequestHandler, directory=str(base_dir))
    server = ThreadingHTTPServer((HOST, port), handler)
    url = f"http://{HOST}:{port}/index.html"

    print(f"Abriendo {url}")
    threading.Timer(0.8, lambda: webbrowser.open(url)).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
