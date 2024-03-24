import { Hono } from "hono";
import { domainsApi } from "./domains";
import { middleware } from "./middleware";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import "./env";

const app = new Hono();

export const docApi = new OpenAPIHono();
docApi.use("/openapi", cors());

docApi.doc("/openapi", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Domain-Toolkit API",
  },
});
app.route("/", docApi);

app.get("/health", (c) => {
  return c.text("Health Live!");
});
app.route("/domains", domainsApi);
app.use("/domains/*", middleware);

export default app;
