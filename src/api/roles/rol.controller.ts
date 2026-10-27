import { Response, Request } from "express";
import { RolCreateDto } from "./rolDto.js";
import { schemaCreateRol, schemaUpdateRol } from "./rol.rules.js";
import { CODE_RESPONSE } from "@/shared/enums/http-status.enum";
import { db, PoolConnection } from "@/infrastructure/database/connections/pool-connection";
import { rolesTable } from "@/schema";
import { errorCatch, response } from "@/shared/utils/response";
import { eq, getTableColumns, asc} from "drizzle-orm";
import {
  createRolService,
  deleteRolService,
  getListRolesServie,
  getOneRolService,
  updateRolService,
} from "./rol.service.js";
import { PayloadLocals } from "@/shared/enums/utils.enum.js";

export const getListRoles = async (_: Request, res: Response) => {
  try {
    const { payload } = res.locals;
    const roles = await getListRolesServie(payload);
    const resp = response.success(roles, "Get all roles!", CODE_RESPONSE.OK);
    return res.status(resp.status).json(resp);
  } catch (error) {
    return errorCatch(error, res);
  }
};

export const getOneRol = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;
  const payload = res.locals.payload as PayloadLocals;

  if (isNaN(parseInt(id)) || parseInt(id) <= 0) {
    const resp = response.error(
      "The resource ID must be a positive integer.",
      CODE_RESPONSE.BAD_REQUEST,
    );
    return res.status(resp.status).json(resp);
  }

  const resp = await getOneRolService(parseInt(id), payload);
  return res.status(resp.status).json(resp);
};

//FIXME: documentarse de como obtener la lista de roles por paginación
export const getListRolesByPage = async (req: Request, res: Response) => {
  const { page: cursor, pageSize } = req.body;

  const listRoles = await db
    .select({
      ...getTableColumns(rolesTable),
    })
    .from(rolesTable)
    .orderBy(asc(rolesTable.id))
    .limit(parseInt(pageSize))
    .offset(cursor);

  const resp = response.success(listRoles, "Get all rols!", CODE_RESPONSE.OK);

  res.json(resp);
};

export const createRol = async (
  req: Request<{}, {}, RolCreateDto>,
  res: Response,
) => {
  try {
    const { error, value } = schemaCreateRol.validate(req.body);
    const { payload } = res.locals;

    if (error) {
      const details = error.details[0];
      const resp = response.error(
        details?.message || "",
        CODE_RESPONSE.UNPROCESSABLE_ENTITY,
      );
      return res.status(CODE_RESPONSE.UNPROCESSABLE_ENTITY).json(resp);
    }
    const result = await createRolService(value, payload);
    const resp = response.success(
      { id: result?.insertId, ...value },
      "Rol was created!",
      CODE_RESPONSE.CREATED,
    );
    return res.status(CODE_RESPONSE.CREATED).json(resp);
  } catch (error) {
    return errorCatch(error, res, "Error duplicate entity.");
  }
};

export const updateRol = async (
  req: Request<{ id: string }, {}, RolCreateDto>,
  res: Response,
) => {

  try {
    const { error } = schemaUpdateRol.validate(req.body);
    const { id } = req.params;
    const payload = res.locals.payload as PayloadLocals;
  
    if (isNaN(parseInt(id)) || parseInt(id) <= 0) {
      const resp = response.error(
        "The resource ID must be a positive integer.",
        CODE_RESPONSE.BAD_REQUEST,
      );
      return res.status(resp.status).json(resp);
    }
  
    if (error) {
      const details = error.details[0];
      const resp = response.error(
        details?.message || "",
        CODE_RESPONSE.UNPROCESSABLE_ENTITY,
      );
      return res.status(CODE_RESPONSE.UNPROCESSABLE_ENTITY).json(resp);
    }
  
    const resp = await updateRolService(parseInt(id), payload, req.body);
  
    return res.status(resp.status).json(resp);
    
  } catch (error) {
    return errorCatch(error, res, "Error al actualizar el rol");
  }

};

export const deleteRol = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response,
) => {

  try {
    
    const { id } = req.params;
    const payload = res.locals.payload as PayloadLocals;
  
    if (isNaN(parseInt(id)) || parseInt(id) <= 0) {
      const resp = response.error(
        "The resource ID must be a positive integer.",
        CODE_RESPONSE.BAD_REQUEST,
      );
      return res.status(resp.status).json(resp);
    }
  
    const resp = await deleteRolService(parseInt(id), payload);
  
    return res.status(resp.status).json(resp);    
  } catch (error) {
    return errorCatch(error, res, "Error al actualizar el rol");
  }

};
