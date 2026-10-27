import { Router } from "express";
import { getListCompanies, getOneCompany, createCompany, updateCompany, getOneCompanyOwner, updateOwnerCompany, deleteCompany } from "@/api/companies/company.controller";
import { getAccessToken } from "@/shared/middlewares/auth.middleware";
import { validateCompanyMiddleware } from "@/shared/middlewares/company.middleware";
import { permissionRBAC } from "@/shared/middlewares/permission.middleware";
import { ACTION } from "@/shared/enums/action-casbin.num";

const router = Router();
const module = "companies";

router.all(["/companies", "/companies/:id"], getAccessToken, validateCompanyMiddleware);

router.get("/companies", permissionRBAC(module, ACTION.SEARCH), getListCompanies);
router.get("/companies/owner", permissionRBAC(module, ACTION.SEARCH_OWNER), getOneCompanyOwner);
router.get("/companies/:id", permissionRBAC(module, ACTION.SEARCH_ONE), getOneCompany);
router.post("/companies", permissionRBAC(module, ACTION.CREATE), createCompany);
router.put("/companies/owner", permissionRBAC(module, ACTION.UPDATE_OWNER), updateOwnerCompany);
router.put("/companies/:id", permissionRBAC(module, ACTION.UPDATE), updateCompany);
router.delete("/companies/:id", permissionRBAC(module, ACTION.DELETE), deleteCompany);

export default router;
