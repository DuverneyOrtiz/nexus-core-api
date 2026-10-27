import { db } from "@/infrastructure/database/connections/pool-connection";
import {
  accountsTable,
  companiesTable,
  usersTable,
} from "@/infrastructure/database/drizzle/schema";
import { getTableColumns, eq, or } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import { response } from "../utils/response";
import { CODE_RESPONSE } from "../enums/http-status.enum";
import dayjs from "dayjs";

export const validateCompanyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { companyId } = res.locals.payload;

  const { expiresAt, trialExpiresAt } = getTableColumns(companiesTable);
  const query = await db
    .select({ expiresAt, trialExpiresAt })
    .from(companiesTable)
    .where(eq(companiesTable.id, companyId));

  if (!query[0]) {
    const resp = response.error(
      "The company does not exist!",
      CODE_RESPONSE.NOT_FOUND,
    );
    return res.status(CODE_RESPONSE.NOT_FOUND).json(resp);
  }

  if (query[0].expiresAt && query[0].trialExpiresAt) {
    const isValideTrial = trial_expires_at(query[0].expiresAt);
    const isValidExpired = expires_at(query[0].trialExpiresAt);

    if (isValideTrial && isValidExpired) {
      const resp = response.error(
        "The company has expired.!",
        CODE_RESPONSE.FORBIDDEN,
      );
      return res.status(CODE_RESPONSE.FORBIDDEN).json(resp);
    }
  }
  next();
};

const trial_expires_at = (trialExpiresAt: Date): Boolean => {
  return dayjs().isAfter(dayjs(trialExpiresAt));
};

const expires_at = (expiredAt: Date): Boolean => {
  return dayjs().isAfter(dayjs(expiredAt));
};

export const validateCompanyAuthMiddleware = async (
  req: Request<{}, {}, { emailOrUser: string }>,
  res: Response,
  next: NextFunction,
) => {
  const { emailOrUser } = req.body;
  const { expiresAt } = getTableColumns(companiesTable);
  const [query] = await db
    .select({ expiresAt })
    .from(companiesTable)
    .innerJoin(usersTable, eq(usersTable.companyId, companiesTable.id))
    .innerJoin(accountsTable, eq(accountsTable.userId, usersTable.id))
    .where(
      or(
        eq(accountsTable.email, emailOrUser),
        eq(accountsTable.username, emailOrUser),
      ),
    );

  if (!query || !query.expiresAt) {
    const resp = response.error(
      "The company does not exist!",
      CODE_RESPONSE.NOT_FOUND,
    );
    return res.status(CODE_RESPONSE.NOT_FOUND).json(resp);
  }

  const isExpired = expires_at(query.expiresAt);

  if (isExpired) {
    const resp = response.error(
      "The company has expired.!",
      CODE_RESPONSE.FORBIDDEN,
    );
    return res.status(CODE_RESPONSE.FORBIDDEN).json(resp);
  }

  next();
};
