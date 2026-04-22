/**
 * Sends a standardised JSON response.
 *
 * Shape:
 *   { success, message, data, meta }
 */
const apiResponse = (res, statusCode, message, data = null, meta = null) => {
  const body = { success: statusCode < 400, message };
  if (data !== null) body.data = data;
  if (meta !== null) body.meta = meta;
  return res.status(statusCode).json(body);
};

// Helper methods for success and error responses
apiResponse.success = (res, message, data = null, meta = null) => {
  return apiResponse(res, 200, message, data, meta);
};

apiResponse.error = (res, statusCode, message, data = null, meta = null) => {
  return apiResponse(res, statusCode, message, data, meta);
};

module.exports = apiResponse;
