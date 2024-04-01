import { createRoute, z } from "@hono/zod-openapi";
import { ErrorSchema, RequestContext } from "../shared";
import { checkCnameRecord } from "../utils/dns";
import { env } from "../env";
import { TypeOf } from "zod";
import { fetchIngressRoutes } from "../lib/ingress-route-list";
import { addTlsToIngressRoute } from "../lib/add-tls-to-ingress-route";

const ParamsSchema = z.object({
  domain: z
    .string()
    .min(1)
    .toLowerCase()
    .openapi({
      param: {
        name: "domain",
        in: "path",
      },
      description:
        "The domain name to be verified. Must be a valid domain name, such as 'acme.com'.",
      example: "acme.com",
    }),
});

const ResponseSchema = z
  .object({
    ok: z.boolean().default(false).openapi({
      description: "",
    }),
  })
  .openapi({
    description: "Response",
    required: ["domain"],
  });

export const domainPendingRoute = createRoute({
  method: "post",
  tags: ["cron"],
  description: "Cron task",
  path: "/domain-pending",
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ResponseSchema,
        },
      },
      description: "Response",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Returns an error",
    },
  },
});

export const domainPendingHandler = async (
  c: RequestContext<TypeOf<typeof ParamsSchema>>
) => {
  const domains = await fetchIngressRoutes();
  for (const item of domains) {
    const hasCname = await checkCnameRecord(item.domain, env.CNAME_TARGET);
    if (hasCname) {
      await addTlsToIngressRoute("");
    }
    //TODO
    console.log(`Domain ${item.domain} has CNAME record: ${hasCname}`);
  }
  return c.json({ ok: true });
};
