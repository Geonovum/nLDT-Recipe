/**
 * Wraps an async route handler so that rejected promises are passed to next(err).
 * Use this so you can write async route handlers without try/catch in every handler.
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default asyncHandler;
