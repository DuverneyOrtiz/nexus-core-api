import { db } from "@/infrastructure/database/connections/pool-connection";
import {
  accountsTable,
  authenticationTable,
  companiesTable,
  rolesTable,
  usersTable,
} from "@/infrastructure/database/drizzle/schema";
import { CODE_RESPONSE } from "@/shared/enums/http-status.enum";
import { response } from "@/shared/utils/response";
import { eq, getTableColumns } from "drizzle-orm";

export const getProfileService = async (idAccount: number) => {
  const { id, email, username, userId } = getTableColumns(accountsTable);
  const { firstName, lastName, phone } = getTableColumns(usersTable);
  const { typeAuth } = getTableColumns(authenticationTable);
  const { id: roleId, role } = getTableColumns(rolesTable);
  const {
    taxId,
    name: companyName,
    address,
    email: emailCompany,
  } = getTableColumns(companiesTable);
  const [profile] = await db
    .select({
      user: {
        userId,
        firstName,
        lastName,
        phone,
      },
      account: {
        accountId: id,
        email,
        username,
        typeAuth,
      },
      company: {
        taxId,
        companyName,
        address,
        emailCompany,
      },
      role: {
        roleId,
        role,
      },
    })
    .from(accountsTable)
    .innerJoin(usersTable, eq(usersTable.id, accountsTable.userId))
    .innerJoin(
      authenticationTable,
      eq(authenticationTable.accountId, accountsTable.id),
    )
    .innerJoin(rolesTable, eq(rolesTable.id, accountsTable.roleId))
    .innerJoin(companiesTable, eq(companiesTable.id, usersTable.companyId))
    .where(eq(accountsTable.id, idAccount));

  if (!profile)
    return response.error("User profile not found.", CODE_RESPONSE.NOT_FOUND);

  return response.success(profile, "Get profile!", CODE_RESPONSE.OK);
};
