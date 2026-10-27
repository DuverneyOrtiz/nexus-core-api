import { Response, Request } from "express";
import { CODE_RESPONSE } from "@/shared/enums/http-status.enum";
import { errorCatch, response } from "@/shared/utils/response";
import {
  addPolicyCasbi,
  getPolicyForUser,
  removePolicyCasbi,
} from "@/scripts/casbiTools.js";
import { schemaPolicy } from "./rol_permission.rules";
import { PayloadLocals } from "@/shared/enums/utils.enum";

export const addPolicy = async (
  req: Request<{}, {}, { policy: [string, string, string] }>,
  res: Response,
) => {
  try {
    const { error } = schemaPolicy.validate(req.body);

    if (error) {
      const details = error.details[0];
      const resp = response.error(
        details?.message || "",
        CODE_RESPONSE.UNPROCESSABLE_ENTITY,
      );
      return res.status(CODE_RESPONSE.UNPROCESSABLE_ENTITY).json(resp);
    }

    await addPolicyCasbi(...req.body.policy);
    const resp = response.success(
      [],
      "Authorization policy added successfully!",
      CODE_RESPONSE.CREATED,
    );
    return res.status(CODE_RESPONSE.OK).json(resp);
  } catch (error) {
    const resp = response.error(
      "Failed to add authorization policy!",
      CODE_RESPONSE.CONFLICT,
    );
    return res.status(CODE_RESPONSE.CONFLICT).json(resp);
  }
};

export const removePolicy = async (
  req: Request<{}, {}, { policy: [string, string, string] }>,
  res: Response,
) => {
  try {
    const { error } = schemaPolicy.validate(req.body);

    if (error) {
      const details = error.details[0];
      const resp = response.error(
        details?.message || "",
        CODE_RESPONSE.UNPROCESSABLE_ENTITY,
      );
      return res.status(CODE_RESPONSE.UNPROCESSABLE_ENTITY).json(resp);
    }

    await removePolicyCasbi(...req.body.policy);
    const resp = response.success(
      [],
      "Authorization policy removed successfully!",
      CODE_RESPONSE.CREATED,
    );
    return res.status(CODE_RESPONSE.OK).json(resp);
  } catch (error) {
    const resp = response.error(
      "Failed to remove authorization policy!",
      CODE_RESPONSE.CONFLICT,
    );
    return res.status(CODE_RESPONSE.CONFLICT).json(resp);
  }
};

export const listPolicyBySucject = async (req: Request, res: Response) => {
  try {
    const { rol } = res.locals.payload as PayloadLocals;
    const result = await getPolicyForUser(rol.toLowerCase());

    const resources = [...new Set(result.map((item) => item[1]).sort())];

    const permissions = resources.map((item) => {
      return {
        resource: item,
        actions: result.filter((value) => value[1] === item).reduce((a, v) => [...a, (v[2] || "")], [])
      }
    })

    const resp = response.success(
      permissions,
      "Get permissions!",
      CODE_RESPONSE.OK,
    );

    return res.status(CODE_RESPONSE.OK).json(resp);
  } catch (error) {
    errorCatch(error, res);
  }
};
