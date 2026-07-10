import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import https from "node:https";
import { config } from "./config";
import { seed } from "./seed";
import { createApp } from "./app";

seed();
const app = createApp();

const keyPath = path.join(config.secretsDir, "www_zoominonrecovery_org.key");
const certPath = path.join(config.secretsDir, "www_zoominonrecovery_org.pem");
const haveCerts = fs.existsSync(keyPath) && fs.existsSync(certPath);

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
  if (config.isProd) {
    console.warn(
      "Production mode but no TLS certificates found in ./secrets — serving plain HTTP.",
    );
  }
  http
    .createServer(app)
    .listen(config.port, () =>
      console.log(`ZIOR listening on http://localhost:${config.port}`),
    );
}
