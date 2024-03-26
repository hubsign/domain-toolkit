import { createRoute, z } from "@hono/zod-openapi";
import { ErrorSchema, RequestContext } from "../shared";
import { TypeOf } from "zod";
import { getAServers, getCnameServers, getNameServers } from "../utils/dns";

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
      description:
        "An array of IP addresses associated with the domain's A records. These records map the domain to its corresponding IP addresses.",
    }),
    conflicts: z.string().array().openapi({
      description: "",
    }),
    cnames: z.string().array().openapi({
      description:
        "An array of canonical names for the domain, specified as CNAME records. These records map domain aliases to their canonical (true) domain names.",
    }),
    nameservers: z.string().array().openapi({
      description:
        "A list of nameserver addresses that are authoritative for the domain. These servers manage DNS records for the domain.",
    }),
    misconfigured: z.boolean().openapi({
      description:
        "Whether or not the domain is configured AND we can automatically generate a TLS certificate.",
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

  const nameservers = await getNameServers(domain);
  const aValues = await getAServers(domain);
  const cnames = await getCnameServers(domain);
  const data = ConfigSchema.parse({
    aValues,
    cnames,
    conflicts: [],
    misconfigured: false,
    nameservers,
  });

  return c.json(data);
};
