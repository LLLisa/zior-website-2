import { Router } from "express";

export const jftRouter = Router();

// Proxy the public "Just for Today" daily meditation so the browser isn't
// blocked by CORS. Mounted at /jftText for backwards compatibility.
jftRouter.get("/", async (_req, res) => {
  try {
    const upstream = await fetch("https://www.jftna.org/jft/");
    if (!upstream.ok) {
      res.status(502).send("Could not load Just for Today.");
      return;
    }
    const html = await upstream.text();
    res.type("html").send(html);
  } catch {
    res.status(502).send("Could not load Just for Today.");
  }
});
