import { Router } from "express";
import { fetchJftHtml } from "../jft";

export const jftRouter = Router();

// Proxy the public "Just for Today" daily meditation so the browser isn't
// blocked by CORS. Mounted at /jftText for backwards compatibility.
jftRouter.get("/", async (_req, res) => {
  try {
    res.type("html").send(await fetchJftHtml());
  } catch {
    res.status(502).send("Could not load Just for Today.");
  }
});
