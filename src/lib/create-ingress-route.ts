import { nanoid } from "nanoid";
import { env } from "../env";
import { customObjectApi } from "../utils/k8s-client";
import { TypeOf } from "zod";
import { AddDomainSchema } from "../domains/add";

export const createIngressRoute = async (
  input: TypeOf<typeof AddDomainSchema>,
  tls: boolean = false
) => {
  const entryPoints = [env.ENTRY_POINT || "websecure"];
  const namespace = env.NAMESPACE || "default";
  const apiVersion = env.API_VERSION || "traefik.io/v1alpha1";
  const serviceName = env.SERVICE_NAME || "web";
  const servicePort = parseInt(env.SERVICE_PORT || "3000", 10);
  const uniqueName = `${input.name}-${Date.now()}`;

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
      ...(tls && {
        tls: {
          certResolver: "letsencrypt",
        },
      }),
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
};
