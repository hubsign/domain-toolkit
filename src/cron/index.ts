import { OpenAPIHono } from "@hono/zod-openapi";
import { domainPendingHandler, domainPendingRoute } from "./domain-pending";

const cronApi = new OpenAPIHono<{}>();

cronApi.openapi(domainPendingRoute, domainPendingHandler);

export { cronApi };
