import {
  addPolicyCasbi,
  enforce,
  removePolicyCasbi,
} from "@/scripts/casbiTools";
import { NextFunction, Request, Response } from "express";
import { response } from "../utils/response";
import { CODE_RESPONSE } from "../enums/http-status.enum";
import { ACTION } from "../enums/action-casbin.num";

export const permissionRBAC = (obj: string, action: ACTION) =>  (async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { url, method, headers } = req;
  const {
    locals: { payload },
  } = res;

  const hasPermission = await enforce(
    payload.rol.toLowerCase(),
    obj,
    action,
  );

  if (!hasPermission) {
    const resp = response.error(
      "You do not have permission to access this resource.",
      CODE_RESPONSE.FORBIDDEN,
    );
    return res.status(CODE_RESPONSE.FORBIDDEN).json(resp);
  }
  next();
})
