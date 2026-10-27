import { Router } from "express";
import { getListRoles, createRol, updateRol, getOneRol, getListRolesByPage, deleteRol } from "@/api/roles/rol.controller";
import { getAccessToken } from "@/shared/middlewares/auth.middleware";
import { validateCompanyMiddleware } from "@/shared/middlewares/company.middleware";
import { permissionRBAC } from "@/shared/middlewares/permission.middleware";
import { ACTION } from "@/shared/enums/action-casbin.num";

const router = Router();

const module = "roles";

router.all(["/roles", "/roles/:id", "/rol", "/rol/:id"], getAccessToken, validateCompanyMiddleware);

router.get("/roles", permissionRBAC(module, ACTION.SEARCH), getListRoles);
router.get("/roles/:id", permissionRBAC(module, ACTION.SEARCH_ONE), getOneRol);
router.post("/rol", permissionRBAC(module, ACTION.CREATE), createRol);
router.put("/rol/:id", permissionRBAC(module, ACTION.UPDATE), updateRol);
router.delete("/rol/:id", permissionRBAC(module, ACTION.DELETE), deleteRol);

export default router;
