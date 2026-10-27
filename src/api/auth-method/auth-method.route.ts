import { Router } from "express";
import { changeAuth } from "@/api/auth-method/auth-method.controller.js";
import { getAccessToken } from "@/shared/middlewares/auth.middleware";
import { validateCompanyMiddleware } from "@/shared/middlewares/company.middleware";

const router = Router();

router.all(["/auth/method/change"], getAccessToken, validateCompanyMiddleware);

router.post("/auth/method/change", changeAuth);

export default router;
