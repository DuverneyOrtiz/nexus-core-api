import { Request, Response } from "express";
import { UserCreateDto } from "./userDto.js";
import { schemaUpdateUser, schemaUser } from "./user.rules.js";
import { errorCatch, response } from "@/shared/utils/response";
import { CODE_RESPONSE } from "@/shared/enums/http-status.enum";
import { db } from "@/infrastructure/database/connections/pool-connection";
import {
  companiesTable,
  usersTable,
} from "@/infrastructure/database/drizzle/schema";
import { DrizzleQueryError, eq, and, getTableColumns } from "drizzle-orm";
import { MySqlRawQueryResult } from "drizzle-orm/mysql2";
import { PayloadLocals } from "@/shared/enums/utils.enum.js";
import { deleteUserService, getListUserService, getOneUserService, getOwnerOneUser } from "./user.service.js";

const { isActive, ...payload } = getTableColumns(usersTable);

export const getListUsers = async (_: Request, res: Response) => {
  try {
    const { payload } = res.locals;
    const users = await getListUserService(payload);
    const resp = response.success(users, "Get all users!", CODE_RESPONSE.OK);
    return res.status(resp.status).json(resp);
  } catch (error) {
    return errorCatch(error, res);
  }
};

export const getOneUser = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;
  const { payload } = res.locals;

  if (isNaN(parseInt(id)) || parseInt(id) <= 0) {
    const resp = response.error(
      "The resource ID must be a positive integer.",
      CODE_RESPONSE.BAD_REQUEST,
    );
    return res.status(resp.status).json(resp);
  }

  const user = await getOneUserService(parseInt(id), payload);
    
    let resp = user && user[0] ?
      response.success(user[0], "Get user!", CODE_RESPONSE.OK):
      response.success(user, "User not found!", CODE_RESPONSE.NOT_FOUND);
    return res.status(resp.status).json(resp);
   
};

export const createUser = async (
  req: Request<{}, {}, UserCreateDto>,
  res: Response,
) => {
  try {
    const { companyId } = res.locals.payload;
    const { error, value } = schemaUser.validate({ ...req.body, companyId });

    if (error) {
      const details = error.details[0];
      const resp = response.error(
        details?.message || "",
        CODE_RESPONSE.UNPROCESSABLE_ENTITY,
      );
      return res.status(CODE_RESPONSE.UNPROCESSABLE_ENTITY).json(resp);
    }

    const user: typeof usersTable.$inferInsert = value;
    const dataInsert = { ...user };
    const [result] = await db.insert(usersTable).values(dataInsert);

    const resp = response.success(
      { id: result.insertId, ...dataInsert },
      "User was created!",
      CODE_RESPONSE.CREATED,
    );
    return res.json(resp);
  } catch (error) {
    if (error instanceof DrizzleQueryError) {
      const { code } = error.cause as any;
      if (code === "ER_DUP_ENTRY")
        return res
          .status(CODE_RESPONSE.CONFLICT)
          .json(
            response.error(
              "The specified [email] is already in use.",
              CODE_RESPONSE.CONFLICT,
            ),
          );
    }

    return res
      .status(CODE_RESPONSE.INTERNAL_SERVER_ERROR)
      .json(
        response.error("Error inesperado", CODE_RESPONSE.INTERNAL_SERVER_ERROR),
      );
  }
};

export const updateUser = async (
  req: Request<{ id: string }, {}, Omit<UserCreateDto, "companyId">>,
  res: Response,
) => {
  try {
    const { companyId } = res.locals.payload;
    const { id } = req.params;
    const { error, value } = schemaUpdateUser.validate(req.body);

    if (error) {
      const details = error.details[0];
      const resp = response.error(
        details?.message || "",
        CODE_RESPONSE.UNPROCESSABLE_ENTITY,
      );
      return res.status(CODE_RESPONSE.UNPROCESSABLE_ENTITY).json(resp);
    }

    const dataUpdate: Omit<typeof usersTable.$inferInsert, "companyId"> = value;

    const update: MySqlRawQueryResult = await db
      .update(usersTable)
      .set(dataUpdate)
      .where(
        and(
          eq(usersTable.id, parseInt(id)),
          eq(usersTable.companyId, companyId),
        ),
      );

    if (
      update[0] &&
      Object.hasOwn(update[0], "affectedRows") &&
      update[0].affectedRows === 0
    ) {
      const resp = response.error(
        "The resource was not found or could not be updated.",
        CODE_RESPONSE.NOT_FOUND,
      );
      return res.status(CODE_RESPONSE.NOT_FOUND).json(resp);
    }
    const resp = response.success(value, "user was update!", CODE_RESPONSE.OK);

    return res.status(CODE_RESPONSE.CREATED).json(resp);
  } catch (error) {
    if (error instanceof DrizzleQueryError) {
      const { code } = error.cause as any;
      if (code === "ER_DUP_ENTRY")
        return res
          .status(CODE_RESPONSE.CONFLICT)
          .json(
            response.error(
              "The specified [email] is already in use.",
              CODE_RESPONSE.CONFLICT,
            ),
          );
    }

    return res
      .status(CODE_RESPONSE.INTERNAL_SERVER_ERROR)
      .json(
        response.error("Error inesperado", CODE_RESPONSE.INTERNAL_SERVER_ERROR),
      );
  }
};

export const deleteUser = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { payload } = res.locals as {payload: PayloadLocals};
   

    if (isNaN(parseInt(id)) || parseInt(id) <= 0) {
      const resp = response.error(
        "The resource ID must be a positive integer.",
        CODE_RESPONSE.BAD_REQUEST,
      );
      return res.status(resp.status).json(resp);
    }

    if(payload.idUser === parseInt(id)) {
      const resp = response.error(
        "You cannot delete your own user.",
        CODE_RESPONSE.FORBIDDEN,
      );
      return res.status(resp.status).json(resp);
    }

    if (
          (await getOwnerOneUser(parseInt(id), payload.companyId)).length === 0
        ) {
          const resp = response.error(
            "User not found!",
            CODE_RESPONSE.NOT_FOUND,
          );
          return res.status(resp.status).json(resp);
        }
    const resp = await deleteUserService(parseInt(id)) ?
    response.success([], "user was deteleted!", CODE_RESPONSE.OK):
    response.error("Error to delete user!", CODE_RESPONSE.CONFLICT);

    return res.status(resp.status).json(resp);

  } catch (error) {
    const resp = response.error("Error to delete user!", CODE_RESPONSE.CONFLICT);
    res.status(resp.status).json(resp);
  }

}
