const jwt        = require("jsonwebtoken");
const User       = require("../modules/users/user.model");
const apiResponse = require("../shared/utils/apiResponse");

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return apiResponse(res, 401, "No token provided. Please log in.");
    }

    const token = header.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const msg = err.name === "TokenExpiredError"
        ? "Session expired. Please log in again."
        : "Invalid token. Please log in again.";
      return apiResponse(res, 401, msg);
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user || !user.isActive) {
      return apiResponse(res, 401, "Account not found or deactivated.");
    }

    req.user = user;
    next();
  } catch (err) {
    return apiResponse(res, 500, "Authentication error.");
  }
};

module.exports = authenticate;
