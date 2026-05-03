import { randomUUID } from "node:crypto";

// Per-request correlation id. Generated fresh on every request, surfaced as
// the X-Request-Id response header on ALL responses (success + error), and
// included in the JSON body of error responses so users can quote it when
// asking for support.
//
// We do NOT honor a client-supplied X-Request-Id — generating fresh prevents
// log poisoning by malicious clients claiming known IDs.
export function requestId(req, res, next) {
  req.id = randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
}

export default requestId;
