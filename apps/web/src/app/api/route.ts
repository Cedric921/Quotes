import { route } from "@/server/http/route";

/** NestJS's root route: a plain string, which Express sent as text/html. */
export const GET = route(
  { auth: "public" },
  async () => new Response("Hello World!", { headers: { "content-type": "text/html; charset=utf-8" } }),
);
