import { env } from "../env";
import { customObjectApi } from "../utils/k8s-client";

export interface DomainVerificationAttempt {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace?: string;
  };
  spec: {
    domainName: string;
    userId: string;
    txtRecord: string;
    txtDomain: string;
    verificationStatus: "Pending" | "Verified" | "Failed";
  };
}

export async function createDomainVerificationAttempt(
  attempt: DomainVerificationAttempt
): Promise<void> {
  const group = env.DOMAIN_NAME;
  const version = "v1";
  const namespace = attempt.metadata.namespace || "default";
  const plural = "domainverificationattempts";

  try {
    await customObjectApi.createNamespacedCustomObject(
      group,
      version,
      namespace,
      plural,
      attempt
    );
    console.log("Domain verification attempt created successfully.");
  } catch (err) {
    console.error("Error creating domain verification attempt:", err);
  }
}
