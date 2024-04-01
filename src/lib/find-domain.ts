import { env } from "../env";
import {
  TraefikIngressRoute,
  TraefikIngressRouteList,
} from "../types/ingress-route";
import { customObjectApi } from "../utils/k8s-client";

/**
 * Finds a domain by its custom/domain-name annotation.
 * @param domainName The domain name to search for.
 * @returns The found domain's details or null if not found.
 */
export const findDomainByName = async (domainName: string) => {
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
    const result = body.items.filter(
      (item) =>
        item.metadata.annotations &&
        item.metadata.annotations["custom/domain-name"] === domainName
    );

    if (result.length > 0) {
      return result[0];
    } else {
      return null;
    }
  } catch (err) {
    console.error("Error querying domain by name:", err);
    throw new Error("Failed to query domain by name.");
  }
};
