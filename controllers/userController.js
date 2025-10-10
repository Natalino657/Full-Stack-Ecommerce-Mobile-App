import asynchandler from "../middleware/asyncHandler.js";
import User from "../models/userModel.js";
import validator from "validator";
import generateToken from "../utils/generateToken.js";

import { json } from "express";

const authUser = asynchandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (User && (await user.matchPassword(password))) {
    generateToken(res, user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

const registerUser = asynchandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minNumbers: 1,
      minUppercase: 1,
      minSymbols: 1,
    })
  ) {
    res.status(400);
    throw new Error(
      '"Min 8 chars for password, upper, lower, number and symbol"'
    );
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({ name, email, password });

  if (user) {
    generateToken(res, user.id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const logoutUser = asynchandler(async (req, res) => {
  res.cookie("jwt");
  res.status(200).json({ message: "User logged out" });
});

const getUserProfile = asynchandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    (res,
      json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      }));
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const updateUserProfile = asynchandler(async (req, res) => {
  const user = await User.finfById(req.user._id);

  if (user) {
    if (req.body.email && !validator.isEmail(req.body.email)) {
      res.status(400);
      throw new Error("Invalid email");
    }

    if (
      req.body.password &&
      !validator.isStrongPassword(req.body.password, {
        minLength: 8,
        minLowercase: 1,
        minNumbers: 1,
        minUppercase: 1,
        minSymbols: 1,
      })
    ) {
      res.status(400);
      throw new Error(
        "Min 8 chars for password, upper, lower, number and symbol"
      );
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const getUsers = asynchandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

const deleteUser = asynchandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error("Can not delete admin user");
    }

    await deleteone({ _id: user._id });
    res.json({ message: "User removed sucessfully" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const getUserById = asynchandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const updateUser = asynchandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (req.body.email && !validator.isEmail(req.body.email)) {
      res.status(400);
      throw new Error("Invalid email");
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin);

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
};
