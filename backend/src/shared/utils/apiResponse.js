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

module.exports = apiResponse;
