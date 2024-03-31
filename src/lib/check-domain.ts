import { customObjectApi } from "../utils/k8s-client";

interface TraefikIngressRoute {
  metadata: {
    annotations: Record<string, string>;
  };
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
      return (
        item.metadata.annotations &&
        item.metadata.annotations["custom/domain-name"] === domain
      );
    });
    return domainExists;
  } catch (error) {
    console.error(`Error querying Traefik CRD for domain ${domain}:`, error);
    throw new Error("Failed to query Traefik CRD");
  }
};
