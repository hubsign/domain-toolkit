import { createRoute, z } from "@hono/zod-openapi";
import type { Context } from "hono";
import { ErrorSchema } from "../shared";
import { checkCnameRecord } from "./utils";
import { env } from "../env";

const ParamsSchema = z.object({
  domain: z
    .string()
    .min(1)
    .openapi({
      param: {
        name: "domain",
        in: "path",
      },
      description: "The domain",
      example: "acme.com",
    }),
});

const VerifySchema = z
  .object({
    verified: z
      .boolean()
      .default(false)
      .openapi({ description: "If the domain is verified" }),
  })
  .openapi({
    description: "Verify",
    required: ["domain"],
  });

export const verifyRoute = createRoute({
  method: "get",
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

export const verifyHandler = async (c: Context) => {
  const { domain } = c.req.valid("param");

  const result = await checkCnameRecord(domain, env.CNAME_TARGET);

  const data = VerifySchema.parse({ verified: result });

  return c.json(data);
};
