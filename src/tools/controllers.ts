import type { ToolHandler } from "../index.js";
import { scanClasses } from "../scanner.js";
import { runArtisanJson } from "../artisan.js";

export const controllersList: ToolHandler = {
  name: "controllers_list",
  description: "List all controllers, their public methods, and routes they handle",
  inputSchema: {
    type: "object",
    properties: {
      detail: {
        type: "boolean",
        description: "Show route details for each controller method",
      },
    },
  },
  handler: async (args: Record<string, unknown>) => {
    const controllers = scanClasses("app/Http/Controllers", "controller");

    if (args.detail) {
      try {
        const routes = await runArtisanJson<Array<Record<string, unknown>>>("route:list --json");

        const controllerRoutes: Record<string, Array<Record<string, unknown>>> = {};
        for (const route of routes) {
          const action = (route.action as string) || "";
          const prefix = route.prefix as string;
          for (const ctrl of controllers) {
            if (ctrl.namespace && action.startsWith(ctrl.namespace + "\\" + ctrl.className)) {
              const key = `${ctrl.namespace}\\${ctrl.className}`;
              if (!controllerRoutes[key]) controllerRoutes[key] = [];
              controllerRoutes[key].push({
                method: route.method,
                uri: prefix ? `/${prefix}${route.uri}` : route.uri,
                name: route.name,
                action: route.action,
                middleware: route.middleware,
              });
            }
          }
        }

        const result = controllers.map((c) => {
          const key = c.namespace ? `${c.namespace}\\${c.className}` : c.className;
          return {
            class: c.className,
            namespace: c.namespace,
            file: c.relative,
            routes: controllerRoutes[key] || [],
          };
        });

        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                controllers.map((c) => ({
                  class: c.className,
                  namespace: c.namespace,
                  file: c.relative,
                })),
                null,
                2
              ),
            },
          ],
        };
      }
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            controllers.map((c) => ({
              class: c.className,
              namespace: c.namespace,
              file: c.relative,
            })),
            null,
            2
          ),
        },
      ],
    };
  },
};
