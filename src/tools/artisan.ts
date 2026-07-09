import type { ToolHandler } from "../index.js";
import { isSafeCommand, runArtisan } from "../artisan.js";

export const artisanRun: ToolHandler = {
  name: "artisan_run",
  description:
    "Run a Laravel artisan command and return its output. Restricted to read-only commands: route:list, model:show, about, migrate:status, schedule:list, event:list, middleware, db:show, db:table, config:show, queue:failed, package:discover",
  inputSchema: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "Artisan command and arguments (e.g. 'route:list --json', 'model:show User')",
      },
      timeout: {
        type: "number",
        description: "Timeout in milliseconds (default 30000)",
      },
    },
    required: ["command"],
  },
  handler: async (args: Record<string, unknown>) => {
    const command = args.command as string;
    const timeout = (args.timeout as number) || 30000;

    if (!isSafeCommand(command)) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Command "${command}" is not in the read-only whitelist.\n\nAllowed commands:\n- route:list\n- model:show\n- about\n- migrate:status\n- schedule:list\n- event:list\n- middleware\n- db:show\n- db:table\n- config:show\n- queue:failed\n- package:discover\n- model:cache\n- model:clear`,
          },
        ],
      };
    }

    try {
      const output = await runArtisan(command, timeout);
      return {
        content: [{ type: "text", text: output }],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        isError: true,
        content: [{ type: "text", text: `Error running artisan command: ${message}` }],
      };
    }
  },
};
