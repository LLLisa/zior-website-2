import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import https from "node:https";
import { config } from "./config";
import { initDb, backfillSlideHashes } from "./db";
import { seed } from "./seed";
import { createApp } from "./app";

await initDb();
await seed();
await backfillSlideHashes();
const app = createApp();

const keyPath = path.join(config.secretsDir, "www_zoominonrecovery_org.key");
const certPath = path.join(config.secretsDir, "www_zoominonrecovery_org.pem");
const haveCerts = fs.existsSync(keyPath) && fs.existsSync(certPath);

// On Heroku (and most PaaS) TLS is terminated by the platform, so only use the
// bundled certs when they exist and we're the public TLS endpoint.
if (config.isProd && haveCerts) {
  https
    .createServer(
      { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) },
      app,
    )
    .listen(config.port, () =>
      console.log(`ZIOR (https) listening on port ${config.port}`),
    );
} else {
  http
    .createServer(app)
    .listen(config.port, () =>
      console.log(`ZIOR listening on port ${config.port}`),
    );
}
