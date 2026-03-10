import { body } from 'express-validator';

export const registerValidator = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[A-Za-z])(?=.*\d)/),
  body('full_name').trim().isLength({ min: 2, max: 120 })
];