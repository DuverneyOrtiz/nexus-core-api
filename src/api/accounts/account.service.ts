import { db } from "@/infrastructure/database/connections/pool-connection";
import {
  accountsTable,
  companiesTable,
  rolesTable,
  usersTable,
} from "@/infrastructure/database/drizzle/schema";
import { CODE_RESPONSE } from "@/shared/enums/http-status.enum";
import { PayloadLocals, ROL_APP } from "@/shared/enums/utils.enum";
import { response } from "@/shared/utils/response";
import { eq, and } from "drizzle-orm";
import { AccountCreateDto, AccountData, AccountUpdateDto } from "./accountDto";
import { createAuthenticaton } from "../authentication/authentication.service";
import {
  AccountIsSYSTEM,
  getData,
  isActiveAccount,
  isActiveAccountOwnerCompany,
  isActiveRol,
  isActiveUser,
  isEmailAndUsernameUnique,
  isEmailAndUsernameUniqueUpdate,
  queryAccount,
} from "./account.validation";

export const getListAccountSevice = async (payload: PayloadLocals) => {
  const { companyId } = payload;

  const data = getData();

  let query: AccountData[] = [];

  query = await db
    .select(data)
    .from(accountsTable)
    .innerJoin(usersTable, eq(usersTable.id, accountsTable.userId))
    .innerJoin(rolesTable, eq(rolesTable.id, accountsTable.roleId))
    .where(
      and(
        eq(usersTable.companyId, companyId),
        eq(accountsTable.isActive, true),
      ),
    );

  return response.success(query, "Get list accounts!", CODE_RESPONSE.OK);
};

export const getListAccountsByCompanyService = async (idCompany: number) => {
  const data = getData();

  let query: AccountData[] = [];

  query = await db
    .select(data)
    .from(accountsTable)
    .innerJoin(usersTable, eq(usersTable.id, accountsTable.userId))
    .innerJoin(companiesTable, eq(companiesTable.id, usersTable.companyId))
    .innerJoin(rolesTable, eq(rolesTable.id, accountsTable.roleId))
    .where(
      and(eq(companiesTable.id, idCompany), eq(accountsTable.isActive, true)),
    );

  return response.success(query, "Get list accounts!", CODE_RESPONSE.OK);
};

export const getOneAccountService = async (
  idAccount: number,
  idCompany: number,
) => {
  const isValidAccount = await isActiveAccount(idAccount);

  if (!isValidAccount || isValidAccount === 0) {
    return response.error("Acount not found!", CODE_RESPONSE.NOT_FOUND);
  }

  const data = getData();

  const [query] = await db
    .select(data)
    .from(accountsTable)
    .innerJoin(usersTable, eq(usersTable.id, accountsTable.userId))
    .innerJoin(rolesTable, eq(rolesTable.id, accountsTable.roleId))
    .where(
      and(
        eq(accountsTable.id, idAccount),
        eq(accountsTable.isActive, true),
        eq(usersTable.companyId, idCompany),
      ),
    );

  if (!query) {
    return response.error("Acount not found!", CODE_RESPONSE.NOT_FOUND);
  }

  return response.success(query, "Get account!", CODE_RESPONSE.OK);
};

export const getAccountByIdUserService = async (
  idUser: number,
  idCompany: number,
) => {
  const query = await queryAccount(idUser, idCompany);

  if (!query[0]) {
    return response.error("User not found!", CODE_RESPONSE.NOT_FOUND);
  }

  return response.success(query, "Get account!", CODE_RESPONSE.OK);
};

export const createAccountService = async (
  account: AccountCreateDto,
  payload: PayloadLocals,
) => {
  const { rol, companyId } = payload;

  switch (rol.toLowerCase()) {
    case ROL_APP.SUPER_ADMIN:
      {
        if (await isActiveUser(account.userId))
          return response.error("User not found!", CODE_RESPONSE.NOT_FOUND);
        if (await isActiveRol(account.roleId))
          return response.error("Rol not found!", CODE_RESPONSE.NOT_FOUND);

        if (!(await isEmailAndUsernameUnique(account.email, account.username)))
          return response.error(
            "The email or username is already in use by another user.",
            CODE_RESPONSE.CONFLICT,
          );
      }
      break;
    case ROL_APP.ADMIN:
      {
        if (await isActiveUser(account.userId, companyId))
          return response.error("User not found!", CODE_RESPONSE.NOT_FOUND);
        if (await isActiveRol(account.roleId, companyId))
          return response.error("Rol not found!", CODE_RESPONSE.NOT_FOUND);

        if (!(await isEmailAndUsernameUnique(account.email, account.username)))
          return response.error(
            "The email or username is already in use by another user.",
            CODE_RESPONSE.CONFLICT,
          );
      }
      break;
  }

  const [result] = await db.insert(accountsTable).values(account);
  await createAuthenticaton(result.insertId);
  return response.success(
    { id: result.insertId, ...account },
    "Account was created!",
    CODE_RESPONSE.CREATED,
  );
};

export const updateAccountService = async (
  idAccount: number,
  account: AccountUpdateDto,
  payload: PayloadLocals,
) => {
  const { rol, companyId } = payload;

  if (!(await isActiveAccountOwnerCompany(idAccount, companyId)))
    return response.error("Account not found!", CODE_RESPONSE.NOT_FOUND);

  switch (rol.toLowerCase()) {
    case ROL_APP.SUPER_ADMIN:
      {
        if (account.roleId && (await isActiveRol(account.roleId)))
          return response.error("Rol not found!", CODE_RESPONSE.NOT_FOUND);
      }
      break;
    case ROL_APP.ADMIN:
      {
        if (account.roleId && (await isActiveRol(account.roleId, companyId)))
          return response.error("Rol not found!", CODE_RESPONSE.NOT_FOUND);
      }
      break;
  }

  if (
    !(await isEmailAndUsernameUniqueUpdate(
      idAccount,
      account.email,
      account.username,
    ))
  )
    return response.error(
      "The email or username is already in use by another user.",
      CODE_RESPONSE.CONFLICT,
    );

  await db
    .update(accountsTable)
    .set(account)
    .where(eq(accountsTable.id, idAccount));

  return response.success([], "Account was update!", CODE_RESPONSE.OK);
};

export const deleteAccountService = async (
  idAccount: number,
  payload: PayloadLocals,
) => {
  const { companyId, accountId } = payload;

  if (!(await isActiveAccountOwnerCompany(idAccount, companyId)))
    return response.error("Account not found!", CODE_RESPONSE.NOT_FOUND);

  if (!(await AccountIsSYSTEM(idAccount)))
    return response.error(
      "This account cannot be deleted because it belongs to the system and its deletion is restricted for security reasons.",
      CODE_RESPONSE.FORBIDDEN,
    );

  if (accountId === idAccount)
    return response.error(
      "You cannot delete your own account for security reasons.",
      CODE_RESPONSE.FORBIDDEN,
    );

  await db
    .update(accountsTable)
    .set({ isActive: false })
    .where(eq(accountsTable.id, idAccount));

  return response.success([], "Account was deleted!", CODE_RESPONSE.OK);
};
