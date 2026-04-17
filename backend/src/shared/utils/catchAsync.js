/**
 * Wraps an async Express handler so unhandled rejections are forwarded
 * to the next(err) error middleware automatically.
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
