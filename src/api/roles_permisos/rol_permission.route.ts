import { Router } from "express";
import { addPolicy,  listPolicyBySucject,  removePolicy } from "@/api/roles_permisos/rol_permission.controller";
import { getAccessToken } from "@/shared/middlewares/auth.middleware";
import { validateCompanyMiddleware } from "@/shared/middlewares/company.middleware";
import { ACTION } from "@/shared/enums/action-casbin.num";
import { permissionRBAC } from "@/shared/middlewares/permission.middleware";

const router = Router();

router.all(["/add/policy", "/remove/policy", "/permissions"], getAccessToken, validateCompanyMiddleware);

router.post("/add/policy", permissionRBAC("policy", ACTION.CREATE), addPolicy);
router.post("/remove/policy", permissionRBAC("policy", ACTION.DELETE), removePolicy);
router.get("/permissions", permissionRBAC("policy", ACTION.ALL_SUBJECTS), listPolicyBySucject)
export default router;
