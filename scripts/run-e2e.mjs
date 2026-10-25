import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
const env = { ...process.env }; delete env.FORCE_COLOR; delete env.NO_COLOR;
const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const win = process.platform === "win32";
const result = win ? spawnSync("cmd.exe", ["/d", "/s", "/c", "npx playwright test"], { cwd: root, env, stdio: "inherit" }) : spawnSync("npx", ["playwright", "test"], { cwd: root, env, stdio: "inherit" });
process.exit(result.status ?? 1);
