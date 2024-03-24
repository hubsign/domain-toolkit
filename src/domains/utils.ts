import dns from "node:dns";

export function checkCnameRecord(
  domain: string,
  expectedCname: string
): Promise<boolean> {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
  return new Promise((resolve, reject) => {
    dns.resolveCname(domain, (err, records) => {
      if (err) {
        console.error(
          `Error fetching CNAME record for ${domain}: ${err.message}`
        );
        resolve(false);
      } else {
        const found = records.some((record) => record === expectedCname);
        resolve(found);
      }
    });
  });
}
