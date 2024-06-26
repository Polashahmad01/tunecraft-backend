import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ObjectId } from "mongoose";

import User from "../models/user.js";
import { enableEnv } from "../utils/enableEnv.js";
import { sendEmail } from "../utils/email.js";

enableEnv("/../.env");

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      const error = new Error("Unable to proceed. The information you entered is not valid. Please review and correct your entries.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const { firstName, lastName, email, password } = req.body;
    const isUserExist = await User.findOne({ email: email });
    if(isUserExist) {
      const error = new Error("The email address you have entered is already registered. Please use a different email to proceed.");
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

    res.status(201).json({ success: true, message: "User creation successful. The account has been established accurately and securely.", statusCode: 201, user: user });
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
      const error = new Error("Unable to proceed. The information you entered is not valid. Please review and correct your entries.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const { fullName, email, emailVerified, profilePicture } = req.body;
    const isUserExist = await User.findOne({ email: email });
    if(isUserExist) {
      const token = jwt.sign({ email: isUserExist.email, userId: isUserExist._id }, process.env.JWT_SECRET, { expiresIn: "3h" });
      return res.status(200).json({ success: true, message: "User creation successful. The account has been established accurately and securely.", statusCode: 200, token: token, data: isUserExist });
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
    return res.status(201).json({ success: true, message: "User creation successful. The account has been established accurately and securely.", statusCode: 201, token: token, data: user });
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
      const error = new Error("Unable to proceed. The information you entered is not valid. Please review and correct your entries.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if(!user) {
      const error = new Error(`The email, ${email}, is not associated with any existing account. Please check your input or try using a different email address.`);
      error.statusCode = 401;
      throw error;
    }

    const isPasswordEqual = await bcrypt.compare(password, user.password);
    if(!isPasswordEqual) {
      const error = new Error("Invalid password entered. Please retry with the correct password.");
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign({ email: user.email, userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3h" });

    res.status(200).json({ success: true, message: "User authentication successful. Access granted.", statusCode: 200, token: token, data: user });
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
      const error = new Error("Unable to proceed. The information you entered is not valid. Please review and correct your entries.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const { fullName, email, emailVerified, profilePicture } = req.body;
    const isUserExist = await User.findOne({ email: email });
    if(isUserExist) {
      const token = jwt.sign({ email: isUserExist.email, userId: isUserExist._id }, process.env.JWT_SECRET, { expiresIn: "3h" });
      return res.status(200).json({ success: true, message: "User authentication successful. Access granted.", statusCode: 200, token: token, data: isUserExist });
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
    res.status(201).json({ success: true, message: "User authentication successful. Access granted.", statusCode: 201, token: token, data: user });
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
      const error = new Error("Unable to proceed. The information you entered is not valid. Please review and correct your entries");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if(!user) {
      const error = new Error(`The email, ${email}, is not associated with any existing account. Please check your input or try using a different email address.`);
      error.statusCode = 422;
      throw error;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiration = Date.now() + 3600000;

    user.resetToken = resetToken;
    user.resetTokenExpiration = tokenExpiration;
    await user.save();

    const link = `${process.env.FRONT_END_BASE_URL}/auth/reset-password/${resetToken}`;
    const subject = "Password reset";
    const text = `You are receiving this because you (or someone else) have requested the reset of the password for your account. Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it: ${link} If you did not request this, please ignore this email and your password will remain unchanged.`;

    await sendEmail(email, subject, text);

    res.status(200).json({ success: true, message: "A link to reset your password has been successfully dispatched to your registered email address.", statusCode: 200 });
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
      const error = new Error("Unable to proceed. The information you entered is not valid. Please review and correct your entries.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const { password, tokenId } = req.body;
    const user = await User.findOne({ resetToken: tokenId, resetTokenExpiration: { $gt: Date.now() }});
    if(!user) {
      const error = new Error("The token ID provided is either expired or invalid. Please enter a valid token ID or request a new one if needed.");
      error.statusCode = 422;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Your password has been successfully updated.", statusCode: 200 });
  } catch(err) {
    if(!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
}

const logOut = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      const error = new Error("Unable to proceed. The information you entered is not valid. Please review and correct your entries.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const { userId } = req.body;
    const user = await User.findOne({ _id: new Object(userId) });
    if(!user) {
      const error = new Error(`The id, ${userId}, is not associated with any existing account. Please check your input or try using a different userId.`);
      error.statusCode = 401;
      throw error;
    }

    res.status(200).json({ success: true, message: "User has been successfully logged out.", statusCode: 200, token: null });    
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
  socialRegister,
  logOut
}
