import Joi from 'joi';

/**
 * Validation schemas
 */

// User registration
export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required'
  }),
  fullName: Joi.string().min(2).required().messages({
    'string.min': 'Full name must be at least 2 characters',
    'any.required': 'Full name is required'
  })
});

// User login
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Company creation
export const companySchema = Joi.object({
  piva: Joi.string().pattern(/^[0-9]{11}$/).required().messages({
    'string.pattern.base': 'P.IVA must be exactly 11 digits',
    'any.required': 'P.IVA is required'
  }),
  name: Joi.string().min(2).required().messages({
    'string.min': 'Company name must be at least 2 characters',
    'any.required': 'Company name is required'
  }),
  email: Joi.string().email().optional().allow('', null),
  phone: Joi.string().optional().allow('', null)
});

// Report creation
export const createReportSchema = Joi.object({
  companyId: Joi.string().uuid().optional(),
  piva: Joi.string().pattern(/^[0-9]{11}$/).required(),
  companyName: Joi.string().min(2).required(),
  email: Joi.string().email().optional().allow('', null),
  phone: Joi.string().optional().allow('', null)
});

// Report completion (from n8n callback)
export const completeReportSchema = Joi.object({
  status: Joi.string().valid('completed', 'failed').required(),
  payload: Joi.object().optional(),
  error: Joi.string().optional().allow('', null)
});

// Report query filters
export const reportFiltersSchema = Joi.object({
  status: Joi.string().valid('processing', 'completed', 'failed').optional(),
  search: Joi.string().optional(),
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
  limit: Joi.number().integer().min(1).max(100).default(50),
  offset: Joi.number().integer().min(0).default(0)
});

/**
 * Middleware to validate request body
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message,
        details: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message
        }))
      });
    }

    req.validatedBody = value;
    next();
  };
};

/**
 * Middleware to validate query parameters
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message,
        details: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message
        }))
      });
    }

    req.validatedQuery = value;
    next();
  };
};
