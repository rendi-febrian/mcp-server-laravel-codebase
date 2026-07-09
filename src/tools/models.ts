import type { ToolHandler } from "../index.js";
import { runArtisanJson } from "../artisan.js";
import { scanClasses } from "../scanner.js";

export const modelsList: ToolHandler = {
  name: "models_list",
  description: "List all Eloquent models with class, namespace, and file path",
  inputSchema: {
    type: "object",
    properties: {},
  },
  handler: async () => {
    const models = scanClasses("app/Models", "model");
    const modelsDir = scanClasses("app", "model").filter((m) => !m.relative.startsWith("app/Models"));

    const all = [...models, ...modelsDir].map((m) => ({
      class: m.className,
      namespace: m.namespace,
      file: m.relative,
    }));

    return {
      content: [{ type: "text", text: JSON.stringify(all, null, 2) }],
    };
  },
};

export const modelDetail: ToolHandler = {
  name: "model_detail",
  description: "Show detailed information about a specific model (columns, relations, casts, policies)",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Model class name (e.g. User, Post, Flight)",
      },
    },
    required: ["name"],
  },
  handler: async (args: Record<string, unknown>) => {
    const name = args.name as string;

    try {
      const data = await runArtisanJson<Record<string, unknown>>(
        `model:show ${name} --json`,
        60000
      );
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (err) {
      const models = scanClasses("app/Models", "model").map((m) => m.className);

      return {
        content: [
          {
            type: "text",
            text: `Model "${name}" not found via artisan model:show.\nAvailable models: ${models.join(", ")}\n\nTry using a fully-qualified namespace (e.g., App\\Models\\${name}).`,
          },
        ],
      };
    }
  },
};
