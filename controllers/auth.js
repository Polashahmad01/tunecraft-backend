import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import User from "../models/user.js";
import { enableEnv } from "../utils/enableEnv.js";
import { sendEmail } from "../utils/email.js";

enableEnv("/../.env");

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      const error = new Error("Validation failed entered data is incorrect.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const { firstName, lastName, email, password } = req.body;
    const isUserExist = await User.findOne({ email: email });
    if(isUserExist) {
      const error = new Error("User already exists. Please try again with other email address.");
      error.statusCode = 422;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({ success: true, message: "User successfully created.", statusCode: 201, user: user });
  } catch(err) {
    if(!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
}

const socialRegister = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      const error = new Error("Validation failed entered data is incorrect.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const { fullName, email, emailVerified, profilePicture } = req.body;
    const isUserExist = await User.findOne({ email: email });
    if(isUserExist) {
      const token = jwt.sign({ email: isUserExist.email, userId: isUserExist._id }, process.env.JWT_SECRET, { expiresIn: "3h" });
      return res.status(200).json({ success: true, message: 'User successfully created.', statusCode: 200, token: token, data: isUserExist });
    }

    const user = new User({
      firstName: fullName.split(" ")[0],
      lastName: fullName.split(" ")[1],
      email: email,
      emailVerified: emailVerified,
      profilePicture: profilePicture
    });

    await user.save();

    const token = jwt.sign({ email: user.email, userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3h" });
    return res.status(201).json({ success: true, message: 'User successfully created.', statusCode: 201, token: token, data: user });
  } catch(err) {
    if(!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
}

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      const error = new Error("Validation failed entered data is incorrect.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if(!user) {
      const error = new Error(`A user with ${email} could not be found.`);
      error.statusCode = 401;
      throw error;
    }

    const isPasswordEqual = await bcrypt.compare(password, user.password);
    if(!isPasswordEqual) {
      const error = new Error("Wrong password. Please try again with the correct password.");
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign({ email: user.email, userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3h" });

    res.status(200).json({ success: true, message: 'User successfully logged in.', statusCode: 200, token: token, data: user });
  } catch(err) {
    if(!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
}

const socialLogin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      const error = new Error("Validation failed entered data is incorrect");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const { fullName, email, emailVerified, profilePicture } = req.body;
    const isUserExist = await User.findOne({ email: email });
    if(isUserExist) {
      const token = jwt.sign({ email: isUserExist.email, userId: isUserExist._id }, process.env.JWT_SECRET, { expiresIn: "3h" });
      return res.status(200).json({ success: true, message: 'User successfully logged in.', statusCode: 200, token: token, data: isUserExist });
    }

    const user = new User({
      firstName: fullName.split(" ")[0],
      lastName: fullName.split(" ")[1],
      email: email,
      emailVerified: emailVerified,
      profilePicture: profilePicture
    })

    await user.save();

    const token = jwt.sign({ email: user.email, userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3h" });
    res.status(200).json({ success: true, message: 'User successfully logged in.', statusCode: 200, token: token, data: user });
  } catch(err) {
    if(!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
}

const forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      const error = new Error("Validation failed entered data is incorrect");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if(!user) {
      const error = new Error(`Not found any account with ${email} address.`);
      error.statusCode = 422;
      throw error;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiration = Date.now() + 3600000;

    user.resetToken = resetToken;
    user.resetTokenExpiration = tokenExpiration;
    await user.save();

    const link = `${process.env.FRONT_END_BASE_URL}/auth/reset-password/${resetToken}`;
    const subject = 'Password reset';
    const text = `You are receiving this because you (or someone else) have requested the reset of the password for your account. Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it: ${link} If you did not request this, please ignore this email and your password will remain unchanged.`;

    await sendEmail(email, subject, text);

    res.status(200).json({ success: true, message: 'A password reset link has been sent to your email.', statusCode: 200 });
  } catch(err) {
    if(!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
}

const resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      const error = new Error("Validation failed entered data is incorrect");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const { password, tokenId } = req.body;
    const user = await User.findOne({ resetToken: tokenId, resetTokenExpiration: { $gt: Date.now() }});
    if(!user) {
      const error = new Error("Invalid or expired tokenId.");
      error.statusCode = 422;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password has been updated.", statusCode: 200 });
  } catch(err) {
    if(!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
}

export default {
  register,
  login,
  socialLogin,
  forgotPassword,
  resetPassword,
  socialRegister
}
