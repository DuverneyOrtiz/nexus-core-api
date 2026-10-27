import Joi from "joi";

export const schemaCreateAccount = Joi.object({
  userId: Joi.number().required().messages({
    "number.base": `'userId' should be a type of 'number'`,
    "any.required": `'userId' is a required field`,
  }),
  roleId: Joi.number().required().messages({
    "number.base": `'roleId' should be a type of 'number'`,
    "any.required": `'roleId' is a required field`,
  }),
  email: Joi.string().trim().lowercase().email().messages({
    "string.base": `'email' should be a type of 'text'`,
    "string.empty": "'email' is required.",
    "string.email": "'email' must be a valid email address.",
  }),
  username: Joi.string().trim().min(3).max(255).messages({
    "string.base": `'username' should be a type of 'text'`,
    "string.min": `'username' should have a minimum length of {#limit}`,
    "string.max": `'username' should have a minimum length of {#limit}`,
  }),
});

export const schemaUpdateAccount = Joi.object({
  roleId: Joi.number().messages({
    "number.base": `'roleId' should be a type of 'number'`,
    "any.required": `'roleId' is a required field`,
  }),
  email: Joi.string().trim().lowercase().email().messages({
    "string.base": `'email' should be a type of 'text'`,
    "string.empty": "'email' is required.",
    "string.email": "'email' must be a valid email address.",
  }),
  username: Joi.string().trim().min(3).max(255).messages({
    "string.base": `'username' should be a type of 'text'`,
    "string.min": `'username' should have a minimum length of {#limit}`,
    "string.max": `'username' should have a minimum length of {#limit}`,
  }),
})
  .unknown(false)
  .min(1)
  .prefs({ errors: { wrap: { label: false } } })
  .messages({
    "object.min": "At least one field must be provided to update the account [roleId, email, username] ",
    "object.unknown": "El campo '{#label}' no está permitido.",
  });
