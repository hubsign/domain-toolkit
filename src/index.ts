import { Hono } from "hono";
import { domainsApi } from "./domains";
import { middleware } from "./middleware";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { showRoutes } from "hono/dev";

const app = new Hono();

export const api = new OpenAPIHono();

app.get("/health", (c) => {
  return c.text("Health Live!");
});
app.get("/", (c) => c.text("Domain Toolkit API"));

app.use("/domains/*", middleware);
api.use("/*", cors());

api.doc("/openapi", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Domain-Toolkit API",
  },
});
api.route("/domains", domainsApi);

app.route("/", api);
const isDev = process.env.NODE_ENV === "development";

const port = isDev ? 8001 : 8000;
if (isDev) showRoutes(app, { verbose: false, colorize: true });

console.log(`Starting server on port ${port}`);
const server = { port, fetch: app.fetch };

export default server;
