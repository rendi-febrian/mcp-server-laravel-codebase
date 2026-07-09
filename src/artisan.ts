import { exec } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export const PROJECT_PATH = process.env.LARAVEL_PROJECT_PATH || "";
export const PHP_BIN = process.env.PHP_BINARY || "php";

const ARTISAN_PATH = () => join(PROJECT_PATH, "artisan");

export function assertProjectPath(): void {
  if (!PROJECT_PATH) {
    throw new Error("LARAVEL_PROJECT_PATH env var is required");
  }
  if (!existsSync(ARTISAN_PATH())) {
    throw new Error(`artisan not found at ${ARTISAN_PATH()}`);
  }
}

const SAFE_COMMANDS = new Set([
  "route:list",
  "route:scan",
  "route:clear",
  "model:show",
  "model:cache",
  "model:clear",
  "migrate:status",
  "about",
  "event:list",
  "event:cache",
  "middleware",
  "schedule:list",
  "db:show",
  "db:table",
  "db:monitor",
  "package:discover",
  "queue:failed",
  "config:show",
  "view:cache",
  "view:clear",
  "route:list --json",
  "event:list --json",
  "schedule:list --json",
  "about --json",
  "model:show --json",
]);

export function isSafeCommand(command: string): boolean {
  const trimmed = command.trim();
  if (SAFE_COMMANDS.has(trimmed)) return true;
  for (const safe of SAFE_COMMANDS) {
    if (trimmed === safe + " --json") return true;
  }
  return false;
}

export async function runArtisan(
  command: string,
  timeout = 30000
): Promise<string> {
  assertProjectPath();

  const args = command.trim();
  const full = `${PHP_BIN} artisan ${args} --no-ansi 2>&1`;

  const { stdout } = await execAsync(full, {
    cwd: PROJECT_PATH,
    timeout,
    maxBuffer: 1024 * 1024 * 10,
  });

  return stdout.trim();
}

export async function runArtisanJson<T = unknown>(
  command: string,
  timeout = 30000
): Promise<T> {
  const raw = await runArtisan(command, timeout);

  const lines = raw.split("\n");
  let jsonStart = -1;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trimStart();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      jsonStart = i;
      break;
    }
  }

  if (jsonStart === -1) {
    throw new Error(`No JSON found in artisan output:\n${raw}`);
  }

  const jsonStr = lines.slice(jsonStart).join("\n");
  return JSON.parse(jsonStr) as T;
}

export function ensureProject(): string {
  assertProjectPath();
  return PROJECT_PATH;
}
