import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

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

export async function getNameServers(domain: string): Promise<string[]> {
  try {
    const primaryDomain = getPrimaryDomain(domain);
    const records = await dns.promises.resolveNs(primaryDomain);
    return records;
  } catch (err) {
    if (err instanceof Error) {
      console.error(
        `Error fetching NameServer record for ${domain}: ${err.message}`
      );
    } else {
      console.error(
        `An unknown error occurred while fetching NameServer record for ${domain}`
      );
    }
    return [];
  }
}

export async function getAServers(domain: string): Promise<string[]> {
  try {
    const records = await dns.promises.resolve4(domain);
    return records;
  } catch (err) {
    if (err instanceof Error) {
      console.error(
        `Error fetching NameServer record for ${domain}: ${err.message}`
      );
    } else {
      console.error(
        `An unknown error occurred while fetching NameServer record for ${domain}`
      );
    }
    return [];
  }
}

export async function getCnameServers(domain: string): Promise<string[]> {
  try {
    const records = await dns.promises.resolveCname(domain);
    return records;
  } catch (err) {
    if (err instanceof Error) {
      console.error(
        `Error fetching NameServer record for ${domain}: ${err.message}`
      );
    } else {
      console.error(
        `An unknown error occurred while fetching NameServer record for ${domain}`
      );
    }
    return [];
  }
}

/**
 * Extracts the primary domain from a given domain name.
 * @param domain The full domain name from which to extract the primary domain.
 * @returns The primary domain.
 */
export function getPrimaryDomain(domain: string): string {
  // Validate the input to ensure it's a non-empty string.
  if (typeof domain !== "string" || domain.trim() === "") {
    throw new Error("Invalid domain name provided.");
  }

  // Split the domain by dots and remove any empty strings caused by leading or trailing dots.
  const parts = domain.split(".").filter(Boolean);

  // Ensure the domain has at least two parts (e.g., example.com).
  if (parts.length < 2) {
    throw new Error(
      "Invalid domain name provided. A valid domain must contain at least one dot."
    );
  }

  // Return the last two parts joined by a dot, which represents the primary domain.
  return parts.slice(-2).join(".");
}
