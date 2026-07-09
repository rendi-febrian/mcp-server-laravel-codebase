import type { ToolHandler } from "../index.js";
import { runArtisan } from "../artisan.js";

export const commandsList: ToolHandler = {
  name: "commands_list",
  description: "List all registered Artisan commands",
  inputSchema: {
    type: "object",
    properties: {
      filter: {
        type: "string",
        description: "Filter commands by keyword (e.g. make, migrate, cache)",
      },
    },
  },
  handler: async (args: Record<string, unknown>) => {
    const cmd = args.filter ? `list ${args.filter}` : "list";
    const output = await runArtisan(cmd);

    const lines = output.split("\n").filter((l) => l.trim());
    const headerIdx = lines.findIndex((l) => l.includes("command") || l.includes("artisan"));
    if (headerIdx === -1) {
      return { content: [{ type: "text", text: output }] };
    }

    const commands: Array<{ command: string; description: string }> = [];
    const tableLines = lines.slice(headerIdx + 1).filter((l) => l.trim() && !l.includes("----"));

    for (const line of tableLines) {
      const parts = line.trim().split(/\s{2,}/);
      if (parts.length >= 2) {
        commands.push({
          command: parts[0]?.trim() || "",
          description: parts.slice(1).join(" ").trim(),
        });
      } else if (parts.length === 1 && parts[0]) {
        commands.push({ command: parts[0], description: "" });
      }
    }

    return {
      content: [{ type: "text", text: JSON.stringify(commands, null, 2) }],
    };
  },
};
