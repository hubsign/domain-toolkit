import * as dns from "dns";
import { promisify } from "util";

const lookupCname = promisify(dns.resolveCname);

export async function checkCnameRecord(
  domain: string,
  targetCname: string
): Promise<boolean> {
  try {
    const cnames = await lookupCname(domain);
    return cnames.includes(targetCname);
  } catch (error) {
    console.error(
      `Ошибка при проверке CNAME записи для домена ${domain}:`,
      error
    );
    return false;
  }
}
