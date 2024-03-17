import { body } from "express-validator";

const validateRegisterRoute = () => {
  return [
    body("firstName", "First name cannot be empty.").trim().notEmpty(),
    body("lastName", 'Last name cannot be empty.').trim().notEmpty(),
    body("email", "Invalid email address.").trim().normalizeEmail().isEmail(),
    body("password", "Password cannot be empty.").trim().notEmpty(),
    body("password", "Password should be alpha-numeric.").isAlphanumeric(),
    body("password", "Password should be at least 6 characters long.").isLength({ min: 6 })
  ]
}

const validateLoginRoute = () => {
  return [
    body("email").trim().notEmpty().withMessage("Email cannot be empty.").isEmail().withMessage("Not a valid email address.").normalizeEmail().withMessage("Invalid email address."),
    body("password").trim().notEmpty().withMessage("Password cannot be empty.").isAlphanumeric().withMessage("Password should be alpha-numeric.").isLength({ min: 6 }).withMessage("Password should be at list 6 characters long.")
  ]
}

const validateForgotPasswordRoute = () => {
  return [
    body('email').trim().notEmpty().withMessage("Email cannot be empty.").isEmail().withMessage("Not a valid email address.").normalizeEmail().withMessage("Invalid email address.")
  ]
}

export default {
  validateRegisterRoute,
  validateLoginRoute,
  validateForgotPasswordRoute
}
