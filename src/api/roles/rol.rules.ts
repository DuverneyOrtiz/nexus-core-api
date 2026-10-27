import Joi from "joi";

const ROL = {
  role: Joi.string().min(3).max(100).required().messages({
    "string.base": `'role' should be a type of 'text'`,
    "string.min": `'role' should have a minimum length of {#limit}`,
    "string.max": `'role' should have a minimum length of {#limit}`,
    "any.required": `'role' is a required field`,
  })
}

export const schemaCreateRol = Joi.object(ROL);

export const schemaUpdateRol  = Joi.object(ROL);
