import Joi from "joi";

export const schemaPolicy = Joi.object({
  policy: Joi.array()
    .items(
      Joi.string().trim().min(1).messages({
        "string.base": "Each policy value must be a string",
        "string.empty": "Policy values cannot be empty",
        "string.min": "Policy values cannot be empty",
      }),
    )
    .min(3)
    .max(6)
    .required()
    .messages({
      "array.base": "Policy must be an array",
      "array.min": "Policy must contain at least 3 values",
      "array.max": "Policy cannot contain more than 6 values",
      "any.required": "Policy is required",
    }),
});
