import { Request, Response, NextFunction } from "express";
import { ERROR, response, SUCCESS } from "../utils/response";
import { CODE_RESPONSE } from "../enums/http-status.enum";
import { verifyAccessToken } from "../utils/security";
import { JwtPayload } from "jsonwebtoken";
import { db } from "@/infrastructure/database/connections/pool-connection";
import { accountsTable } from "@/infrastructure/database/drizzle/schema";
import { eq, getTableColumns } from "drizzle-orm";

export const getAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];

  const isValidHeder = validateHeaderAuthorization(authHeader) as SUCCESS<{
    token: string;
  }>;

  if (isValidHeder.status === CODE_RESPONSE.UNAUTHORIZED) {
    return res.status(CODE_RESPONSE.UNAUTHORIZED).json(isValidHeder);
  }

  const isValidToken = (await validateToken(
    isValidHeder.data.token,
  )) as SUCCESS<{ companyId: number; accountId: number }>;

  if (isValidToken.status === CODE_RESPONSE.UNAUTHORIZED) {
    return res.status(CODE_RESPONSE.UNAUTHORIZED).json(isValidToken);
  }
  res.locals.payload = isValidToken.data;

  const isActiveAccount = await validateActiveAccount(isValidToken.data.accountId);

  if(isActiveAccount.status === CODE_RESPONSE.FORBIDDEN || isActiveAccount.status === CODE_RESPONSE.UNAUTHORIZED ) {
    return res.status(isActiveAccount.status).json(isActiveAccount);
  }
  next();
};

const validateHeaderAuthorization = (
  authHeader: string | undefined,
): ERROR | SUCCESS<string> => {
  if (
    (!authHeader && typeof authHeader !== "string") ||
    (typeof authHeader === "string" && !authHeader.startsWith("Bearer "))
  ) {
    return response.error(
      "Acceso denegado. Token no proporcionado o formato inválido.",
      CODE_RESPONSE.UNAUTHORIZED,
    );
  }

  return response.success({ token: authHeader }, "", CODE_RESPONSE.OK);
};

const validateToken = async (
  token: string,
): Promise<ERROR | SUCCESS<{ companyId: number; accountId: number }>> => {
  try {
    const accessToken = token.split(" ")[1];
    if (!accessToken) {
      return response.error(
        "Acceso denegado. Token no proporcionado o formato inválido.",
        CODE_RESPONSE.UNAUTHORIZED,
      );
    }

    const { payload } = (await verifyAccessToken(accessToken)) as JwtPayload;

    return response.success(
      { companyId: payload.companyId, accountId: payload.accountId, rolId: payload.rolId, rol: payload.rol, idUser: payload.sub },
      "",
      CODE_RESPONSE.OK,
    );
  } catch (error) {
    return response.error(
      "Acceso denegado. Token no proporcionado o formato inválido.",
      CODE_RESPONSE.UNAUTHORIZED,
    );
  }
};

const validateActiveAccount = async (accountId: number) => {
  try {    
    const { isActive } = getTableColumns(accountsTable);
    const [query] = await db
      .select({ isActive })
      .from(accountsTable)
      .where(eq(accountsTable.id, accountId));

    if (!query || !query.isActive) {
      return response.error(
        "The account is not available.",
        CODE_RESPONSE.FORBIDDEN,
      );
    }

    return response.success([],
      "",
      CODE_RESPONSE.OK,
    );
  } catch (error) {
    return response.error(
      "Acceso denegado. Token no proporcionado o formato inválido.",
      CODE_RESPONSE.UNAUTHORIZED,
    );
  }
};
