from __future__ import annotations

import argparse
import shutil
import signal
import socket
import subprocess
import sys
import time
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "docuagent-backend"
FRONTEND_DIR = ROOT_DIR / "docuagent-frontend"
BACKEND_PORT = 8003
FRONTEND_PORT = 5173


class DevOrchestrator:
    def __init__(self) -> None:
        self.processes: list[subprocess.Popen[bytes]] = []
        self.shutting_down = False

    def resolve_backend_python(self) -> str:
        candidates = [
            BACKEND_DIR / ".venv" / "Scripts" / "python.exe",
            BACKEND_DIR / ".venv311" / "Scripts" / "python.exe",
        ]

        for candidate in candidates:
            if candidate.exists():
                return str(candidate)

        return sys.executable

    def resolve_npm(self) -> str:
        npm_name = "npm.cmd" if sys.platform == "win32" else "npm"
        npm_path = shutil.which(npm_name)
        if not npm_path:
            raise FileNotFoundError(
                "npm was not found on PATH. Install Node.js or add npm to PATH."
            )
        return npm_path

    def start_process(self, name: str, command: list[str], cwd: Path) -> None:
        print(f"Starting {name} in {cwd}")
        process = subprocess.Popen(command, cwd=str(cwd))
        self.processes.append(process)

    def start_backend(self, reload_enabled: bool) -> None:
        python_cmd = self.resolve_backend_python()
        command = [
            python_cmd,
            "-m",
            "uvicorn",
            "app.main:app",
            "--port",
            str(BACKEND_PORT),
        ]
        if reload_enabled:
            command.append("--reload")

        print(f"Backend will be available at http://localhost:{BACKEND_PORT}")
        self.start_process("backend", command, BACKEND_DIR)

    def start_frontend(self) -> None:
        npm_cmd = self.resolve_npm()
        print(f"Frontend will be available at http://localhost:{FRONTEND_PORT}")
        self.start_process("frontend", [npm_cmd, "run", "dev"], FRONTEND_DIR)

    def stop_process(self, process: subprocess.Popen[bytes]) -> None:
        if process.poll() is not None:
            return

        if sys.platform == "win32":
            subprocess.run(
                ["taskkill", "/pid", str(process.pid), "/t", "/f"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=False,
            )
            return

        process.terminate()

    def shutdown(self, exit_code: int) -> None:
        if self.shutting_down:
            return

        self.shutting_down = True

        for process in self.processes:
            self.stop_process(process)

        time.sleep(0.3)
        raise SystemExit(exit_code)

    def watch(self) -> None:
        while True:
            time.sleep(0.5)
            for process in self.processes:
                code = process.poll()
                if code is None:
                    continue

                if self.shutting_down:
                    return

                print(f"A managed process exited with code {code}. Stopping the full stack.")
                self.shutdown(code if code else 0)


def validate_workspace() -> None:
    missing = []
    if not BACKEND_DIR.exists():
        missing.append(str(BACKEND_DIR))
    if not FRONTEND_DIR.exists():
        missing.append(str(FRONTEND_DIR))

    if missing:
        joined = ", ".join(missing)
        raise FileNotFoundError(f"Expected project folders were not found: {joined}")


def _port_is_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.2)
        return sock.connect_ex(("127.0.0.1", port)) == 0


def _find_windows_pid_for_port(port: int) -> str | None:
    if sys.platform != "win32":
        return None
    try:
        result = subprocess.run(
            ["cmd", "/c", f"netstat -ano -p tcp | findstr LISTENING | findstr :{port}"],
            capture_output=True,
            text=True,
            check=False,
        )
    except OSError:
        return None

    for line in result.stdout.splitlines():
        parts = line.split()
        if len(parts) >= 5 and parts[-1].isdigit():
            return parts[-1]
    return None


def ensure_port_available(port: int, service_name: str) -> None:
    if not _port_is_in_use(port):
        return

    pid = _find_windows_pid_for_port(port)
    pid_hint = f" PID {pid}" if pid else ""
    stop_hint = (
        f"Stop the old process with: taskkill /PID {pid} /T /F"
        if pid and sys.platform == 'win32'
        else f"Stop the process currently listening on port {port} and try again."
    )
    raise RuntimeError(
        f"{service_name} port {port} is already in use{pid_hint}. {stop_hint}"
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Run DocuAgent backend and frontend from one command."
    )
    parser.add_argument(
        "mode",
        nargs="?",
        choices=["all", "backend", "frontend"],
        default="all",
        help="Choose which service set to start.",
    )
    parser.add_argument(
        "--no-reload",
        action="store_true",
        help="Disable backend auto-reload.",
    )
    return parser


def main() -> int:
    validate_workspace()
    args = build_parser().parse_args()
    orchestrator = DevOrchestrator()

    def handle_signal(_signum: int, _frame: object) -> None:
        orchestrator.shutdown(0)

    signal.signal(signal.SIGINT, handle_signal)
    signal.signal(signal.SIGTERM, handle_signal)

    reload_enabled = not args.no_reload

    if args.mode in {"all", "backend"}:
        ensure_port_available(BACKEND_PORT, "Backend")
        orchestrator.start_backend(reload_enabled=reload_enabled)

    if args.mode in {"all", "frontend"}:
        ensure_port_available(FRONTEND_PORT, "Frontend")
        orchestrator.start_frontend()

    orchestrator.watch()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
