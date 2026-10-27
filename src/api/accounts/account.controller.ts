import { Response, Request } from "express";
import { CODE_RESPONSE } from "@/shared/enums/http-status.enum";
import { errorCatch, response } from "@/shared/utils/response";
import { AccountCreateDto, AccountUpdateDto } from "./accountDto.js";
import { schemaCreateAccount, schemaUpdateAccount } from "./account.rules.js";
import {
  createAccountService,
  deleteAccountService,
  getAccountByIdUserService,
  getListAccountsByCompanyService,
  getListAccountSevice,
  getOneAccountService,
  updateAccountService,
} from "./account.service.js";
import { getOneCompanyService } from "../companies/company.service.js";
import { PayloadLocals } from "@/shared/enums/utils.enum.js";

export const getListAccount = async (_: Request, res: Response) => {
  try {
    const resp = await getListAccountSevice(res.locals.payload);
    return res.status(resp.status).json(resp);
  } catch (error) {
    return errorCatch(error, res);
  }
};

export const getListAccountsByCompany = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const { id } = req.params;

    if (isNaN(Number(id)) || parseInt(id) <= 0) {
      const resp = response.error(
        "The resource ID must be a positive integer.",
        CODE_RESPONSE.BAD_REQUEST,
      );
      return res.status(resp.status).json(resp);
    }

    const isValidCompany = await getOneCompanyService(parseInt(id));

    if (isValidCompany.status === CODE_RESPONSE.NOT_FOUND) {
      return res.status(isValidCompany.status).json(isValidCompany);
    }

    const resp = await getListAccountsByCompanyService(parseInt(id));
    return res.status(resp.status).json(resp);
  } catch (error) {
    return errorCatch(error, res);
  }
};

export const getOneAccount = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { companyId }: PayloadLocals = res.locals.payload;

    if (isNaN(Number(id)) || parseInt(id) <= 0) {
      const resp = response.error(
        "The resource ID must be a positive integer.",
        CODE_RESPONSE.BAD_REQUEST,
      );
      return res.status(resp.status).json(resp);
    }

    const resp = await getOneAccountService(parseInt(id), companyId);
    return res.status(resp.status).json(resp);
  } catch (error) {
    return errorCatch(error, res);
  }
};

export const getAccountByIdUser = async (
  req: Request<{ idUser: string }>,
  res: Response,
) => {
  const { idUser } = req.params;

  const { companyId }: PayloadLocals = res.locals.payload;

  if (isNaN(Number(idUser)) || parseInt(idUser) <= 0) {
    const resp = response.error(
      "The resource ID must be a positive integer.",
      CODE_RESPONSE.BAD_REQUEST,
    );
    return res.status(resp.status).json(resp);
  }

  const resp = await getAccountByIdUserService(parseInt(idUser), companyId);

  return res.status(resp.status).json(resp);
};

export const createAccount = async (
  req: Request<{}, {}, AccountCreateDto>,
  res: Response,
) => {
  try {
    const { error, value } = schemaCreateAccount.validate(req.body);

    if (error) {
      const details = error.details[0];
      const resp = response.error(
        details?.message || "",
        CODE_RESPONSE.UNPROCESSABLE_ENTITY,
      );
      return res.status(CODE_RESPONSE.UNPROCESSABLE_ENTITY).json(resp);
    }
    const payload = res.locals.payload as PayloadLocals;
    const resp = await createAccountService(value, payload);

    return res.status(resp.status).json(resp);
  } catch (error) {
    return errorCatch(error, res);
  }
};

export const updateAccount = async (
  req: Request<{ id: string }, {}, AccountUpdateDto>,
  res: Response,
) => {
  try {
    const { id } = req.params;

    if (isNaN(Number(id)) || parseInt(id) <= 0) {
      const resp = response.error(
        "The resource ID must be a positive integer.",
        CODE_RESPONSE.BAD_REQUEST,
      );
      return res.status(resp.status).json(resp);
    }

    const { error, value } = schemaUpdateAccount.validate(req.body, {
      convert: false,
    });

    if (error) {
      const details = error.details[0];
      const resp = response.error(
        details?.message || "",
        CODE_RESPONSE.UNPROCESSABLE_ENTITY,
      );
      return res.status(CODE_RESPONSE.UNPROCESSABLE_ENTITY).json(resp);
    }
    const payload = res.locals.payload as PayloadLocals;
    const resp = await updateAccountService(parseInt(id), value, payload);

    return res.status(resp.status).json(resp);
  } catch (error) {
    return errorCatch(error, res);
  }
};

export const deleteAccount = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response,
) => {
  try {
    const { id } = req.params;

    if (isNaN(Number(id)) || parseInt(id) <= 0) {
      const resp = response.error(
        "The resource ID must be a positive integer.",
        CODE_RESPONSE.BAD_REQUEST,
      );
      return res.status(resp.status).json(resp);
    }

    const payload = res.locals.payload as PayloadLocals;
    const resp = await deleteAccountService(parseInt(id), payload);
    return res.status(resp.status).json(resp);

  } catch (error) {
    return errorCatch(error, res);
  }
};
