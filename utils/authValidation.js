import { body } from "express-validator";

const validateRegisterRoute = () => {
  return [
    body("firstName", "First name cannot be empty.").trim().notEmpty(),
    body("lastName", "Last name cannot be empty.").trim().notEmpty(),
    body("email", "Invalid email address.").trim().isEmail(),
    body("password", "Password cannot be empty.").trim().notEmpty(),
    body("password", "Password should be alpha-numeric.").isAlphanumeric(),
    body("password", "Password should be at least 6 characters long.").isLength({ min: 6 })
  ]
}

const validateLoginRoute = () => {
  return [
    body('email').trim().isEmail().withMessage("Invalid email address."),
    body("password").trim().notEmpty().withMessage("Password cannot be empty.").isAlphanumeric().withMessage("Password should be alpha-numeric.").isLength({ min: 6 }).withMessage("Password should be at list 6 characters long.")
  ]
}

const validateLoginSocialRoute = () => {
  return [
    body("fullName").trim().notEmpty().withMessage("Full name cannot be empty."),
    body('email').trim().isEmail().withMessage("Invalid email address."),
    body("emailVerified").isBoolean().withMessage("emailVerified should be a boolean value")
  ]
}

const validateForgotPasswordRoute = () => {
  return [
    body('email').trim().isEmail().withMessage("Invalid email address.")
  ]
}

const validateResetPasswordRoute = () => {
  return [
    body('tokenId').trim().isLength({ min: 1 }).withMessage("Token id cannot be empty."),
    body('password').trim().notEmpty().withMessage("Password cannot be empty.").isAlphanumeric().withMessage("Password should be alpha-numeric.").isLength({ min: 6 }).withMessage("Password should be at least 6 characters long.")
  ]
}

const validateRegisterSocialRoute = () => {
  return [
    body("fullName").trim().notEmpty().withMessage("Full name cannot be empty."),
    body('email').trim().isEmail().withMessage("Invalid email address."),
    body("emailVerified").isBoolean().withMessage("emailVerified should be a boolean value")
  ]
}

const validateLogoutRoute = () => {
  return [
    body("userId").trim().notEmpty().withMessage("User ID cannot be empty.")
  ]
}

export default {
  validateRegisterRoute,
  validateLoginRoute,
  validateLoginSocialRoute,
  validateForgotPasswordRoute,
  validateResetPasswordRoute,
  validateRegisterSocialRoute,
  validateLogoutRoute
}
