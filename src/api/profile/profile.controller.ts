import { Request, Response } from "express";
import { errorCatch } from "@/shared/utils/response";
import { PayloadLocals } from "@/shared/enums/utils.enum";
import { getProfileService } from "./profile.service";

export const getProfile = async (_: Request, res: Response) => {
  try {
    const { accountId } = res.locals.payload as PayloadLocals;
    const resp = await getProfileService(accountId);

    res.status(resp.status).json(resp);
    
  } catch (error) {
    return errorCatch(error, res);
  }
}