// Validation utilities for API routes
import { Request, Response, NextFunction } from 'express';

/**
 * Validates that required fields are present in request body
 */
export const validateRequiredFields = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingFields = fields.filter(field => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Campos requeridos faltantes',
        missingFields,
        message: `Los siguientes campos son requeridos: ${missingFields.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Validates numeric query parameters
 */
export const validateNumericQuery = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const invalidFields = fields.filter(field => {
      const value = req.query[field];
      if (value === undefined) return false;
      return isNaN(Number(value));
    });

    if (invalidFields.length > 0) {
      return res.status(400).json({
        error: 'Parámetros inválidos',
        invalidFields,
        message: `Los siguientes parámetros deben ser numéricos: ${invalidFields.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Error handler wrapper for async routes
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Safe JSON parse with fallback
 */
export const safeJsonParse = (value: string | undefined, fallback: any = null) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};
