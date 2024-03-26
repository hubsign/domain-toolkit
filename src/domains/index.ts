import { OpenAPIHono } from "@hono/zod-openapi";

import { verifyHandler, verifyRoute } from "./verify";
import { addHandler, addRoute } from "./add";
import { getHandler, getRoute } from "./get";
import { configHandler, configRoute } from "./config";

const domainsApi = new OpenAPIHono<{}>();

domainsApi.openapi(addRoute, addHandler);
domainsApi.openapi(getRoute, getHandler);
domainsApi.openapi(configRoute, configHandler);
domainsApi.openapi(verifyRoute, verifyHandler);

export { domainsApi };
