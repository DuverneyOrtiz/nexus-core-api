import { Router } from "express";
import { getAccessToken } from "@/shared/middlewares/auth.middleware";
import { validateCompanyMiddleware } from "@/shared/middlewares/company.middleware";
import { permissionRBAC } from "@/shared/middlewares/permission.middleware";
import { ACTION } from "@/shared/enums/action-casbin.num";
import { getProfile } from "./profile.controller";

const router = Router();

const module = "profile";

router.all(["/profile"], getAccessToken, validateCompanyMiddleware);

router.get("/profile", permissionRBAC(module, ACTION.SEARCH), getProfile);

export default router;
