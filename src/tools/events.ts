import type { ToolHandler } from "../index.js";
import { runArtisan, runArtisanJson } from "../artisan.js";
import { scanClasses } from "../scanner.js";

export const eventsList: ToolHandler = {
  name: "events_list",
  description: "List all events with their registered listeners",
  inputSchema: {
    type: "object",
    properties: {},
  },
  handler: async () => {
    let events: Array<{
      event: string;
      listeners: string[];
    }> = [];

    try {
      const raw = await runArtisan("event:list", 30000);

      const lines = raw.split("\n").filter((l) => l.trim());
      const headerIdx = lines.findIndex((l) => l.includes("Event") || l.includes("Listeners"));

      if (headerIdx === -1) {
        const fileEvents = scanClasses("app/Events", "event");
        const fileListeners = scanClasses("app/Listeners", "listener");

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  events: fileEvents.map((e) => ({
                    class: e.className,
                    namespace: e.namespace,
                    file: e.relative,
                  })),
                  listeners: fileListeners.map((l) => ({
                    class: l.className,
                    namespace: l.namespace,
                    file: l.relative,
                  })),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      const tableLines = lines.slice(headerIdx + 1).filter((l) => l.trim() && !l.includes("----"));

      for (const line of tableLines) {
        const parts = line.trim().split(/\s{2,}/);
        const event = parts[0]?.trim() || "";
        const listenersStr = parts.slice(1).join(", ").trim();

        if (event) {
          events.push({
            event,
            listeners: listenersStr ? listenersStr.split(",").map((s) => s.trim()) : [],
          });
        }
      }
    } catch {
      const fileEvents = scanClasses("app/Events", "event");
      const fileListeners = scanClasses("app/Listeners", "listener");

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                events: fileEvents.map((e) => ({
                  class: e.className,
                  namespace: e.namespace,
                  file: e.relative,
                })),
                listeners: fileListeners.map((l) => ({
                  class: l.className,
                  namespace: l.namespace,
                  file: l.relative,
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    return {
      content: [{ type: "text", text: JSON.stringify(events, null, 2) }],
    };
  },
};
