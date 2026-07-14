/**
 * Report whether local seed content has drifted from the deployed site. Purely
 * read-only: it fetches public CMS endpoints and compares, never writing to the
 * database, seed.ts, or seed-assets. Safe to run automatically on every dev
 * container start — it always exits 0 and self-limits its runtime, so it can
 * never block or fail startup, and it needs no AI/MCP tooling to work.
 */
import { syncCms, hasSyncBaseline } from "../cms-sync";
import { config } from "../config";

const TIMEOUT_MS = 8000;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | "timeout"> {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve("timeout"), ms);
    t.unref();
    p.then((v) => {
      clearTimeout(t);
      resolve(v);
    }).catch(() => {
      clearTimeout(t);
      resolve("timeout");
    });
  });
}

async function main() {
  const remote = config.remoteUrl;

  if (!hasSyncBaseline()) {
    console.log(
      `[cms-sync] No local baseline yet — run \`npm run cms:sync\` to pull ${remote} ` +
        `content and enable drift detection. (Skipping; this is fine.)`,
    );
    return;
  }

  console.log(`[cms-sync] Checking content drift vs ${remote} …`);
  const res = await withTimeout(syncCms({ dryRun: true }), TIMEOUT_MS);
  if (res === "timeout") {
    console.log(
      `[cms-sync] Drift check timed out or ${remote} is unreachable — skipping. This is fine.`,
    );
    return;
  }
  if (!res.ok) {
    console.log(
      `[cms-sync] Couldn't reach ${remote} — skipping drift check. This is fine ` +
        `(${res.errors[0] ?? "network error"}).`,
    );
    return;
  }

  const parts: string[] = [];
  if (res.pages.changed.length) parts.push(`pages: ${res.pages.changed.join(", ")}`);
  if (res.settings.changed) parts.push(`settings`);
  if (res.scripts.changed.length) parts.push(`scripts: ${res.scripts.changed.join(", ")}`);
  if (res.decks.changed.length) parts.push(`decks: ${res.decks.changed.join(", ")}`);

  if (!parts.length) {
    console.log(`[cms-sync] ✓ Local seed content matches ${remote}.`);
    return;
  }

  console.log(`[cms-sync] ⚠ Local seed content differs from ${remote}:`);
  for (const p of parts) console.log(`             ${p}`);
  console.log(
    `[cms-sync] To refresh, run \`npm run cms:sync\` (or ask Claude to run sync_cms), ` +
      `then commit the updated baseline.`,
  );
}

main()
  .catch((e) =>
    console.log(
      `[cms-sync] Drift check skipped (${e instanceof Error ? e.message : String(e)}). This is fine.`,
    ),
  )
  .finally(() => process.exit(0));
