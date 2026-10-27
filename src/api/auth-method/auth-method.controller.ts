import { Request, Response } from "express";
import { schemaChangeAuthMethod } from "./auth-method.rules.js";
import { response } from "@/shared/utils/response.js";
import { CODE_RESPONSE } from "@/shared/enums/http-status.enum.js";
import { generateUriAutenticator, serviceChangeAuth } from "./auth-method.service.js";
import { AuthChangeMethod, DataBase32 } from "./auth-methodDto.js";
import { TypeAuth } from "../authentication/authenticationDto.js";

export const changeAuth = async (
  req: Request<{}, {}, AuthChangeMethod>,
  res: Response,
) => {
  const { error } = schemaChangeAuthMethod.validate(req.body);
  if (error) {
    const details = error.details[0];
    const resp = response.error(
      details?.message || "",
      CODE_RESPONSE.UNPROCESSABLE_ENTITY,
    );
    return res.status(CODE_RESPONSE.UNPROCESSABLE_ENTITY).json(resp);
  }
  const { accountId } = res.locals.payload
  await serviceChangeAuth(req.body, accountId);

  let data: {method: TypeAuth, otp?: string | null} = { method: req.body.methodAuth}
  if(req.body.methodAuth === 'EMAIL_OTP_2FA' || req.body.methodAuth === 'USERNAME_OTP_2FA') {
    data.otp = await generateUriAutenticator(accountId);
  }
  const resp = response.success(data, "Cambio de método de autenticación éxitoso", CODE_RESPONSE.OK)

  return res.status(CODE_RESPONSE.OK).json(resp);
};
