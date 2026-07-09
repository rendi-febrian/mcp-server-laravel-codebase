import type { ToolHandler } from "../index.js";
import { runArtisan } from "../artisan.js";

export const scheduleList: ToolHandler = {
  name: "schedule_list",
  description: "List all scheduled tasks with their frequency and command",
  inputSchema: {
    type: "object",
    properties: {},
  },
  handler: async () => {
    const output = await runArtisan("schedule:list");

    const lines = output.split("\n").filter((l) => l.trim());
    const headerIdx = lines.findIndex((l) => l.includes("Frequency") || l.includes("Cron"));
    if (headerIdx === -1) {
      return { content: [{ type: "text", text: output }] };
    }

    const tableLines = lines.slice(headerIdx + 1).filter((l) => l.trim() && !l.includes("----"));

    const tasks = tableLines.map((line) => {
      const parts = line.trim().split(/\s{2,}/);
      return {
        frequency: parts[0]?.trim() || "",
        command: parts[1]?.trim() || "",
        description: parts[2]?.trim() || "",
      };
    });

    return {
      content: [{ type: "text", text: JSON.stringify(tasks, null, 2) }],
    };
  },
};
