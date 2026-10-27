import { Router } from "express";
import { getListUsers, getOneUser, createUser, updateUser, deleteUser } from "@/api/users/user.controller";
import { getAccessToken } from "@/shared/middlewares/auth.middleware";
import { validateCompanyMiddleware } from "@/shared/middlewares/company.middleware";
import { permissionRBAC } from "@/shared/middlewares/permission.middleware";
import { ACTION } from "@/shared/enums/action-casbin.num";
import { validateCreateUser } from "@/shared/middlewares/user.middleware";

const router = Router();

const module = "users";

router.all(["/users", "/user", "/user/:id"], getAccessToken, validateCompanyMiddleware);

router.get("/users", permissionRBAC(module, ACTION.SEARCH), getListUsers);
router.get("/user/:id", permissionRBAC(module, ACTION.SEARCH_ONE), getOneUser);
router.post("/user", permissionRBAC(module, ACTION.CREATE), validateCreateUser, createUser);
router.put("/user/:id", permissionRBAC(module, ACTION.UPDATE), updateUser);
router.delete("/user/:id", permissionRBAC(module, ACTION.DELETE), deleteUser);

export default router;
