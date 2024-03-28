import express from "express";

import authController from "../controllers/auth.js";
import authRouteValidator from "../utils/authValidation.js";

const router = express.Router();

router.post("/v1/register", authRouteValidator.validateRegisterRoute(), authController.register);
router.post("/v1/register/social", authRouteValidator.validateRegisterSocialRoute(), authController.socialRegister);
router.post("/v1/login", authRouteValidator.validateLoginRoute(), authController.login);
router.post("/v1/login/social", authRouteValidator.validateLoginSocialRoute(), authController.socialLogin);
router.post("/v1/forgot-password", authRouteValidator.validateForgotPasswordRoute(), authController.forgotPassword);
router.post("/v1/reset-password/:tokenId", authRouteValidator.validateResetPasswordRoute(), authController.resetPassword);

export default router;
