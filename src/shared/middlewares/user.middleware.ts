import { db } from "@/infrastructure/database/connections/pool-connection";
import { accountsTable } from "@/infrastructure/database/drizzle/schema";
import { eq, getTableColumns, or } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import { ERROR, response, SUCCESS } from "../utils/response";
import { CODE_RESPONSE } from "../enums/http-status.enum";
import { AuthenticationCreateDto } from "@/api/authentication/authenticationDto";
import { schemaCreateUser } from "@/api/users/user.rules";
import { UserCreateDto } from "@/api/users/userDto";

export const validateAccountMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { accountId } = res.locals.payload;

  
  const { isActive } = getTableColumns(accountsTable);

  const [query] = await db
    .select({ isActive })
    .from(accountsTable)
    .where(eq(accountsTable.id, accountId));

  if (!query) {
    const resp = response.error(
      "Sign-in failed. Please check your credentials and try again.!",
      CODE_RESPONSE.UNAUTHORIZED,
    );
    return res.status(CODE_RESPONSE.UNAUTHORIZED).json(resp);
  }

  if (!query.isActive) {
    const resp = response.error(
      "Sign-in failed. Please check your credentials and try again.!",
      CODE_RESPONSE.UNAUTHORIZED,
    );
    return res.status(CODE_RESPONSE.UNAUTHORIZED).json(resp);
  }

  next();
};

export const validateAccountAuthMiddleware = async (
  req: Request<{}, {}, { emailOrUser: string }>,
  res: Response,
  next: NextFunction,
) => {
  const { emailOrUser } = req.body;

  const isValidateAccount = await validateAccount(emailOrUser);

  if (isValidateAccount.status === CODE_RESPONSE.UNAUTHORIZED)
    return res.status(CODE_RESPONSE.FORBIDDEN).json(isValidateAccount);

  next();
};

export const validateAccount = async (
  emailOrUser: string,
): Promise<SUCCESS<AuthenticationCreateDto[]> | ERROR> => {
  try {
    const [query] = await db
      .select()
      .from(accountsTable)
      .where(
        or(
          eq(accountsTable.email, emailOrUser),
          eq(accountsTable.username, emailOrUser),
        ),
      );

    if (!query) {
      return response.error(
        "The provided account identifier was not found.",
        CODE_RESPONSE.UNAUTHORIZED,
      );
    }

    if (!query.isActive) {
      return response.error(
        "The provided account identifier was not found.",
        CODE_RESPONSE.UNAUTHORIZED,
      );
    }

    return response.success(query, "Data success", CODE_RESPONSE.OK);
  } catch (error) {
    return response.error(
      "The provided account identifier was not found.",
      CODE_RESPONSE.UNAUTHORIZED,
    );
  }
};

export const validateCreateUser = async (
  req: Request<{}, {}, UserCreateDto>,
  res: Response,
  next: NextFunction,
) => {
  const { companyId: idCompany } = req.body;
  const { rol } = res.locals.payload;  
  const { error } = schemaCreateUser(rol.toLowerCase()).validate({ companyId: idCompany }, { convert: false });

  if (error) {
    const details = error.details[0];
    const resp = response.error(
      details?.message || "",
      CODE_RESPONSE.UNPROCESSABLE_ENTITY,
    );
    return res.status(CODE_RESPONSE.UNPROCESSABLE_ENTITY).json(resp);
  }

  if (idCompany) res.locals.payload.companyId = idCompany;

  next()
};
