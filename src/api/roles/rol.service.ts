import { PayloadLocals, ROL_APP, SCOPE } from "@/shared/enums/utils.enum";
import { RolCreateDto, Role } from "./rolDto";
import { db } from "@/infrastructure/database/connections/pool-connection";
import {
  roleCompaniesTable,
  rolesTable,
} from "@/infrastructure/database/drizzle/schema";
import { getTableColumns, eq, or, and, inArray, count } from "drizzle-orm";
import { union } from "drizzle-orm/mysql-core";
import { CODE_RESPONSE } from "@/shared/enums/http-status.enum";
import { response } from "@/shared/utils/response";
import { getPolicyForUser } from "@/scripts/casbiTools";

export const getListRolesServie = async (payload: PayloadLocals) => {
  const { rol, companyId } = payload;
  let rols: Role[] = [];

  switch (rol.toLowerCase()) {
    case ROL_APP.SUPER_ADMIN:
      {
        rols = await getRoles();
      }
      break;
    case ROL_APP.ADMIN:
      {
        rols = await getOwnerRoles(companyId);
      }
      break;
    default: {
    }
  }

  return rols;
};

export const createRolService = async (
  rol: RolCreateDto,
  payload: PayloadLocals,
) => {
  const { rol: role, companyId } = payload;

  switch (role.toLowerCase()) {
    case ROL_APP.SUPER_ADMIN: {
      const [result] = await db.insert(rolesTable).values(rol);
      return result;
    }
    case ROL_APP.ADMIN: {
      const result = await db.transaction(async (tx) => {
        const [result] = await tx
          .insert(rolesTable)
          .values({ ...rol, scope: SCOPE.ORGANIZATION });
        await tx
          .insert(roleCompaniesTable)
          .values({ roleId: result.insertId, companyId });

        return result;
      });
      return result;
    }
  }
};

const getRoles = async () => {
  const { id, role, createdAt, updatedAt } = getTableColumns(rolesTable);
  const roles = await db
    .select({ id, role, createdAt, updatedAt })
    .from(rolesTable)
    .where(
      and(
        eq(rolesTable.isActive, true),
        or(eq(rolesTable.scope, "SYSTEM"), eq(rolesTable.scope, SCOPE.GLOBAL)),
      ),
    );

  return roles;
};

export const getOneRolService = async (
  idRol: number,
  payload: PayloadLocals,
) => {
  const { isActive, scope, ...data } = getTableColumns(rolesTable);
  const { rol: nameRol, companyId } = payload;
  let rol: {
    id: number;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  }[] = [];

  switch (nameRol.toLowerCase()) {
    case ROL_APP.SUPER_ADMIN:
      {
        rol = await db
          .select(data)
          .from(rolesTable)
          .where(
            and(
              eq(rolesTable.id, idRol),
              eq(rolesTable.scope, SCOPE.GLOBAL),
              eq(rolesTable.isActive, true),
            ),
          );
      }
      break;
    case ROL_APP.ADMIN:
      {
        const query1 = db
          .select({ roleId: roleCompaniesTable.roleId })
          .from(roleCompaniesTable)
          .where(
            and(
              eq(roleCompaniesTable.companyId, companyId),
              eq(roleCompaniesTable.roleId, idRol),
            ),
          );
        const query2 = inArray(rolesTable.id, query1);

        rol = await db
          .select(data)
          .from(rolesTable)
          .where(
            and(
              eq(rolesTable.id, idRol),
              eq(rolesTable.isActive, true),
              or(
                eq(rolesTable.scope, SCOPE.GLOBAL),
                and(eq(rolesTable.scope, SCOPE.ORGANIZATION), query2),
              ),
            ),
          );
      }
      break;
  }

  const permisssions = rol[0]
    ? await getPolicyForUser(rol[0].role.toLowerCase())
    : [];
  const sortPermissions = permisssions.map(([_, obj, act]) => `${obj}_${act}`);
  const status = rol[0] ? CODE_RESPONSE.OK : CODE_RESPONSE.NOT_FOUND;
  const msg = rol[0] ? "Get rol!" : "Rol not found!";
  const resp = response.success(
    rol[0] ? { ...rol[0], permisions: sortPermissions } : [],
    msg,
    status,
  );

  return resp;
};

export const updateRolService = async (
  idRol: number,
  payload: PayloadLocals,
  data: RolCreateDto,
) => {
  const { rol: nameRol, companyId } = payload;
  const { id, role } = getTableColumns(rolesTable);

  let query_rol: {
    id: any;
    role: any;
  }[] = [];

  switch (nameRol.toLowerCase()) {
    case ROL_APP.SUPER_ADMIN:
      {
        query_rol = await db
          .select({ id, role })
          .from(rolesTable)
          .where(
            and(eq(rolesTable.scope, SCOPE.GLOBAL), eq(rolesTable.id, idRol)),
          );
      }
      break;
    case ROL_APP.ADMIN:
      {
        const query_ext = db
          .select({ roleId: roleCompaniesTable.roleId })
          .from(roleCompaniesTable)
          .where(eq(roleCompaniesTable.companyId, companyId));

        query_rol = await db
          .select({ id, role })
          .from(rolesTable)
          .where(
            and(
              eq(rolesTable.id, idRol),
              eq(rolesTable.scope, SCOPE.ORGANIZATION),
              inArray(rolesTable.id, query_ext),
            ),
          );
      }
      break;
  }

  if (!query_rol[0]) {
    return response.error("Rol not found!", CODE_RESPONSE.NOT_FOUND);
  }

  await db.update(rolesTable).set(data).where(eq(rolesTable.id, idRol));

  const resp = response.success(
    data,
    "Rol updated successfully.",
    CODE_RESPONSE.OK,
  );
  return resp;
};

export const deleteRolService = async (
  idRol: number,
  payload: PayloadLocals,
) => {
  const { rol: nameRol, companyId } = payload;
  let is_valid:
    | {
        count: number;
      }
    | undefined = undefined;

  switch (nameRol.toLowerCase()) {
    case ROL_APP.SUPER_ADMIN:
      {
        const [total] = await db
          .select({ count: count() })
          .from(rolesTable)
          .where(
            and(
              eq(rolesTable.scope, SCOPE.GLOBAL),
              eq(rolesTable.id, idRol),
              eq(rolesTable.isActive, true),
            ),
          );

        is_valid = total;
      }
      break;
    case ROL_APP.ADMIN:
      {
        const query = db
          .select({ roleId: roleCompaniesTable.roleId })
          .from(roleCompaniesTable)
          .where(eq(roleCompaniesTable.companyId, companyId));

        const [total] = await db
          .select({ count: count() })
          .from(rolesTable)
          .where(
            and(
              eq(rolesTable.scope, SCOPE.ORGANIZATION),
              eq(rolesTable.id, idRol),
              eq(rolesTable.isActive, true),
              inArray(rolesTable.id, query),
            ),
          );
        is_valid = total;
      }
      break;
  }

  if (!is_valid || is_valid.count === 0) {
    return response.error("Rol not found!", CODE_RESPONSE.NOT_FOUND);
  }

  await db.update(rolesTable).set({isActive: false}).where(eq(rolesTable.id, idRol));
  
   const resp = response.success(
    [],
    "Rol delete successfully.",
    CODE_RESPONSE.OK,
  );
  return resp;
};

const getOwnerRoles = async (companyId: number) => {
  const { id, role, createdAt, updatedAt } = getTableColumns(rolesTable);

  const rols_globals = db
    .select({ id, role, createdAt, updatedAt })
    .from(rolesTable)
    .where(
      and(eq(rolesTable.isActive, true), eq(rolesTable.scope, SCOPE.GLOBAL)),
    );

  const rol_organization = db
    .select({ id, role, createdAt, updatedAt })
    .from(rolesTable)
    .innerJoin(roleCompaniesTable, eq(roleCompaniesTable.roleId, rolesTable.id))
    .where(
      and(
        eq(rolesTable.isActive, true),
        eq(roleCompaniesTable.companyId, companyId),
        eq(rolesTable.scope, SCOPE.ORGANIZATION),
      ),
    );
  const roles = await union(rols_globals, rol_organization);
  return roles;
};
