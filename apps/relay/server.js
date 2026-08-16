/**
 * The old API address, kept alive for the apps already installed.
 *
 * Versions of the mobile app released before 2.2.0 call
 * https://focus-app-1.onrender.com/<path>, without the /api prefix. The API
 * now lives on Vercel under /api, with the same paths and the same JSON, so
 * this server forwards each request as it is and streams the answer back.
 *
 * No dependencies, nothing stored, no logic of its own: once those versions
 * are gone from the stores' active installs, the Render service is deleted.
 */
import http from "node:http";

const TARGET = (process.env.TARGET_URL ?? "https://focus-admin.vercel.app/api").replace(/\/$/, "");
const PORT = Number(process.env.PORT ?? 10000);

// Hop-by-hop headers belong to one connection and must not be forwarded.
const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

function forwardHeaders(source) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(source)) {
    if (value === undefined || HOP_BY_HOP.has(name.toLowerCase())) continue;
    headers.set(name, Array.isArray(value) ? value.join(", ") : value);
  }
  return headers;
}

const server = http.createServer(async (req, res) => {
  // Render's health check, answered here so it never wakes the API.
  if (req.url === "/relay-health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ status: "ok", target: TARGET }));
    return;
  }

  const url = TARGET + (req.url === "/" ? "" : req.url);
  const hasBody = req.method !== "GET" && req.method !== "HEAD";

  try {
    const upstream = await fetch(url, {
      method: req.method,
      headers: forwardHeaders(req.headers),
      body: hasBody ? req : undefined,
      duplex: hasBody ? "half" : undefined,
      redirect: "manual",
      signal: AbortSignal.timeout(60_000),
    });

    const headers = {};
    upstream.headers.forEach((value, name) => {
      // fetch has already decoded the body.
      if (!HOP_BY_HOP.has(name) && name !== "content-encoding") headers[name] = value;
    });
    res.writeHead(upstream.status, headers);

    if (!upstream.body) {
      res.end();
      return;
    }
    for await (const chunk of upstream.body) res.write(chunk);
    res.end();
  } catch (error) {
    console.error(`[relay] ${req.method} ${req.url} failed:`, error?.message ?? error);
    if (!res.headersSent) {
      res.writeHead(502, { "content-type": "application/json" });
      res.end(JSON.stringify({ statusCode: 502, message: "Upstream API unreachable" }));
    } else {
      res.end();
    }
  }
});

server.listen(PORT, () => console.log(`[relay] forwarding :${PORT} -> ${TARGET}`));
