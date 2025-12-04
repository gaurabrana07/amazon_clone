/**
 * Catch Async Function
 * Wrapper function to catch async errors and pass them to the global error handler
 */

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;