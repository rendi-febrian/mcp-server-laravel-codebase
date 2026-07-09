import type { ToolHandler } from "../index.js";
import { runArtisan } from "../artisan.js";

export const migrationsList: ToolHandler = {
  name: "migrations_list",
  description: "List all migrations with their status (rolled/rolled back)",
  inputSchema: {
    type: "object",
    properties: {},
  },
  handler: async () => {
    const output = await runArtisan("migrate:status");

    const lines = output.split("\n").filter((l) => l.trim());
    const headerIdx = lines.findIndex((l) => l.includes("Ran?") || l.includes("Migration"));
    if (headerIdx === -1) {
      return { content: [{ type: "text", text: output }] };
    }

    const tableLines = lines.slice(headerIdx + 1).filter((l) => l.trim() && !l.includes("----"));

    const migrations = tableLines.map((line) => {
      const parts = line.trim().split(/\s{2,}/);
      return {
        status: parts[0]?.trim() || "",
        migration: parts[1]?.trim() || "",
        batch: parts[2]?.trim() || "",
      };
    });

    return {
      content: [{ type: "text", text: JSON.stringify(migrations, null, 2) }],
    };
  },
};
