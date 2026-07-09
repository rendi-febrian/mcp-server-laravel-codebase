import type { ToolHandler } from "../index.js";
import { runArtisan } from "../artisan.js";

export const middlewareList: ToolHandler = {
  name: "middleware_list",
  description: "List all middleware aliases with their class names",
  inputSchema: {
    type: "object",
    properties: {},
  },
  handler: async () => {
    const output = await runArtisan("middleware");

    const lines = output.split("\n").filter((l) => l.trim());
    const headerIdx = lines.findIndex((l) => l.includes("Alias") || l.includes("Middleware"));
    if (headerIdx === -1) {
      return { content: [{ type: "text", text: output }] };
    }

    const tableLines = lines.slice(headerIdx + 1).filter((l) => l.trim() && !l.includes("----"));

    const middleware = tableLines.map((line) => {
      const parts = line.trim().split(/\s{2,}/);
      return {
        alias: parts[0]?.trim() || "",
        class: parts[1]?.trim() || "",
      };
    });

    return {
      content: [{ type: "text", text: JSON.stringify(middleware, null, 2) }],
    };
  },
};
