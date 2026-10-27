import { db } from "@/infrastructure/database/connections/pool-connection";
import {
  companiesTable,
  usersTable,
} from "@/infrastructure/database/drizzle/schema";
import { PayloadLocals, ROL_APP } from "@/shared/enums/utils.enum";
import { and, eq, getTableColumns } from "drizzle-orm";
import { User } from "./userDto";

const { isActive, ...payload } = getTableColumns(usersTable);

export const getListUserService = async (payload: PayloadLocals) => {
  const { rol, companyId } = payload;
  let users: User[] = [];

  switch (rol.toLowerCase()) {
    case ROL_APP.SUPER_ADMIN:
      users = await getAllUsers();
      break;
    case ROL_APP.ADMIN:
      users = await getOwnerUsers(companyId);
      break;
    default:
      users = [];
  }

  return users;
};

export const getOneUserService = async (
  idUser: number,
  payload: PayloadLocals,
) => {
  const { rol, companyId } = payload;

  let User: User[] = [];

  switch (rol.toLowerCase()) {
    case ROL_APP.SUPER_ADMIN:
      User = await getOneUser(idUser);
      break;
    case ROL_APP.ADMIN:
      User = await getOwnerOneUser(idUser, companyId);
      break;
  }

  return User;
};

export const deleteUserService = async(idUser: number) => {
  try {
    await db.update(usersTable).set({isActive: false}).where(eq(usersTable.id, idUser));  
    return true;    
  } catch (error) {
    return false;
  }
  
}

const getAllUsers = async () => {
  const users = await db
    .select({ ...payload, companyName: companiesTable.name })
    .from(usersTable)
    .innerJoin(companiesTable, eq(usersTable.companyId, companiesTable.id))
    .where(eq(usersTable.isActive, true));
  return users;
};

const getOwnerUsers = async (companyId: number) => {
  const users = await db
    .select(payload)
    .from(usersTable)
    .where(
      and(eq(usersTable.isActive, true), eq(usersTable.companyId, companyId)),
    );
  return users;
};

const getOneUser = async (idUser: number) => {
  const user = await db
    .select({ ...payload, companyName: companiesTable.name })
    .from(usersTable)
    .innerJoin(companiesTable, eq(usersTable.companyId, companiesTable.id))
    .where(and(eq(usersTable.id, idUser), eq(usersTable.isActive, true)));
  return user;
};

export const getOwnerOneUser = async (idUser: number, companyId: number) => {
  const user = await db
    .select(payload)
    .from(usersTable)
    .where(and(eq(usersTable.companyId, companyId), eq(usersTable.id, idUser), eq(usersTable.isActive, true)));
    return user;
};


