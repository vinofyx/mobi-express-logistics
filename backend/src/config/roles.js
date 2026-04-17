// ─── Role constants ────────────────────────────────────────────────────────────
const ROLES = Object.freeze({
  ADMIN:             'admin',
  OPS_MANAGER:       'operations_manager',
  FIELD_AGENT:       'field_agent',
  CENTER_STAFF:      'center_staff',
  HUB_STAFF:         'hub_staff',
});

// ─── Permission matrix ─────────────────────────────────────────────────────────
// Maps each role to the set of actions it may perform.
const PERMISSIONS = Object.freeze({
  [ROLES.ADMIN]: [
    'user:create', 'user:read', 'user:update', 'user:delete',
    'customer:create', 'customer:read', 'customer:update', 'customer:delete',
    'pickup:create', 'pickup:read', 'pickup:update', 'pickup:assign', 'pickup:delete',
    'parcel:create', 'parcel:read', 'parcel:update', 'parcel:delete',
    'shipment:create', 'shipment:read', 'shipment:update', 'shipment:delete',
  ],

  [ROLES.OPS_MANAGER]: [
    'customer:create', 'customer:read', 'customer:update',
    'pickup:create', 'pickup:read', 'pickup:update', 'pickup:assign',
    'parcel:create', 'parcel:read', 'parcel:update',
    'shipment:create', 'shipment:read', 'shipment:update',
    'user:read',
  ],

  [ROLES.FIELD_AGENT]: [
    'pickup:read', 'pickup:update',
    'parcel:read',
    'customer:read',
  ],

  [ROLES.CENTER_STAFF]: [
    'customer:create', 'customer:read', 'customer:update',
    'pickup:create', 'pickup:read', 'pickup:update',
    'parcel:create', 'parcel:read', 'parcel:update',
    'shipment:read',
  ],

  [ROLES.HUB_STAFF]: [
    'parcel:read', 'parcel:update',
    'shipment:read', 'shipment:update',
    'pickup:read',
  ],
});

/**
 * Returns true when `role` is permitted to perform `action`.
 * @param {string} role
 * @param {string} action  e.g. 'parcel:update'
 */
const can = (role, action) => {
  const perms = PERMISSIONS[role] ?? [];
  return perms.includes(action);
};

module.exports = { ROLES, PERMISSIONS, can };
