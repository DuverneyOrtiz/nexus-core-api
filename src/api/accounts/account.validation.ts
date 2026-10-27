import { db } from "@/infrastructure/database/connections/pool-connection";
import {
  accountsTable,
  roleCompaniesTable,
  rolesTable,
  usersTable,
} from "@/infrastructure/database/drizzle/schema";
import { SCOPE } from "@/shared/enums/utils.enum";
import { and, count, eq, getTableColumns, inArray, ne, or } from "drizzle-orm";

export const isActiveAccount = async (idAccount: number) => {
  const [counter] = await db
    .select({ count: count() })
    .from(accountsTable)
    .where(
      and(eq(accountsTable.id, idAccount), eq(accountsTable.isActive, true)),
    );
  return counter?.count;
};

export const isActiveAccountOwnerCompany = async (
  idAccount: number,
  idCompany: number,
) => {
  const [counter] = await db
    .select({ count: count() })
    .from(accountsTable)
    .innerJoin(usersTable, eq(accountsTable.userId, usersTable.id))
    .where(
      and(
        eq(accountsTable.id, idAccount),
        eq(accountsTable.isActive, true),
        eq(usersTable.companyId, idCompany),
      ),
    );

  return counter?.count;
};

export const queryAccount = async (idUser: number, idCompany: number) => {
  const data = getData();
  const query = await db
    .select(data)
    .from(accountsTable)
    .innerJoin(usersTable, eq(usersTable.id, accountsTable.userId))
    .innerJoin(rolesTable, eq(rolesTable.id, accountsTable.roleId))
    .where(
      and(
        eq(usersTable.id, idUser),
        eq(usersTable.companyId, idCompany),
        eq(usersTable.isActive, true),
      ),
    );

  return query;
};

export const isActiveUser = async (idUser: number, idCompany?: number) => {
  const condition = !idCompany
    ? and(eq(usersTable.id, idUser), eq(usersTable.isActive, true))
    : and(
        eq(usersTable.id, idUser),
        eq(usersTable.isActive, true),
        eq(usersTable.companyId, idCompany),
      );

  const [user] = await db
    .select({ count: count() })
    .from(usersTable)
    .where(condition);

  return !user || !user.count;
};

export const isActiveRol = async (idRol: number, idCompany?: number) => {
  const { roleId } = getTableColumns(roleCompaniesTable);

  const condition = !idCompany
    ? and(
        eq(rolesTable.id, idRol),
        eq(rolesTable.isActive, true),
        eq(rolesTable.scope, SCOPE.GLOBAL),
      )
    : and(
        eq(rolesTable.id, idRol),
        eq(rolesTable.isActive, true),
        or(
          eq(rolesTable.scope, SCOPE.GLOBAL),
          and(
            eq(rolesTable.scope, SCOPE.ORGANIZATION),
            inArray(
              rolesTable.id,
              db
                .select({ roleId })
                .from(roleCompaniesTable)
                .where(eq(roleCompaniesTable.companyId, idCompany)),
            ),
          ),
        ),
      );

  const [rol] = await db
    .select({ count: count() })
    .from(rolesTable)
    .where(condition);

  return !rol || !rol.count;
};

export const isEmailAndUsernameUnique = async (
  email: string,
  username: string,
) => {
  const [emailOrUser] = await db
    .select({ count: count() })
    .from(accountsTable)
    .where(
      or(eq(accountsTable.email, email), eq(accountsTable.username, username)),
    );

  return !emailOrUser || !emailOrUser.count;
};

export const isEmailAndUsernameUniqueUpdate = async (
  idAccount: number,
  email?: string,
  username?: string,
) => {
  if (!email && !username) return true;

  const conditon =
    email && username
      ? or(eq(accountsTable.email, email), eq(accountsTable.username, username))
      : email
        ? eq(accountsTable.email, email)
        : username
          ? eq(accountsTable.username, username)
          : null;

  if (!conditon) return true;

  const emailOrUser = await db.$count(
    accountsTable,
    and(conditon, ne(accountsTable.id, idAccount)),
  );

  return !emailOrUser;
};

export const AccountIsSYSTEM = async (idAccount: number) => {
  const [query] = await db
    .select({ acount: count() })
    .from(accountsTable)
    .innerJoin(rolesTable, eq(rolesTable.id, accountsTable.roleId))
    .where(
      and(eq(accountsTable.id, idAccount), eq(rolesTable.scope, SCOPE.SYSTEM)),
    );

    return !query || !query.acount;
};

export const getData = () => {
  const { id, userId, email, username, updatedAt, createdAt } =
    getTableColumns(accountsTable);
  const { role } = getTableColumns(rolesTable);
  const { firstName, lastName } = getTableColumns(usersTable);

  return {
    id,
    userId,
    email,
    username,
    role,
    user: {
      firstName,
      lastName,
    },
    // ...(rol.toLowerCase() === ROL_APP.SUPER_ADMIN && {companyName}),
    updatedAt,
    createdAt,
  };
};
