import type { Context, Next } from "hono";
import { env } from "./env";

export async function middleware(c: Context<{}, "/*">, next: Next) {
  const key = c.req.header("x-api-key");
  const { SECRET_KEY } = env.SECRET_KEY;

  if (!key) return c.text("Unauthorized", 401);
  if (process.env.NODE_ENV === "production") {
    const { error, valid } = verifyKey(key, SECRET_KEY);

    if (error) return c.text("Internal Server Error", 500);

    if (!valid) return c.text("Unauthorized", 401);
  }
  await next();
}

function verifyKey(key: string, secretKey: string) {
  if (key !== secretKey) {
    return { error: true, valid: false };
  }
  return { error: false, valid: true };
}
