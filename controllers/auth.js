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

export default {
  register
}
