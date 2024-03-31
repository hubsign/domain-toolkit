import { createRoute, z } from "@hono/zod-openapi";
import { BodyRequestContext, ErrorSchema } from "../shared";
import { TypeOf } from "zod";
import { customObjectApi } from "../utils/k8s-client";
import { env } from "../env";
import { nanoid } from "nanoid";
import { findDomainByName } from "../utils/k8s-helpers";

const AddDomainSchema = z.object({
  name: z
    .string()
    .min(1)
    .toLowerCase()
    .openapi({
      param: {
        name: "name",
        in: "path",
      },
      description: "The project domain name.",
      example: "acme.com",
    }),
  userId: z.string().min(1).openapi({
    description: "The unique identifier of the user owning the domain.",
  }),
});
const VerificationSchema = z.object({
  type: z.literal("TXT"),
  domain: z.string(),
  value: z.string(),
  reason: z.literal("pending_domain_verification"),
});
const ResponseSchema = z
  .object({
    name: z.string().min(1).openapi({
      description: "Domain name",
    }),
    verification: VerificationSchema,
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

  const entryPoints = [env.ENTRY_POINT || "websecure"];
  const namespace = env.NAMESPACE || "default";
  const apiVersion = env.API_VERSION || "traefik.io/v1alpha1";
  const serviceName = env.SERVICE_NAME || "web";
  const servicePort = parseInt(env.SERVICE_PORT || "3000", 10);
  const uniqueName = `${input.name}-${Date.now()}`;
  const existDomain = await findDomainByName(input.name);
  if (
    existDomain &&
    existDomain.metadata.annotations["custom/userId"] === input.userId
  ) {
    return c.json(
      {
        error: {
          code: "domain_already_in_use",
          message: `Cannot add ${input.name} since it's already in use by your account.`,
        },
      },
      400
    ); // Assuming the framework supports setting the status code this way.
  }
  if (
    existDomain &&
    existDomain.metadata.annotations["custom/userId"] !== input.userId
  ) {
    return c.json({
      verified: false,
      verification: [
        {
          type: "TXT",
          domain: "_domain.qco.me",
          value: "vc-domain-verify=qco.me,5c11928ba43ce9eef102",
          reason: "pending_domain_verification",
        },
      ],
    });
  }

  const ingressRoute = {
    apiVersion,
    kind: "IngressRoute",
    metadata: {
      name: uniqueName,
      namespace,
      annotations: {
        "custom/uid": nanoid(),
        "custom/domain-name": input.name,
        "custom/userId": input.userId,
      },
    },
    spec: {
      entryPoints,
      routes: [
        {
          match: `Host(\`${input.name}\`)`,
          kind: "Rule",
          services: [
            {
              name: serviceName,
              port: servicePort,
            },
          ],
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
