import { Response, Request } from "express";
import { CompanyCreateDto, CompanyUpdateDto } from "./companyDto.js";
import {
  schemaCompany,
  schemaUpdateCompanyAdmin,
  schemaUpdateCompanySuperAdmin,
} from "./company.rules.js";
import { CODE_RESPONSE } from "@/shared/enums/http-status.enum";
import { db } from "@/infrastructure/database/connections/pool-connection";
import { companiesTable } from "@/schema";
import { errorCatch, response } from "@/shared/utils/response";
import { and, eq, getTableColumns } from "drizzle-orm";
import { PayloadLocals, ROL_APP } from "@/shared/enums/utils.enum.js";
import {
  deleteCompanyService,
  getOneCompanyService,
  getOwnerCompany,
  updateCompanyService,
} from "./company.service.js";

export const getListCompanies = async (_: Request, res: Response) => {
  const { trialExpiresAt, ...data } = getTableColumns(companiesTable);
  const listCompanies = await db
    .select(data)
    .from(companiesTable)
    .where(getAllListByRol(res));

  const status = listCompanies ? CODE_RESPONSE.OK : CODE_RESPONSE.NOT_FOUND;
  const msg = listCompanies ? "Get all companies!" : "Companies not found!";
  const resp = response.success(listCompanies || [], msg, status);
  return res.status(CODE_RESPONSE.OK).json(resp);
};

const getAllListByRol = (res: Response) => {
  const { rol, companyId }: PayloadLocals = res.locals.payload;
  if (rol.toLowerCase() === ROL_APP.SUPER_ADMIN)
    return eq(companiesTable.status, true);

  return and(eq(companiesTable.status, true), eq(companiesTable.id, companyId));
};

export const getOneCompany = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;

  if (isNaN(Number(id)) || parseInt(id) <= 0) {
    const resp = response.error(
      "The resource ID must be a positive integer.",
      CODE_RESPONSE.BAD_REQUEST,
    );
    return res.status(resp.status).json(resp);
  }

  const resp = await getOneCompanyService(parseInt(id));
  return res.status(resp.status).json(resp);
};

export const getOneCompanyOwner = async (req: Request, res: Response) => {
  const resp = await getOwnerCompany(res);
  return res.status(resp.status).json(resp);
};

export const createCompany = async (
  req: Request<{}, {}, CompanyCreateDto>,
  res: Response,
) => {
  try {
    const { error } = schemaCompany.validate(req.body);

    if (error) {
      const details = error.details[0];
      const resp = response.error(
        details?.message || "",
        CODE_RESPONSE.UNPROCESSABLE_ENTITY,
      );
      return res.status(CODE_RESPONSE.UNPROCESSABLE_ENTITY).json(resp);
    }
    const company: typeof companiesTable.$inferInsert = req.body;

    const dataInsert = {
      ...company,
      expiresAt: new Date(`${req.body.expiresAt}`),
      trialExpiresAt: new Date(`${req.body.trialExpiresAt}`),
    };
    const [result] = await db.insert(companiesTable).values(dataInsert);
    const resp = response.success(
      { id: result.insertId, ...dataInsert },
      "Company was created!",
      CODE_RESPONSE.CREATED,
    );
    return res.json(resp);
  } catch (error) {
    let msg = ["The specified [email] is already in use."];
    return errorCatch(error, res, msg);
  }
};

export const updateCompany = async (
  req: Request<{ id: string }, {}, CompanyUpdateDto>,
  res: Response,
) => {
  try {
    const { id } = req.params;

    if (isNaN(parseInt(id)) || parseInt(id) <= 0) {
      const resp = response.error(
        "The resource ID must be a positive integer.",
        CODE_RESPONSE.BAD_REQUEST,
      );
      return res.status(resp.status).json(resp);
    }

    if (
      (await getOneCompanyService(parseInt(id))).status ===
      CODE_RESPONSE.NOT_FOUND
    ) {
      const resp = response.error(
        "Company not found!",
        CODE_RESPONSE.NOT_FOUND,
      );
      return res.status(resp.status).json(resp);
    }

    const resp = await updateCompanyService(
      parseInt(id),
      req.body,
      schemaUpdateCompanySuperAdmin,
    );

    res.status(resp.status).json(resp);
  } catch (error) {
    let msg = ["The specified [email] is already in use."];
    return errorCatch(error, res, msg);
  }
};

export const updateOwnerCompany = async (
  req: Request<{}, {}, CompanyUpdateDto>,
  res: Response,
) => {
  try {
    const { companyId }: PayloadLocals = res.locals.payload;
    const resp = await updateCompanyService(
      companyId,
      req.body,
      schemaUpdateCompanyAdmin,
    );
    res.status(resp.status).json(resp);
  } catch (error) {
    let msg = ["The specified [email] is already in use."];
    return errorCatch(error, res, msg);
  }
};

export const deleteCompany = async (req: Request<{ id: string }, {}, {}>, res: Response) => {
  try {
    const { id } = req.params;

    if (isNaN(parseInt(id)) || parseInt(id) <= 0) {
      const resp = response.error(
        "The resource ID must be a positive integer.",
        CODE_RESPONSE.BAD_REQUEST,
      );
      return res.status(resp.status).json(resp);
    }

    if (
      (await getOneCompanyService(parseInt(id))).status ===
      CODE_RESPONSE.NOT_FOUND
    ) {
      const resp = response.error(
        "Company not found!",
        CODE_RESPONSE.NOT_FOUND,
      );
      return res.status(resp.status).json(resp);
    }

    const resp = await deleteCompanyService(parseInt(id));
    return res.status(resp.status).json(resp);
    
  } catch (error) {
    console.log("Errorregseseg ", error)
    return errorCatch(error, res);
  }

}
