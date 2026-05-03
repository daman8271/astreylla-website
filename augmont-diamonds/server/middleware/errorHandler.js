import { randomUUID } from "node:crypto";

// Central error handler — registered at the tail of the middleware stack in
// index.js. Catches anything passed to next(err) from any route or middleware.
//
// Design contract:
//   - 5xx response bodies in production NEVER echo err.message (could leak DB
//     hosts via ECONNREFUSED, Prisma table/column names, file paths from stack
//     frames). Always opaque "Something went wrong".
//   - 4xx response bodies echo err.message in both envs — 4xx is
//     client-actionable validation feedback, intended to be helpful.
//   - All envs: full Error object (incl. stack) is logged server-side.
//   - All responses include X-Request-Id header (set by the requestId
//     middleware; this handler is double-defensive in case the middleware was
//     skipped on some path).
//
// Inline error responses produced by routes (rateLimit 429, validation 400s,
// Augmont UPSTREAM_TIMEOUT 503, etc.) bypass this handler — they emit
// res.status().json() directly. Only `next(err)` paths land here.

const PROD_5XX_FALLBACK = "Something went wrong";
const SUMMARY_MAX_LEN = 200;

function isProd() {
  return process.env.NODE_ENV === "production";
}

// Single-line, grep-friendly summary of err — collapses whitespace (incl.
// newlines) so the summary log line stays parseable even when upstream errors
// embed line-wrapped diagnostics. Truncates at 200 chars.
function summarizeError(err) {
  let msg;
  if (err == null) msg = "<no error>";
  else if (typeof err === "string") msg = err;
  else if (typeof err === "object") {
    if (err.message) msg = err.message;
    else if (err.name) msg = err.name;
    else {
      try { msg = JSON.stringify(err); } catch { msg = "<unstringifiable>"; }
    }
  } else {
    msg = String(err);
  }
  const flat = String(msg).replace(/[\n\r\t]+/g, " ").trim();
  return flat.length > SUMMARY_MAX_LEN
    ? flat.slice(0, SUMMARY_MAX_LEN) + "..."
    : flat;
}

// err.status may be missing, a string, or out of range — coerce to 500 unless
// it's a valid integer in [400, 600).
function resolveStatus(err) {
  const s = err && err.status;
  if (Number.isInteger(s) && s >= 400 && s < 600) return s;
  return 500;
}

export function errorHandler(err, req, res, _next) {
  const status = resolveStatus(err);
  const id = (req && req.id) || randomUUID();

  // Single-line, grep-friendly summary first — support workflow:
  //   railway logs ... | grep "requestId=<id>"
  // returns this structured summary; piping with `-A N` from there pulls in
  // the multi-line detail dump that follows.
  console.error(
    `[error] requestId=${id} status=${status} method=${req && req.method} url=${req && (req.originalUrl || req.url)} message=${summarizeError(err)}`
  );
  // Full Error (incl. stack) on a separate call so readability stays intact —
  // Node's util.format spans multiple lines for Error objects.
  console.error(`[error.detail] requestId=${id}`, err);

  // Don't double-respond if a route handler already started writing the
  // response (mid-stream failure). Express's default error close handles it.
  if (res.headersSent) {
    return _next(err);
  }

  // Belt-and-suspenders: re-set the header in case the requestId middleware
  // was skipped on this path.
  if (!res.getHeader("X-Request-Id")) {
    res.setHeader("X-Request-Id", id);
  }

  let body;
  if (isProd()) {
    if (status >= 500) {
      body = { error: PROD_5XX_FALLBACK, requestId: id };
    } else {
      // 4xx: echo err.message — validation feedback the client needs.
      body = { error: (err && err.message) || "Request failed", requestId: id };
    }
  } else {
    body = {
      error:
        (err && err.message) ||
        (typeof err === "string" ? err : "Unknown error"),
      requestId: id,
      stack: err && err.stack,
    };
    // Surface non-Error throws (e.g. plain object) so dev can see what came in.
    if (err && typeof err === "object" && !err.stack) {
      body.details = err;
    }
  }

  res.status(status).json(body);
}

export default errorHandler;
