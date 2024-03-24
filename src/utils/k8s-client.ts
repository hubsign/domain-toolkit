import k8s from "@kubernetes/client-node";
import { env } from "../env";
const kc = new k8s.KubeConfig();
if (env.KUBE_CONFIG_DATA) {
  const decodedConfig = Buffer.from(env.KUBE_CONFIG_DATA, "base64").toString(
    "utf-8"
  );
  kc.loadFromString(decodedConfig);
} else {
  kc.loadFromDefault();
}
const customObjectApi = kc.makeApiClient(k8s.CustomObjectsApi);
export { customObjectApi };
