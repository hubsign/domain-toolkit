import { createRoute, z } from "@hono/zod-openapi";
import type { Context } from "hono";
import { ErrorSchema, RequestContext } from "../shared";
import { checkCnameRecord } from "../utils/dns";
import { env } from "../env";
import { TypeOf } from "zod";

const ParamsSchema = z.object({
  domain: z
    .string()
    .min(1)
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

const VerifySchema = z
  .object({
    verified: z.boolean().default(false).openapi({
      description:
        "A flag indicating whether the domain has been successfully verified. Returns 'true' if the domain is verified, and 'false' otherwise.",
    }),
  })
  .openapi({
    description: "Verify",
    required: ["domain"],
  });

export const verifyRoute = createRoute({
  method: "post",
  tags: ["domains"],
  description: "Verify a domain",
  path: "/:domain/verify",
  request: {
    params: ParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: VerifySchema,
        },
      },
      description: "Verify",
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
      description: "Returns an error",
    },
  },
});

export const verifyHandler = async (
  c: RequestContext<TypeOf<typeof ParamsSchema>>
) => {
  const { domain } = c.req.valid("param");

  const result = await checkCnameRecord(domain, env.CNAME_TARGET);

  const data = VerifySchema.parse({ verified: result });

  return c.json(data);
};
