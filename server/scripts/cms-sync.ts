/**
 * Pull CMS content from the deployed site and apply it locally (Postgres upsert
 * + seed.ts / seed-assets rewrite). The non-AI equivalent of the sync_cms MCP
 * tool. Run it where the dev database is reachable — inside the dev stack:
 *   docker compose exec server npm run cms:sync
 * A failed remote fetch changes nothing. After a successful sync, commit the
 * updated server/seed.ts and seed-assets/ to share the refreshed baseline.
 */
import { syncCms } from "../cms-sync";
import { config } from "../config";

syncCms({})
  .then((r) => {
    if (r.ok) {
      console.log(
        `[cms-sync] Synced from ${config.remoteUrl}: ` +
          `pages ${r.pages.changed.length}, settings ${r.settings.changed ? 1 : 0}, ` +
          `scripts ${r.scripts.changed.length}, decks ${r.decks.changed.length} ` +
          `(${r.decks.imagesDownloaded} images downloaded).`,
      );
      if (
        r.pages.changed.length ||
        r.settings.changed ||
        r.scripts.changed.length ||
        r.decks.changed.length
      ) {
        console.log(
          `[cms-sync] Review and commit server/seed.ts + seed-assets/ to keep the baseline.`,
        );
      }
    } else {
      console.error(
        `[cms-sync] Sync failed — nothing changed: ${r.errors.join("; ") || "unknown error"}`,
      );
    }
    process.exit(r.ok ? 0 : 1);
  })
  .catch((e) => {
    console.error("[cms-sync] Sync error — nothing changed:", e);
    process.exit(1);
  });
