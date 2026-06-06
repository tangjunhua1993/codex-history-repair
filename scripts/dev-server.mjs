import { spawn } from "node:child_process";

const DEV_URL = "http://127.0.0.1:1420/";

if (await isDevServerReady()) {
  console.log(`[dev] Reusing existing Vite server at ${DEV_URL}`);
  keepAlive();
} else {
  console.log(`[dev] Starting Vite server at ${DEV_URL}`);
  const child = spawn(
    "pnpm",
    ["exec", "vite", "--host", "127.0.0.1", "--port", "1420"],
    {
      stdio: "inherit",
      shell: process.platform === "win32",
    },
  );

  const forward = (signal) => {
    if (!child.killed) {
      child.kill(signal);
    }
  };

  process.once("SIGINT", () => forward("SIGINT"));
  process.once("SIGTERM", () => forward("SIGTERM"));
  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

async function isDevServerReady() {
  try {
    const response = await fetch(DEV_URL, { method: "HEAD" });
    return response.ok || response.status === 405;
  } catch {
    return false;
  }
}

function keepAlive() {
  setInterval(() => {}, 60_000);
}
