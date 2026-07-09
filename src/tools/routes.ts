import type { ToolHandler } from "../index.js";
import { runArtisan, runArtisanJson } from "../artisan.js";

export const routesList: ToolHandler = {
  name: "routes_list",
  description: "List all registered routes with method, URI, name, controller action, and middleware",
  inputSchema: {
    type: "object",
    properties: {
      method: {
        type: "string",
        description: "Filter by HTTP method (GET, POST, PUT, DELETE, etc.)",
      },
      path: {
        type: "string",
        description: "Filter by URI path prefix",
      },
      name: {
        type: "string",
        description: "Filter by route name",
      },
    },
  },
  handler: async (args: Record<string, unknown>) => {
    let cmd = "route:list --json";

    if (args.method) cmd += ` --method=${args.method}`;
    if (args.path) cmd += ` --path=${args.path}`;
    if (args.name) cmd += ` --name=${args.name}`;

    const routes = await runArtisanJson<unknown[]>(cmd);

    return {
      content: [{ type: "text", text: JSON.stringify(routes, null, 2) }],
    };
  },
};

export const routesCache: ToolHandler = {
  name: "routes_cache",
  description: "Cache routes for faster route registration (route:cache)",
  inputSchema: {
    type: "object",
    properties: {},
  },
  handler: async () => {
    const output = await runArtisan("route:cache", 60000);
    return {
      content: [{ type: "text", text: output }],
    };
  },
};

export const routesClear: ToolHandler = {
  name: "routes_clear",
  description: "Clear route cache (route:clear)",
  inputSchema: {
    type: "object",
    properties: {},
  },
  handler: async () => {
    const output = await runArtisan("route:clear");
    return {
      content: [{ type: "text", text: output }],
    };
  },
};
