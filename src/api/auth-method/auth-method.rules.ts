import Joi from "joi";
import { TYPE_AUTH } from "@/api/authentication/authenticationDto.js";

export const schemaChangeAuthMethod = Joi.object({
  methodAuth: Joi.string()
    .valid(...TYPE_AUTH)
    .required(),
  password: Joi.string()
    .min(8)
    .pattern(/[A-Za-z]/)
    .pattern(/[0-9]/)
    .pattern(/[^A-Za-z0-9]/)
    .when("methodAuth", {
      is: Joi.valid("USERNAME_PASSWORD", "EMAIL_PASSWORD"),
      then: Joi.required().messages({
        "string.base": `'password' should be a type of 'text'`,
        "string.empty": `'password' cannot be empty`,
        "string.min": `'password' should have a minimum length of {#limit}`,
        "any.required": `'password' is a required field`,
        "string.pattern.base":
          "'password' must contain at least one letter, one number, and one special character",
      }),
      otherwise: Joi.forbidden().messages({
        "any.unknown": `'password' is not allowed for this authentication method`,
      }),
    }),
});
