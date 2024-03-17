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

export default {
  validateRegisterRoute
}
