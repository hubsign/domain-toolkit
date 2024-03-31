import { customObjectApi } from "./k8s-client";

interface TraefikIngressRoute {
  spec: { routes: Array<{ match: { rule: string } }> };
}
interface TraefikIngressRouteList {
  items: TraefikIngressRoute[];
}
export const checkDomainInKubernetes = async (
  domain: string
): Promise<boolean> => {
  try {
    const group = "traefik.io";
    const version = "v1alpha1";
    const namespace = "default";
    const plural = "ingressroutes";
    const { body } = (await customObjectApi.listNamespacedCustomObject(
      group,
      version,
      namespace,
      plural
    )) as { body: TraefikIngressRouteList };
    const domainExists = body.items.some((item) => {
      return item.spec.routes.some((route) =>
        route.match.rule.includes(domain)
      );
    });
    return domainExists;
  } catch (error) {
    console.error("Error querying Traefik CRD:", error);
    throw new Error("Failed to query Traefik CRD");
  }
};
