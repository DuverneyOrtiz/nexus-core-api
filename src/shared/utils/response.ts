import { DrizzleQueryError } from "drizzle-orm";
import { Response as Resp } from "express";
import { CODE_RESPONSE } from "../enums/http-status.enum";

export interface ERROR {
  message: string | string[];
  status: number;
}

export interface SUCCESS<T> extends ERROR {
  data: T;
}

interface Response {
  success: <T>(data: T, message: string, httpStatus: number) => SUCCESS<any>;
  error: (message: string | string[], httpStatus: number) => ERROR;
}

export const response: Response = {
  success: <T>(data: T, message: string, httpStatus: number) => ({
    status: httpStatus,
    message,
    data,
  }),
  error: (message: string | string[], httpStatus: number) => ({
    status: httpStatus,
    message,
  }),
};

export const errorCatch = (error: any, res: Resp, msg?: any) => {
  if (error instanceof DrizzleQueryError) {
    const { code } = error.cause as any;

    if (code === "ER_DUP_ENTRY")
      return res
        .status(CODE_RESPONSE.CONFLICT)
        .json(
          response.error(msg ? msg :
            [
              "The specified [email, username] is already in use.",
              "The user already has this role.",
            ],
            CODE_RESPONSE.CONFLICT,
          ),
        );

    if (code.includes("ER_NO_REFERENCED_ROW"))
      return res
        .status(CODE_RESPONSE.CONFLICT)
        .json(
          response.error(
            "The referenced resource does not exist.",
            CODE_RESPONSE.CONFLICT,
          ),
        );
  }

  return res
    .status(CODE_RESPONSE.INTERNAL_SERVER_ERROR)
    .json(
      response.error("Unexpected error", CODE_RESPONSE.INTERNAL_SERVER_ERROR),
    );
};
