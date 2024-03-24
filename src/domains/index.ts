import { OpenAPIHono } from "@hono/zod-openapi";

import { verifyHandler, verifyRoute } from "./verify";
import { addHandler, addRoute } from "./add";

const domainsApi = new OpenAPIHono<{}>();

domainsApi.openapi(addRoute, addHandler);
domainsApi.openapi(verifyRoute, verifyHandler);

export { domainsApi };
