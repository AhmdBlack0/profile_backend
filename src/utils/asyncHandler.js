/** Express 4: forwards async rejections to errorHandler via next(err). */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
