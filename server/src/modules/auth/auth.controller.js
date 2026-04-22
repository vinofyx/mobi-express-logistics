const jwt        = require("jsonwebtoken");
const User       = require("../users/user.model");
const apiResponse = require("../../shared/utils/apiResponse");

const signAccess = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const signRefresh = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return apiResponse(res, 400, "name, email, and password are required.");
    }
    if (password.length < 8) {
      return apiResponse(res, 400, "Password must be at least 8 characters.");
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return apiResponse(res, 409, "An account with that email already exists.");
    }

    const user = await User.create({ name, email, password, role: role || "center_staff" });

    return apiResponse(res, 201, "Account created successfully.", { user });
  } catch (err) {
    if (err.name === "ValidationError") {
      const msg = Object.values(err.errors)[0]?.message || "Validation failed.";
      return apiResponse(res, 422, msg);
    }
    console.error("REGISTER ERROR:", err);
    return apiResponse(res, 500, err.message || "Server error.");
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return apiResponse(res, 400, "Email and password are required.");
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !user.isActive) {
      return apiResponse(res, 401, "Invalid email or password.");
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return apiResponse(res, 401, "Invalid email or password.");
    }

    const accessToken  = signAccess(user._id);
    const refreshToken = signRefresh(user._id);

    // Store refresh token in httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge:   30 * 24 * 60 * 60 * 1000,
    });

    return apiResponse(res, 200, "Login successful.", {
      accessToken,
      refreshToken,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return apiResponse(res, 500, err.message || "Server error.");
  }
};

// POST /api/auth/refresh-token
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) return apiResponse(res, 401, "Refresh token missing.");

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    } catch {
      return apiResponse(res, 401, "Invalid or expired refresh token.");
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) return apiResponse(res, 401, "Account not found.");

    const accessToken = signAccess(user._id);
    return apiResponse(res, 200, "Token refreshed.", { accessToken });
  } catch (err) {
    return apiResponse(res, 500, err.message);
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict" });
  return apiResponse(res, 200, "Logged out successfully.");
};

// GET /api/auth/me
exports.me = async (req, res) => {
  return apiResponse(res, 200, "User retrieved.", { user: req.user });
};
