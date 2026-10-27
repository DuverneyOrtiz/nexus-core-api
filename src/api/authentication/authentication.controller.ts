import { Response, Request } from "express";
import {
  authentication,
  signInService,
} from "./authentication.service";

export const Auth = async (
  req: Request<{}, {}, { emailOrUser: string }>,
  res: Response,
) => {
  const { emailOrUser } = req.body;
  const resp = await authentication(emailOrUser);

  return res.status(resp?.status).json(resp);
};

export const signIn = async (
  req: Request<{}, {}, { emailOrUser: string; authCredential: number }>,
  res: Response,
) => {
  const { emailOrUser, authCredential } = req.body;

  const resp = await signInService(emailOrUser, authCredential);

  return res.status(resp?.status).json(resp);
};
