import { Hono } from "hono";
import { domainsApi } from "./domains";
import { middleware } from "./middleware";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";

const app = new Hono();

export const api = new OpenAPIHono();

app.get("/health", (c) => {
  return c.text("Health Live!");
});

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
export default {
  port: 8000,
  fetch: app.fetch,
};
