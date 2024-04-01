interface IngressRouteSpec {
  tls: any;
}

export interface TraefikIngressRoute {
  metadata: IngressRouteMetadata;
  spec: IngressRouteSpec;
}
export interface TraefikIngressRouteList {
  items: TraefikIngressRoute[];
}

// Define the structure of the metadata annotations within an IngressRoute
export interface IngressRouteAnnotations {
  "custom/domain-name": string;
  "custom/uid"?: string;
  "custom/userId"?: string;
}

// Define the structure of the metadata within an IngressRoute
export interface IngressRouteMetadata {
  name: string;
  namespace?: string;
  annotations: IngressRouteAnnotations;
}
