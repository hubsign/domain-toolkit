import { z } from "@hono/zod-openapi";
import { Context } from "hono";

export const ErrorSchema = z.object({
  error: z.object({
    code: z.string().openapi({
      example: "domain_already_in_use",
    }),
    message: z.string().openapi({
      example: "Bad Request",
    }),
  }),
});

export type RequestContext<Params> = Context<
  {},
  string,
  { in: { param: Params }; out: { param: Params } }
>;
export type BodyRequestContext<Params> = Context<
  {},
  string,
  { in: { json: Params }; out: { json: Params } }
>;
