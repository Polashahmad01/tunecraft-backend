import express from "express";
import { } from "express-validator";

import authController from "../controllers/auth.js";
import authRouteValidator from "../utils/authValidation.js";

const router = express.Router();

router.post("/v1/register", authRouteValidator.validateRegisterRoute(), authController.register);
router.post("/v1/login", authRouteValidator.validateLoginRoute(), authController.login);
router.post("/v1/forgot-password", authRouteValidator.validateForgotPasswordRoute(), authController.forgotPassword);

export default router;
