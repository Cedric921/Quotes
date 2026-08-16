# `src/server` — the Focus API

The API the mobile app and the admin call, as Next.js route handlers under
`src/app/api`. It replaced the NestJS service in `apps/api`, route for route:
same paths, same JSON, same status codes. The mobile apps already installed
were written against that API, so **its contract is the spec**.

```
src/app/api/<path>/route.ts   one file per path, exports GET/POST/PUT/PATCH/DELETE
src/server/http/route.ts      route() wrapper: auth, zod validation, errors
src/server/http/errors.ts     HttpError, in the NestJS shape { statusCode, message, error }
src/server/auth/              JWT (jose, HS256, NestJS-compatible), auth context
src/server/db/                TypeORM: entities, migrations, getDb()/repo()
src/server/services/          business logic, one file per domain, no Next imports
src/server/integrations/      mail, cloudinary, expo push, stripe, deepl
```

## A route

```ts
// src/app/api/quotes/[id]/route.ts
import { z } from "zod";
import { route } from "@/server/http/route";
import { getQuote, updateQuote } from "@/server/services/quotes.service";

export const GET = route({ auth: "public" }, ({ params }) => getQuote(params.id));

export const PATCH = route(
  { auth: "admin", body: z.object({ text: z.string().optional(), author: z.string().nullish() }) },
  ({ params, body }) => updateQuote(params.id, body),
);
```

- `auth`: `public` (no token read), `optional` (`ctx` is the user or null),
  `user` (valid Bearer token, `ctx = { userId, email, isAdmin }`), `admin`
  (the account is an admin **in the database**, not just in the token).
- Return a value and it is sent as JSON: 201 for POST, 200 otherwise, as
  NestJS did. Return a `Response` for anything else (HTML, redirects).
- Throw `badRequest()`, `notFound()`… from `http/errors.ts`; anything else
  becomes a 500 `{ statusCode, message: "Internal server error" }`.
- Without `body`, the handler reads `req` itself: multipart uploads
  (`req.formData()`), webhooks that need the raw text for a signature.

## Rules

1. **Same contract as NestJS.** Paths, query parameters, field names and
   response shapes are copied from `apps/api`. Decimals stay strings, dates
   ISO strings, as TypeORM serialised them.
2. **Never return a user's `password`, `passwordResetCode` or
   `passwordResetExpires`** — pass users through `publicUser()`.
3. **Writes are not public.** NestJS left users, quotes and topics writable
   by anyone; here every write is `admin` unless the mobile app needs it.
4. **No `emitDecoratorMetadata`**: every entity column spells out its type.
5. **No in-memory state across requests** (rate limits, caches): serverless
   instances come and go. Use the database.
6. **Work after the response goes through `after()`** from `next/server`,
   never a bare promise or a timer.
7. Services take plain arguments and return plain data; they do not import
   `next/*` so the scheduled jobs and scripts can reuse them.
