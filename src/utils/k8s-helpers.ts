import { env } from "../env";
import { customObjectApi } from "./k8s-client";

interface TraefikIngressRoute {
  metadata: {
    annotations: Record<string, string>;
  };
}
interface TraefikIngressRouteList {
  items: TraefikIngressRoute[];
}
// Define the structure of the metadata annotations within an IngressRoute
interface IngressRouteAnnotations {
  "custom/domain-name": string;
  "custom/uid"?: string;
  "custom/userId"?: string;
}

// Define the structure of the metadata within an IngressRoute
interface IngressRouteMetadata {
  name: string;
  namespace?: string;
  annotations: IngressRouteAnnotations;
}

// Define the structure of an IngressRoute item
interface IngressRouteItem {
  metadata: IngressRouteMetadata;
  // Include other properties of IngressRouteItem as needed
}

// Define the structure of the result object returned by the Kubernetes API
interface KubernetesApiResponse {
  body: {
    items: IngressRouteItem[];
  };
  // Include other properties of the Kubernetes API response as needed
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
