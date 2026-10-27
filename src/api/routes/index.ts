import routerCompanies from "../companies/company.route.js";
import routerRoles from "../roles/rol.route.js";
import routerRolPermissions from "../roles_permisos/rol_permission.route.js";
import routerUsers from "../users/user.route.js";
import routerAccounts from "../accounts/account.route.js";
import routerAuth from "../authentication/authentication.route.js";
import routerAuthMethod from "../auth-method/auth-method.route.js";
import routerProfile from "../profile/profile.route.js";

export default [
  routerCompanies,
  routerRoles,
  routerRolPermissions,
  routerUsers,
  routerAccounts,
  routerAuth,
  routerAuthMethod,
  routerProfile,
];
