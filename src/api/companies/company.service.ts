import { Response } from "express";
import { db } from "@/infrastructure/database/connections/pool-connection";
import { companiesTable } from "@/infrastructure/database/drizzle/schema";
import { CODE_RESPONSE } from "@/shared/enums/http-status.enum";
import { PayloadLocals } from "@/shared/enums/utils.enum";
import { response } from "@/shared/utils/response";
import { eq, getTableColumns } from "drizzle-orm";
import { CompanyUpdateDto } from "./companyDto";
import Joi from "joi";

export const getOneCompanyService = async (id: number) => {
  const { trialExpiresAt, ...data } = getTableColumns(companiesTable);
  const company = await db
    .select(data)
    .from(companiesTable)
    .where(eq(companiesTable.id, id));

  const status = company[0] ? CODE_RESPONSE.OK : CODE_RESPONSE.NOT_FOUND;
  const msg = company[0] ? "Get company!" : "Company not found!";
  const resp = response.success(company[0] || [], msg, status);
  return resp;
};

export const getOwnerCompany = async (res: Response) => {
  const { companyId }: PayloadLocals = res.locals.payload;
  return getOneCompanyService(companyId);
};

export const updateCompanyService = async (
  idCompany: number,
  payloadBody: CompanyUpdateDto,
  shemaValidate: Joi.ObjectSchema<any>,
) => {
  const { error, value: payload } = shemaValidate.validate(payloadBody);

  if (error) {
    const details = error.details[0];
    const resp = response.error(
      details?.message || "",
      CODE_RESPONSE.UNPROCESSABLE_ENTITY,
    );
    return resp;
  }

  const company: typeof companiesTable.$inferInsert = payload;

  await db
    .update(companiesTable)
    .set(company)
    .where(eq(companiesTable.id, idCompany));
  const resp = response.success(
    company,
    "Company updated successfully.",
    CODE_RESPONSE.OK,
  );

  return resp;
};


export const deleteCompanyService = async(idCompany: number) => {

  await db.update(companiesTable).set({status: false}).where(eq(companiesTable.id, idCompany));

  const resp = response.success(
    [],
    "Company delete successfully.",
    CODE_RESPONSE.OK,
  );
  return resp;

}