import Joi from "joi";

export const schemaCompany = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.base": `'name' should be a type of 'text'`,
    "string.min": `'name' should have a minimum length of {#limit}`,
    "string.max": `'name' should have a minimum length of {#limit}`,
    "any.required": `'name' is a required field`,
  }),
  expiresAt: Joi.date().required().messages({
    "any.required": `'expiresAt' is a required field`,
  }),
  contactPerson: Joi.string().min(3).max(100).required().messages({
    "string.base": `'contactPerson' should be a type of 'text'`,
    "string.min": `'contactPerson' should have a minimum length of {#limit}`,
    "string.max": `'contactPerson' should have a minimum length of {#limit}`,
    "any.required": `'contactPerson' is a required field`,
  }),
  address: Joi.string().min(3).max(255).required().messages({
    "string.base": `'address' should be a type of 'text'`,
    "string.min": `'address' should have a minimum length of {#limit}`,
    "string.max": `'address' should have a minimum length of {#limit}`,
    "any.required": `'address' is a required field`,
  }),
  phone: Joi.string().min(3).max(15).required().messages({
    "string.base": `'phone' should be a type of 'text'`,
    "string.min": `'phone' should have a minimum length of {#limit}`,
    "string.max": `'phone' should have a minimum length of {#limit}`,
    "any.required": `'phone' is a required field`,
  }),
  taxId: Joi.string().min(3).max(20).required().messages({
    "string.base": `'taxId' should be a type of 'text'`,
    "string.min": `'taxId' should have a minimum length of {#limit}`,
    "string.max": `'taxId' should have a minimum length of {#limit}`,
    "any.required": `'taxId' is a required field`,
  }),
  email: Joi.string().email({ minDomainSegments: 2 }).required().messages({
    "string.email": `'email' should be a type of 'email'`,
    "any.required": `'email' is a required field`,
  }),
  trialExpiresAt: Joi.date().required().messages({
    "any.required": `'trialExpiresAt' is a required field`,
  }),
});

export const schemaUpdateCompanySuperAdmin = Joi.object({
  // companyId: Joi.number().integer().positive().messages({
  //   "number.base": `"companyId" should be a type of 'number'`,
  //   "number.integer": `"companyId" must be an integer`,
  //   "number.positive": `"companyId" must be a positive number`,
  // }),

  name: Joi.string().min(3).max(100).messages({
    "string.base": `"name" should be a type of 'text'`,
    "string.min": `"name" should have a minimum length of {#limit}`,
    "string.max": `"name" should have a maximum length of {#limit}`,
  }),

  expiresAt: Joi.date().messages({
    "date.base": `"expiresAt" must be a valid date`,
  }),

  contactPerson: Joi.string().min(3).max(100).messages({
    "string.base": `"contactPerson" should be a type of 'text'`,
    "string.min": `"contactPerson" should have a minimum length of {#limit}`,
    "string.max": `"contactPerson" should have a maximum length of {#limit}`,
  }),

  address: Joi.string().min(3).max(255).messages({
    "string.base": `"address" should be a type of 'text'`,
    "string.min": `"address" should have a minimum length of {#limit}`,
    "string.max": `"address" should have a maximum length of {#limit}`,
  }),

  phone: Joi.string().min(3).max(15).messages({
    "string.base": `"phone" should be a type of 'text'`,
    "string.min": `"phone" should have a minimum length of {#limit}`,
    "string.max": `"phone" should have a maximum length of {#limit}`,
  }),

  taxId: Joi.string().min(3).max(20).messages({
    "string.base": `"taxId" should be a type of 'text'`,
    "string.min": "'taxId' should have a minimum length of {#limit}",
    "string.max": "'taxId' should have a maximum length of {#limit}",
  }),

  email: Joi.string().email({ minDomainSegments: 2 }).messages({
    "string.email": "'email' should be a valid email",
    "string.empty": "'email' should be a valid email",
  }),

  trialExpiresAt: Joi.date().messages({
    "date.base": `"trialExpiresAt" must be a valid date`,
  }),
})
  .unknown(false)
  .min(1)
  .prefs({ errors: { wrap: { label: false } } })
  .messages({
    "object.min": "At least one field must be provided to update the company.",
    "object.unknown": "El campo '{#label}' no está permitido."
  });

export const schemaUpdateCompanyAdmin = Joi.object({
  name: Joi.string().min(3).max(100).messages({
    "string.base": `"name" should be a type of 'text'`,
    "string.min": `"name" should have a minimum length of {#limit}`,
    "string.max": `"name" should have a maximum length of {#limit}`,
  }),

  contactPerson: Joi.string().min(3).max(100).messages({
    "string.base": `"contactPerson" should be a type of 'text'`,
    "string.min": `"contactPerson" should have a minimum length of {#limit}`,
    "string.max": `"contactPerson" should have a maximum length of {#limit}`,
  }),

  phone: Joi.string().min(3).max(15).messages({
    "string.base": `"phone" should be a type of 'text'`,
    "string.min": `"phone" should have a minimum length of {#limit}`,
    "string.max": `"phone" should have a maximum length of {#limit}`,
  }),

  email: Joi.string().email({ minDomainSegments: 2 }).messages({
    "string.email": `"email" should be a valid email`,
  }),
})
.unknown(false)
.min(1)
.prefs({ errors: { wrap: { label: false } } })
.messages({
  "object.min": "At least one company field must be provided to update.",
  "object.unknown": "El campo '{#label}' no está permitido."
});
