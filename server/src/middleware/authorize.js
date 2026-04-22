const apiResponse = require("../shared/utils/apiResponse");

// Usage: authorize("admin", "operations_manager")
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return apiResponse(res, 401, "Not authenticated.");
  }
  if (!roles.includes(req.user.role)) {
    return apiResponse(res, 403, `Access denied. Allowed roles: ${roles.join(", ")}.`);
  }
  next();
};

module.exports = authorize;
