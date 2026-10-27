export const rbac = [
  // companies
  ["super administrador", "companies", "read_all"],
  ["super administrador", "companies", "read_one"],
  ["super administrador", "companies", "create"],
  ["super administrador", "companies", "update"],
  ["super administrador", "companies", "delete"],
  ["super administrador", "companies", "read_owner"],
  ["super administrador", "companies", "update_owner"],

  // permissions
  // ["super administrador", "permissions", "read_all"],
  // ["super administrador", "permissions", "read_one"],
  // ["super administrador", "permissions", "create"],
  // ["super administrador", "permissions", "update"],
  // ["super administrador", "permissions", "delete"],

  // users
  ["super administrador", "users", "read_all"],
  ["super administrador", "users", "read_one"],
  ["super administrador", "users", "create"],
  ["super administrador", "users", "update"],
  ["super administrador", "users", "delete"],

  // accounts
  ["super administrador", "accounts", "read_all"],
  ["super administrador", "accounts", "read_one"],
  ["super administrador", "accounts", "create"],
  ["super administrador", "accounts", "update"],
  ["super administrador", "accounts", "delete"],
  ["super administrador", "accounts", "read_owner"],
  ["super administrador", "accounts", "read_by_company"],

  // profile
  ["super administrador", "profile", "read_all"],

  // policy
  ["super administrador", "policy", "create"],
  ["super administrador", "policy", "delete"],
  ["super administrador", "policy", "all_subjects"],

  // roles
  ["super administrador", "roles", "create"],
  ["super administrador", "roles", "read_all"],
  ["super administrador", "roles", "read_one"],
  ["super administrador", "roles", "update"],
  ["super administrador", "roles", "delete"],

  // companies
  ["administrador", "companies", "update_owner"],
  ["administrador", "companies", "read_owner"],

  // users
  ["administrador", "users", "read_all"],
  ["administrador", "users", "read_one"],
  ["administrador", "users", "create"],
  ["administrador", "users", "update"],
  ["administrador", "users", "delete"],
  ["administrador", "users", "read_owner"],

  // accounts
  ["administrador", "accounts", "read_all"],
  ["administrador", "accounts", "read_one"],
  ["administrador", "accounts", "create"],
  ["administrador", "accounts", "update"],
  ["administrador", "accounts", "delete"],
  ["administrador", "accounts", "read_owner"],

  // roles
  ["administrador", "roles", "read_all"],
  ["administrador", "roles", "create"],
  ["administrador", "roles", "read_one"],
  ["administrador", "roles", "update"],
  ["administrador", "roles", "delete"],

  // profile
  ["administrador", "profile", "read_all"],
]
