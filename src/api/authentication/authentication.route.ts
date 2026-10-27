import { Router } from "express";
import { Auth, signIn } from "@/api/authentication/authentication.controller";
import { validateAccountAuthMiddleware } from "@/shared/middlewares/user.middleware";
import { validateCompanyAuthMiddleware } from "@/shared/middlewares/company.middleware";


const router = Router();

router.all(["/login", "/signIn"], validateAccountAuthMiddleware, validateCompanyAuthMiddleware);

router.post("/login", Auth);
router.post("/signIn", signIn);

export default router;
