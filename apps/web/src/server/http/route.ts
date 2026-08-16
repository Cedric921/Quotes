import "server-only";
import { connection, type NextRequest } from "next/server";
import { QueryFailedError, EntityNotFoundError } from "typeorm";
import { z, type ZodType } from "zod";
import { optionalAuth, requireAdmin, requireUser, type AuthContext } from "../auth/context";
import { HttpError, badRequest } from "./errors";

type AuthMode = "public" | "optional" | "user" | "admin";

interface RouteOptions<TBody extends ZodType | undefined, TQuery extends ZodType | undefined> {
  /**
   * `public` reads no token, `optional` reads one when sent, `user` needs a
   * valid one and `admin` an account that is an admin in the database.
   */
  auth: AuthMode;
  /** JSON body schema. Leave it out to read the request yourself (multipart, raw webhooks). */
  body?: TBody;
  query?: TQuery;
}

type ContextFor<TAuth extends AuthMode> = TAuth extends "user" | "admin"
  ? AuthContext
  : TAuth extends "optional"
    ? AuthContext | null
    : null;

type Infer<T> = T extends ZodType ? z.infer<T> : undefined;

interface HandlerArgs<TBody, TQuery, TCtx> {
  req: NextRequest;
  params: Record<string, string>;
  body: TBody;
  query: TQuery;
  ctx: TCtx;
}

type NextRouteContext = { params: Promise<Record<string, string | string[]>> };

/**
 * Wraps a route handler: authentication, validation of the JSON body and the
 * query string, and errors in the NestJS shape.
 *
 * Status codes follow the NestJS API too — 201 for every POST, 200 otherwise —
 * since the clients were written against it.
 */
export function route<
  TAuth extends AuthMode,
  TBody extends ZodType | undefined = undefined,
  TQuery extends ZodType | undefined = undefined,
>(
  options: RouteOptions<TBody, TQuery> & { auth: TAuth },
  handler: (args: HandlerArgs<Infer<TBody>, Infer<TQuery>, ContextFor<TAuth>>) => Promise<unknown>,
) {
  return async (req: NextRequest, context: NextRouteContext): Promise<Response> => {
    try {
      // API responses are computed per request, never prerendered.
      await connection();
      const raw = context?.params ? await context.params : {};
      const params = Object.fromEntries(
        Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v.join("/") : v]),
      );

      const ctx = (await resolve(options.auth, req)) as ContextFor<TAuth>;

      let body = undefined as Infer<TBody>;
      if (options.body) {
        const json = await req.json().catch(() => {
          throw badRequest("Invalid JSON body");
        });
        body = parse(options.body, json) as Infer<TBody>;
      }

      let query = undefined as Infer<TQuery>;
      if (options.query) {
        query = parse(options.query, Object.fromEntries(req.nextUrl.searchParams)) as Infer<TQuery>;
      }

      const result = await handler({ req, params, body, query, ctx });
      if (result instanceof Response) return result;
      const status = req.method === "POST" ? 201 : 200;
      // NestJS answered `undefined` and `null` with an empty 200/201 body.
      if (result === undefined || result === null) return new Response(null, { status });
      return Response.json(result, { status });
    } catch (error) {
      return errorResponse(error, `${req.method} ${req.nextUrl.pathname}`);
    }
  };
}

async function resolve(mode: AuthMode, req: Request) {
  switch (mode) {
    case "public":
      return null;
    case "optional":
      return optionalAuth(req);
    case "user":
      return requireUser(req);
    case "admin":
      return requireAdmin(req);
  }
}

export function parse<T extends ZodType>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw badRequest(
      result.error.issues.map((issue) =>
        issue.path.length ? `${issue.path.join(".")} ${issue.message}` : issue.message,
      ),
    );
  }
  return result.data;
}

export function errorResponse(error: unknown, where?: string): Response {
  if (error instanceof HttpError) {
    return Response.json(error.toJSON(), { status: error.status });
  }
  if (error instanceof EntityNotFoundError) {
    return Response.json(new HttpError(404, "Not Found").toJSON(), { status: 404 });
  }
  if (error instanceof QueryFailedError) {
    const code = (error.driverError as { code?: string } | undefined)?.code;
    // Malformed uuid in a path: the resource does not exist.
    if (code === "22P02") return Response.json(new HttpError(404, "Not Found").toJSON(), { status: 404 });
    if (code === "23505") {
      return Response.json(new HttpError(409, "Already exists").toJSON(), { status: 409 });
    }
  }
  console.error(`[api] ${where ?? ""} unexpected error`, error);
  return Response.json({ statusCode: 500, message: "Internal server error" }, { status: 500 });
}

/** Shorthand for a uuid path segment, as `ParseUUIDPipe` checked it. */
export const uuid = z.string().uuid();

/** Strings coming from a query string, coerced the way NestJS handlers did by hand. */
export const queryBool = z
  .enum(["true", "false"])
  .optional()
  .transform((v) => (v === undefined ? undefined : v === "true"));
