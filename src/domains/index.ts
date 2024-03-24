import { OpenAPIHono } from "@hono/zod-openapi";

import { verifyHandler, verifyRoute } from "./verify";

const domainsApi = new OpenAPIHono<{}>();

domainsApi.openapi(verifyRoute, verifyHandler);

export { domainsApi };
