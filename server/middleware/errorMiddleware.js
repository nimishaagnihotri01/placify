export function notFound(req, res, next) {
  res.status(404)
  next(new Error(`Route not found: ${req.originalUrl}`))
}

export function errorHandler(error, req, res, next) {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode
  let message = error.message || 'Server error'

  if (error.name === 'CastError') {
    statusCode = 404
    message = 'Placement drive not found'
  }

  if (error.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(error.errors)
      .map((item) => item.message)
      .join(', ')
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  })
}
