import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import User from "../models/user.js";
import { enableEnv } from "../utils/enableEnv.js";

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

export default {
  register,
  login
}
