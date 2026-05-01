// Central error handler — must be registered last in index.js.
// Catches anything passed to next(err) from any route.
export function errorHandler(err, req, res, _next) {
  // TODO: log error with timestamp and route details
  // TODO: distinguish between known API errors (Payal, Shopify) and unexpected ones
  // TODO: never leak stack traces to the client in production
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal server error",
  });
}
