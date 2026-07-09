#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { assertProjectPath, PROJECT_PATH } from "./artisan.js";

import { routesList } from "./tools/routes.js";
import { modelsList, modelDetail } from "./tools/models.js";
import { controllersList } from "./tools/controllers.js";
import { migrationsList } from "./tools/migrations.js";
import { scheduleList } from "./tools/schedule.js";
import { eventsList } from "./tools/events.js";
import { middlewareList } from "./tools/middleware.js";
import { appAbout } from "./tools/about.js";
import { commandsList } from "./tools/commands.js";
import { artisanRun } from "./tools/artisan.js";
import { registerResources } from "./resources/index.js";

export interface ToolHandler {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, unknown>) => Promise<{
    content: Array<{ type: "text"; text: string }>;
    isError?: boolean;
  }>;
}

const ALL_TOOLS: ToolHandler[] = [
  routesList,
  modelsList,
  modelDetail,
  controllersList,
  migrationsList,
  scheduleList,
  eventsList,
  middlewareList,
  appAbout,
  commandsList,
  artisanRun,
];

const toolDescription = ALL_TOOLS.map((t) => t.name).join(", ");

async function main(): Promise<void> {
  try {
    assertProjectPath();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`Startup error: ${msg}\n`);
    process.exit(1);
  }

  const mcpServer = new Server(
    { name: "laravel-codebase", version: "1.0.0" },
    { capabilities: { tools: {}, resources: {} } }
  );

  mcpServer.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: ALL_TOOLS.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    })),
  }));

  mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
    const tool = ALL_TOOLS.find((t) => t.name === request.params.name);
    if (!tool) {
      throw new Error(`Unknown tool: ${request.params.name}`);
    }

    try {
      return await tool.handler((request.params.arguments as Record<string, unknown>) || {});
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        isError: true,
        content: [{ type: "text", text: `Tool error: ${msg}` }],
      };
    }
  });

  registerResources(mcpServer);

  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);

  process.stderr.write(
    `Laravel Codebase MCP started | project: ${PROJECT_PATH} | tools: ${toolDescription}\n`
  );
}

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));
process.on("uncaughtException", (err) => {
  process.stderr.write(`Uncaught exception: ${err.message}\n`);
  process.exit(1);
});

main().catch((err) => {
  process.stderr.write(`Fatal error: ${err.message}\n`);
  process.exit(1);
});
