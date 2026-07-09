import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";
import { ensureProject } from "./artisan.js";

export interface FileInfo {
  path: string;
  relative: string;
  name: string;
  size: number;
}

export interface ClassInfo {
  file: string;
  relative: string;
  namespace: string | null;
  className: string;
  type: "model" | "controller" | "middleware" | "policy" | "event" | "listener" | "command" | "provider";
}

function getProjectPath(): string {
  return ensureProject();
}

export function scanDirectory(subPath: string): FileInfo[] {
  const base = join(getProjectPath(), subPath);
  if (!existsSync(base)) return [];

  const results: FileInfo[] = [];

  function walk(dir: string) {
    try {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        const st = statSync(full);
        if (st.isDirectory()) {
          walk(full);
        } else if (extname(entry) === ".php") {
          results.push({
            path: full,
            relative: relative(getProjectPath(), full),
            name: basename(entry, ".php"),
            size: st.size,
          });
        }
      }
    } catch {
    }
  }

  walk(base);
  return results;
}

export function extractNamespace(filePath: string): string | null {
  try {
    const content = readFileSync(filePath, "utf-8");
    const match = content.match(/^namespace\s+([^;]+);/m);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export function scanClasses(subPath: string, type: ClassInfo["type"]): ClassInfo[] {
  const files = scanDirectory(subPath);
  return files.map((f) => ({
    file: f.path,
    relative: f.relative,
    className: f.name,
    namespace: extractNamespace(f.path),
    type,
  }));
}

export function getProjectName(): string {
  try {
    const composerJson = join(getProjectPath(), "composer.json");
    if (!existsSync(composerJson)) return basename(getProjectPath());
    const data = JSON.parse(readFileSync(composerJson, "utf-8"));
    return data.name || basename(getProjectPath());
  } catch {
    return basename(getProjectPath());
  }
}

export function detectLaravelVersion(): string | null {
  try {
    const installer = join(getProjectPath(), "vendor", "laravel", "framework", "src", "Illuminate", "Foundation", "Application.php");
    if (!existsSync(installer)) return null;
    const content = readFileSync(installer, "utf-8");
    const match = content.match(/const\s+VERSION\s*=\s*['"]([^'"]+)['"]/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export interface LaravelStructure {
  projectName: string;
  version: string | null;
  directories: Record<string, number>;
  hasInertia: boolean;
  hasFilament: boolean;
  hasLivewire: boolean;
  hasBreeze: boolean;
  hasJetstream: boolean;
  hasHorizon: boolean;
  hasNova: boolean;
  hasTelescope: boolean;
}

export function getStructure(): LaravelStructure {
  const base = getProjectPath();
  const composerJsonPath = join(base, "composer.json");
  let composerData: Record<string, unknown> = {};

  try {
    composerData = JSON.parse(readFileSync(composerJsonPath, "utf-8"));
  } catch {
  }

  const require = (composerData.require || {}) as Record<string, string>;
  const allDeps = { ...require, ...((composerData["require-dev"] || {}) as Record<string, string>) };

  return {
    projectName: getProjectName(),
    version: detectLaravelVersion(),
    directories: {
      models: scanDirectory("app/Models").length,
      controllers: scanDirectory("app/Http/Controllers").length,
      middleware: scanDirectory("app/Http/Middleware").length,
      policies: scanDirectory("app/Policies").length,
      events: scanDirectory("app/Events").length,
      listeners: scanDirectory("app/Listeners").length,
      commands: scanDirectory("app/Console/Commands").length,
      providers: scanDirectory("app/Providers").length,
      migrations: scanDirectory("database/migrations").length,
      factories: scanDirectory("database/factories").length,
      seeders: scanDirectory("database/seeders").length,
      views: scanDirectory("resources/views").length,
    },
    hasInertia: "inertiajs/inertia-laravel" in allDeps,
    hasFilament: "filament/filament" in allDeps || "filament/support" in allDeps,
    hasLivewire: "livewire/livewire" in allDeps,
    hasBreeze: "laravel/breeze" in allDeps,
    hasJetstream: "laravel/jetstream" in allDeps,
    hasHorizon: "laravel/horizon" in allDeps,
    hasNova: "laravel/nova" in allDeps,
    hasTelescope: "laravel/telescope" in allDeps,
  };
}
