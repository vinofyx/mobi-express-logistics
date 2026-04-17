const apiResponse = require('../shared/utils/apiResponse');

/**
 * Role guard middleware factory.
 *
 * Usage:
 *   router.delete('/:id', authenticate, authorize('admin'), controller.delete);
 *   router.patch('/assign', authenticate, authorize('admin', 'operations_manager'), controller.assign);
 */
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return apiResponse(res, 401, 'Not authenticated.');
  }

  if (!allowedRoles.includes(req.user.role)) {
    return apiResponse(
      res,
      403,
      `Access denied. Requires one of: [${allowedRoles.join(', ')}].`,
    );
  }

  next();
};

module.exports = authorize;
