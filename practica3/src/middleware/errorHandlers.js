// Handles invalid JSON body and generic errors
function jsonErrorHandler(err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON body' });
  }
  next(err);
}

function genericErrorHandler(err, req, res, next) {
  console.error(err);
  if (res.headersSent) return next(err);
  if (err.statusCode) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  res.status(500).json({ message: 'Internal Server Error' });
}

module.exports = { jsonErrorHandler, genericErrorHandler };
