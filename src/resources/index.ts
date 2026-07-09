import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { getProjectName } from "../scanner.js";
import { runArtisanJson } from "../artisan.js";

interface ResourceDefinition {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  fetch: () => Promise<string>;
}

const LARAVEL_PROJECT = process.env.LARAVEL_PROJECT_PATH || "";

function getProjectSlug(): string {
  return LARAVEL_PROJECT ? getProjectName() : "unknown";
}

export function registerResources(server: Server): void {
  const resources: ResourceDefinition[] = [
    {
      uri: `laravel://about`,
      name: `Laravel Application Info`,
      description: `Application info: version, environment, config, driver info`,
      mimeType: "application/json",
      fetch: async () => {
        const data = await runArtisanJson<Record<string, unknown>>("about --json");
        return JSON.stringify(data, null, 2);
      },
    },
    {
      uri: `laravel://routes`,
      name: `Laravel Route Table`,
      description: `All registered routes with method, URI, controller, middleware`,
      mimeType: "application/json",
      fetch: async () => {
        const data = await runArtisanJson<unknown[]>("route:list --json");
        return JSON.stringify(data, null, 2);
      },
    },
  ];

  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: resources.map((r) => ({
        uri: r.uri,
        name: r.name,
        description: r.description,
        mimeType: r.mimeType,
      })),
    };
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const resource = resources.find((r) => r.uri === request.params.uri);
    if (!resource) {
      throw new Error(`Resource not found: ${request.params.uri}`);
    }

    const text = await resource.fetch();
    return {
      contents: [
        {
          uri: resource.uri,
          mimeType: resource.mimeType,
          text,
        },
      ],
    };
  });
}
