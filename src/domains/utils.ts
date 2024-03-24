import dns from "node:dns";

/**
 * Checks if the specified domain has a CNAME record matching the expected CNAME value.
 *
 * This function configures the DNS servers to Google's public DNS (8.8.8.8 and 8.8.4.4) and
 * attempts to resolve the CNAME records for the given domain. It then checks if any of the
 * resolved CNAME records match the expected CNAME value.
 *
 * @param {string} domain The domain name to check the CNAME record for.
 * @param {string} expectedCname The expected CNAME value to match against the domain's CNAME records.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the expected CNAME record is found, otherwise `false`.
 */
export async function checkCnameRecord(
  domain: string,
  expectedCname: string
): Promise<boolean> {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
  try {
    const records = await dns.promises.resolveCname(domain);
    return records.some((record) => record === expectedCname);
  } catch (err) {
    if (err instanceof Error) {
      console.error(
        `Error fetching CNAME record for ${domain}: ${err.message}`
      );
    } else {
      console.error(
        `An unknown error occurred while fetching CNAME record for ${domain}`
      );
    }
    return false;
  }
}
