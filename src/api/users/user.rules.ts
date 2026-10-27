import { ROL_APP } from "@/shared/enums/utils.enum";
import Joi from "joi";

const USER = {
  firstName: Joi.string().trim().min(3).max(100).required().messages({
    "string.base": `'firstName' should be a type of 'text'`,
    "string.min": `'firstName' should have a minimum length of {#limit}`,
    "string.max": `'firstName' should have a maximun length of {#limit}`,
    "any.required": `'firstName' is a required field`,
  }),
  lastName: Joi.string().trim().min(3).max(100).required().messages({
    "string.base": `'lastName' should be a type of 'text'`,
    "string.min": `'lastName' should have a minimum length of {#limit}`,
    "string.max": `'lastName' should have a maximun length of {#limit}`,
    "any.required": `'lastName' is a required field`,
  }),
  email: Joi.string().trim().lowercase().email().messages({
    "string.base": `'email' should be a type of 'text'`,
    "string.empty": "'email' is required.",
    "string.email": "'email' must be a valid email address."
  }),
  phone: Joi.string()
    .trim()
    .pattern(/^\+?[1-9]\d{6,14}$/)
    .messages({
      "string.empty": "Phone is required.",
      "string.pattern.base":
        "Phone must be a valid international phone number."
    }),
};

export const schemaUser = Joi.object({
  companyId: Joi.number().required().messages({
    "number.base": `'companyId' should be a type of 'number'`,
    "any.required": `'companyId' is a required field`,
  }),
  ...USER,
  email: Joi.string().trim().lowercase().email().required().messages({
    "string.base": `'email' should be a type of 'text'`,
    "string.empty": "'email' is required.",
    "string.email": "'email' must be a valid email address.",
    "any.required": `'email' is a required field`,
  }),
  phone: Joi.string()
    .trim()
    .pattern(/^\+?[1-9]\d{6,14}$/)
    .required()
    .messages({
      "string.empty": "Phone is required.",
      "string.pattern.base":
        "Phone must be a valid international phone number.",
      "any.required": "Phone is required.",
    }),
}).unknown(false)
  .min(1)
  .prefs({ errors: { wrap: { label: false } } })
  .messages({
    "object.min": "At least one field must be provided to update the user.",
    "object.unknown": "El campo '{#label}' no está permitido."
  });


export const schemaCreateUser = (role: ROL_APP) => {
  const rolesAllowedCompanyId = [
    ROL_APP.SUPER_ADMIN
  ];

  return Joi.object({
    companyId: (rolesAllowedCompanyId.includes(role)
      ? Joi.number()
          .integer()
          .positive()
          .optional()
          .messages({
            "number.base": `'companyId' must be a number.`,
            "number.integer": `'companyId' must be an integer.`,
            "number.positive": `'companyId' must be a positive number.`
          })
      : Joi.forbidden().messages({
          "any.unknown": `'companyId' is not allowe.`,
        })),
  });
};


export const schemaUpdateUser = Joi.object(USER).unknown(false)
  .min(1)
  .prefs({ errors: { wrap: { label: false } } })
  .messages({
    "object.min": "At least one field must be provided to update the user.",
    "object.unknown": "El campo '{#label}' no está permitido."
  });
