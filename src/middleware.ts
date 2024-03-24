import type { Context, Next } from "hono";

export async function middleware(c: Context<{}, "/*">, next: Next) {
  const key = c.req.header("x-openstatus-key");
  if (!key) return c.text("Unauthorized", 401);
  if (process.env.NODE_ENV === "production") {
    const { error, result } = await verifyKey(key);

    if (error) return c.text("Internal Server Error", 500);

    if (!result.valid) return c.text("Unauthorized", 401);

    if (!result.ownerId) return c.text("Unauthorized", 401);
  }
  await next();
}

function verifyKey(
  key: string
): { error: any; result: any } | PromiseLike<{ error: any; result: any }> {
  throw new Error("Function not implemented.");
}
