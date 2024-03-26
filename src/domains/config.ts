import { createRoute, z } from "@hono/zod-openapi";
import { ErrorSchema, RequestContext } from "../shared";
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

const ConfigSchema = z
  .object({
    aValues: z.string().array().openapi({
      description: "",
    }),
    cnames: z.string().array().openapi({
      description: "",
    }),
    nameservers: z.string().array().openapi({
      description: "",
    }),
    misconfigured: z.boolean().openapi({
      description: "",
    }),
  })
  .openapi({
    description: "Config",
    required: ["domain"],
  });

export const configRoute = createRoute({
  method: "get",
  tags: ["domains"],
  description: "Get a Domain's configuration.",
  path: "/:domain/config",
  request: {
    params: ParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ConfigSchema,
        },
      },
      description: "Config",
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

export const configHandler = async (
  c: RequestContext<TypeOf<typeof ParamsSchema>>
) => {
  const { domain } = c.req.valid("param");

  //

  const data = ConfigSchema.parse({
    aValues: [],
    cnames: [],
    misconfigured: true,
    nameservers: [],
  });

  return c.json(data);
};
