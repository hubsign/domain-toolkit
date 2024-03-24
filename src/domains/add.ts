import { createRoute, z } from "@hono/zod-openapi";
import { BodyRequestContext, ErrorSchema } from "../shared";
import { TypeOf } from "zod";
import { customObjectApi } from "../utils/k8s-client";

const AddDomainSchema = z.object({
  name: z
    .string()
    .min(1)
    .openapi({
      param: {
        name: "name",
        in: "path",
      },
      description: "The project domain name.",
      example: "acme.com",
    }),
});

const ResponseSchema = z
  .object({
    name: z.string().min(1).openapi({
      description: "The project domain name",
    }),
  })
  .openapi({
    description: "The domain was successfully added to the project",
    required: ["name"],
  });

export const addRoute = createRoute({
  method: "post",
  tags: ["domains"],
  description: "Add a domain",
  path: "/",
  request: {
    body: {
      description: "The status page to create",
      content: {
        "application/json": {
          schema: AddDomainSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ResponseSchema,
        },
      },
      description: "The domain was successfully added to the project",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Returns an error",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "One of the provided values in the request body is invalid.",
    },
  },
});

export const addHandler = async (
  c: BodyRequestContext<TypeOf<typeof AddDomainSchema>>
) => {
  const input = c.req.valid("json");

  const ingressRoute = {
    apiVersion: "traefik.io/v1alpha1",
    kind: "IngressRoute",
    metadata: {
      name: "whoami",
      namespace: "default",
    },
    spec: {
      entryPoints: ["websecure"],
      routes: [
        {
          match: `Host("${input.name}")`,
          kind: "Rule",
          services: [
            {
              name: "qco-web",
              port: 3000,
            },
          ],
          tls: {
            certResolver: "letsencrypt",
          },
        },
      ],
    },
  };
  try {
    await customObjectApi.createNamespacedCustomObject(
      "traefik.io",
      "v1alpha1",
      "default",
      "ingressroutes",
      ingressRoute
    );
  } catch (err: unknown) {
    console.log(err);
  }

  const data = ResponseSchema.parse({ name: input.name });

  return c.json(data);
};
