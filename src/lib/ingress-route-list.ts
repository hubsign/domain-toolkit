import { env } from "../env";
import { TraefikIngressRouteList } from "../types/ingress-route";
import { customObjectApi } from "../utils/k8s-client";

export interface IngressRoute {
  domain: string;
}

export async function fetchIngressRoutes(): Promise<IngressRoute[]> {
  const namespace = env.NAMESPACE || "default";

  try {
    const group = "traefik.io";
    const version = "v1alpha1";
    const plural = "ingressroutes";
    const { body } = (await customObjectApi.listNamespacedCustomObject(
      group,
      version,
      namespace,
      plural
    )) as { body: TraefikIngressRouteList };
    const result = body.items.filter((item) => !item.spec.tls);
    console.log(result);
    if (result.length) {
      return result.map((item) => ({
        domain: item.metadata.annotations["custom/domain-name"],
      }));
    }
    return [];
  } catch (err) {
    console.error("Error querying domain by name:", err);
    throw new Error("Failed to query domain by name.");
  }
}
