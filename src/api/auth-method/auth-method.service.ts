import { base32 } from "rfc4648";
import { AuthChangeMethod, DataBase32 } from "./auth-methodDto";
import { TypeAuth } from "../authentication/authenticationDto";
import { generateHash, totp } from "@/shared/utils/security";
import { db } from "@/infrastructure/database/connections/pool-connection";
import { authenticationTable } from "@/infrastructure/database/drizzle/schema";
import { eq } from "drizzle-orm";
import { generateDataTosession } from "../authentication/authentication.service";

export const serviceChangeAuth = async (
  data: AuthChangeMethod,
  accountId: number,
) => {
  const { methodAuth, password } = data;
  let newData: { typeAuth: TypeAuth; passwordHash?: string | null } = {
    typeAuth: methodAuth,
    passwordHash: null,
  };

  if (
    (methodAuth === "EMAIL_PASSWORD" || methodAuth === "USERNAME_PASSWORD") &&
    password
  ) {
    newData.passwordHash = await generateHash(password);
    // authWithPassword(password, accountId)
  }

  await changeAuthMethod(newData, accountId);
};

const changeAuthMethod = async (
  newData: { typeAuth: TypeAuth; passwordHash?: string | null },
  accountId: number,
) => {
  await db
    .update(authenticationTable)
    .set({...newData, otpCodeHash: null, isVerified: false})
    .where(eq(authenticationTable.accountId, accountId));
};


export const convertBase32 = (data: DataBase32) => {
  const { accountId, companyId, userId, firstName, lastName, roleId, role } =
    data;
  const datos = new TextEncoder().encode(
    `${companyId}-${accountId}-${userId}-${roleId}-${firstName}-${lastName}-${role}`,
  );
  const textoEnBase32 = base32.stringify(datos);
  return textoEnBase32;
};

export const generateUriAutenticator = async (accountId: number) => {
  const { companyId, userId, firstName, lastName, roleId, role } =
    (await generateDataTosession(accountId)) as DataBase32;
  const textoEnBase32 = convertBase32({
    accountId,
    companyId,
    userId,
    firstName,
    lastName,
    roleId,
    role,
  });

  const totpGenerate = await totp(
    role.replaceAll(" ", "-"),
    `${firstName}-${lastName}`,
    undefined,
    textoEnBase32,
  );

  return totpGenerate.uri;
};
