const apiResponse = (res, statusCode, message, data = null, meta = null) => {
  const body = { success: statusCode < 400, message };
  if (data !== null) body.data = data;
  if (meta !== null) body.meta = meta;
  return res.status(statusCode).json(body);
};

apiResponse.success = (res, message, data = null) => apiResponse(res, 200, message, data);
apiResponse.error = (res, statusCode, message) => apiResponse(res, statusCode, message);

module.exports = apiResponse;
