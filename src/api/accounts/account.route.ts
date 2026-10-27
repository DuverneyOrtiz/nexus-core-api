import { Router } from "express";
import { getListAccount, getOneAccount, getAccountByIdUser, createAccount, updateAccount, getListAccountsByCompany, deleteAccount } from "@/api/accounts/account.controller";
import { getAccessToken } from "@/shared/middlewares/auth.middleware";
import { validateCompanyMiddleware } from "@/shared/middlewares/company.middleware";
import { permissionRBAC } from "@/shared/middlewares/permission.middleware";
import { ACTION } from "@/shared/enums/action-casbin.num";

const router = Router();

const module = "accounts";

router.all(["/account/owner", "/account", "/account/company/:id", "/account/:id", "/account/user/:idUser"], getAccessToken, validateCompanyMiddleware);

router.get("/account/owner", permissionRBAC(module, ACTION.SEARCH_OWNER), getListAccount);
router.get("/account/company/:id", permissionRBAC(module, ACTION.SEARCH_BY_COMPANY), getListAccountsByCompany);
router.get("/account/:id", permissionRBAC(module, ACTION.SEARCH_ONE), getOneAccount);
router.get("/account/user/:idUser", permissionRBAC(module, ACTION.SEARCH_ONE), getAccountByIdUser);
router.post("/account", permissionRBAC(module, ACTION.CREATE), createAccount);
router.put("/account/:id", permissionRBAC(module, ACTION.UPDATE), updateAccount);
router.delete("/account/:id", permissionRBAC(module, ACTION.DELETE), deleteAccount);


export default router;
