import { z } from "@hono/zod-openapi";
import { Context } from "hono";

export const ErrorSchema = z.object({
  code: z.number().openapi({
    example: 400,
  }),
  message: z.string().openapi({
    example: "Bad Request",
  }),
});

export type RequestContext<Params> = Context<
  {},
  string,
  { in: { param: Params }; out: { param: Params } }
>;
