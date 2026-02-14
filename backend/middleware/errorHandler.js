export function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err.message)

  if (err.status === 401 || err.code === 'invalid_api_key') {
    return res.status(500).json({
      error: 'AI service configuration error. Please check the API key.',
    })
  }

  if (err.status === 429) {
    return res.status(429).json({
      error: 'Too many requests. Please wait a moment and try again.',
    })
  }

  if (err.code === 'insufficient_quota') {
    return res.status(503).json({
      error: 'AI service quota exceeded. Please try again later.',
    })
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  })
}
