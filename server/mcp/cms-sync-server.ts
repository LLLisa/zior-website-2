import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { config } from "../config";
import { syncCms, cmsDrift, type SyncReport } from "../cms-sync";

// An MCP server exposing on-demand CMS sync from the deployed ZIOR site into the
// local dev environment. Invoke `sync_cms` to pull remote content and apply it
// (Postgres upsert + seed.ts / seed-assets rewrite); `cms_drift` reports what is
// stale without writing anything. A failed remote fetch changes nothing locally.

const server = new McpServer({ name: "zior-cms-sync", version: "1.0.0" });

function textResult(report: SyncReport) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(report, null, 2) }],
    isError: !report.ok,
  };
}

const targetsSchema = z
  .array(z.enum(["pages", "settings", "scripts", "decks"]))
  .optional()
  .describe("Which content types to sync; defaults to all four.");

server.registerTool(
  "sync_cms",
  {
    title: "Sync CMS content from the deployed site",
    description:
      `Pull CMS content from the deployed ZIOR site (${config.remoteUrl}) and ` +
      "apply it to the local dev environment: upsert into the local Postgres AND " +
      "rewrite server/seed.ts (pages, settings) and the seed-assets manifest " +
      "(scripts, slide decks) so a reseed keeps the same content. Only changed " +
      "items are written; unchanged binaries are not re-downloaded. If the remote " +
      "fetch fails, nothing is changed and the stale local copy is kept. Requires " +
      "the local dev database to be running for the DB upserts to take effect.",
    inputSchema: {
      dryRun: z
        .boolean()
        .optional()
        .describe("Report what would change without writing anything."),
      targets: targetsSchema,
    },
  },
  async ({ dryRun, targets }) => textResult(await syncCms({ dryRun, targets })),
);

server.registerTool(
  "cms_drift",
  {
    title: "Report CMS drift vs the deployed site",
    description:
      "Show which local pages, settings, scripts, and slide decks differ from the " +
      `deployed site (${config.remoteUrl}) without changing anything. A read-only ` +
      "dry run of sync_cms.",
    inputSchema: {},
  },
  async () => textResult(await cmsDrift()),
);

const transport = new StdioServerTransport();
await server.connect(transport);
// Log to stderr so it doesn't corrupt the stdio JSON-RPC channel.
console.error(`zior-cms-sync MCP server ready (remote: ${config.remoteUrl})`);
