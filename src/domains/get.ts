import { createRoute, z } from "@hono/zod-openapi";
import { ErrorSchema, RequestContext } from "../shared";
import { TypeOf } from "zod";
import { checkDomainInKubernetes } from "../lib/check-domain";

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

const GetSchema = z
  .object({
    verified: z.boolean().default(false).openapi({
      description:
        "A flag indicating whether the domain has been successfully verified. Returns 'true' if the domain is verified, and 'false' otherwise.",
    }),
  })
  .openapi({
    description: "Get",
    required: ["domain"],
  });

export const getRoute = createRoute({
  method: "get",
  tags: ["domains"],
  description: "Get a domain",
  path: "/:domain",
  request: {
    params: ParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: GetSchema,
        },
      },
      description: "Get",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Returns an error",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Not found",
    },
  },
});

export const getHandler = async (
  c: RequestContext<TypeOf<typeof ParamsSchema>>
) => {
  const { domain } = c.req.valid("param");
  const domainExistsInKubernetes = await checkDomainInKubernetes(domain);

  const data = GetSchema.parse({ verified: !domainExistsInKubernetes });

  return c.json(data);
};
