import { createRoute, z } from "@hono/zod-openapi";
import { BodyRequestContext, ErrorSchema } from "../shared";
import { TypeOf } from "zod";
import k8s from "@kubernetes/client-node";

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

  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();

  const k8sApiClient = kc.makeApiClient(k8s.CustomObjectsApi);
  const ingressRoute = {
    apiVersion: "traefik.io/v1alpha1",
    kind: "IngressRoute",
    metadata: {
      name: "whoami",
      namespace: "default",
    },
    spec: {
      entryPoints: ["web"],
      routes: [
        {
          match: `Host("${input.name}")`,
          kind: "Rule",
          services: [
            {
              name: "whoami",
              port: 80,
            },
          ],
        },
      ],
    },
  };
  try {
    k8sApiClient.createNamespacedCustomObject(
      "traefik.containo.us",
      "v1alpha1",
      "default",
      "ingressroutes",
      ingressRoute
    );
  } catch (err: unknown) {}

  const data = ResponseSchema.parse({ name: input.name });

  return c.json(data);
};
