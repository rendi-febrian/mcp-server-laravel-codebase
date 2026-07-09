import type { ToolHandler } from "../index.js";
import { runArtisan, runArtisanJson } from "../artisan.js";
import { getStructure, getProjectName } from "../scanner.js";

export const appAbout: ToolHandler = {
  name: "app_about",
  description: "Show Laravel application information (version, environment, config, packages)",
  inputSchema: {
    type: "object",
    properties: {},
  },
  handler: async () => {
    const structure = getStructure();

    let aboutRaw: string | null = null;
    try {
      aboutRaw = await runArtisan("about --json");
    } catch {
    }

    let about: Record<string, unknown> = {};
    if (aboutRaw) {
      try {
        about = JSON.parse(aboutRaw);
      } catch {
      }
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              project: structure.projectName,
              laravelVersion: structure.version,
              packages: {
                inertia: structure.hasInertia,
                filament: structure.hasFilament,
                livewire: structure.hasLivewire,
                breeze: structure.hasBreeze,
                jetstream: structure.hasJetstream,
                horizon: structure.hasHorizon,
                nova: structure.hasNova,
                telescope: structure.hasTelescope,
              },
              directoryCounts: structure.directories,
              artisanAbout: about,
            },
            null,
            2
          ),
        },
      ],
    };
  },
};
