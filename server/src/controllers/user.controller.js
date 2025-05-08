// import bcryptjs from "bcryptjs";
// import mongoose from "mongoose";
// import { userModel } from "../models/user.model.js";
// import { journalModel } from "../models/journalEntry.model.js";
// import { generateToken } from "../utils/jwt.token.js";

// export const registerUser = async (req, res) => {
//     console.log("Received user data:", req.body);

//     const { name, email, password, phoneNumber } = req.body;

//     const salt = await bcryptjs.genSalt(10);
//     const hashPassword = await bcryptjs.hash(password, salt);

//     if ([name, email, password].some(field => !field || field.trim() === "") || !phoneNumber) {
//         console.error("Missing fields in request:", req.body);
//         return res.status(400).json({
//             statusCode: 400,
//             message: "All fields are required!"
//         });
//     }

//     if (!/^\d{10}$/.test(phoneNumber)) {
//         console.error("Invalid phone number:", phoneNumber);
//         return res.status(400).json({
//             statusCode: 400,
//             message: "Phone number must be 10 digits!"
//         });
//     }

//     try {
//         const existingUser = await userModel.findOne({ $or: [{ email }, { phoneNumber }] });
//         if (existingUser) {
//             console.warn("User already exists:", existingUser);
//             return res.status(400).json({
//                 message: "User already exists. Please login to continue!",
//                 statusCode: 400
//             });
//         }

//         const newUser = new userModel({
//             name,
//             email,
//             password: hashPassword,
//             phoneNumber
//         });

//         console.log("Registering new user:", newUser);
//         await newUser.save();

//         return res.status(200).json({
//             message: "User successfully registered!",
//             user: newUser
//         });
//     } catch (e) {
//         console.error("Error saving user:", e);
//         return res.status(500).json({ error: e });
//     }
// };

// export const loginUser = async (req, res) => {
//     const { email, password } = req.body;

//     if ([email, password].some(field => !field || field.trim() === "")) {
//         return res.status(400).json({
//             statusCode: 400,
//             message: "All fields are required!"
//         });
//     }

//     try {
//         const user = await userModel.findOne({ email });
//         if (!user) {
//             console.log("User does not exist, please register!");
//             return res.status(400).json({
//                 error: "User does not exist, please register!",
//                 statusCode: 400
//             });
//         }

//         const isMatch = await bcryptjs.compare(password, user.password);
//         if (!isMatch) {
//             console.log("Invalid password!");
//             return res.status(400).json({
//                 error: "Invalid password!",
//                 statusCode: 400
//             });
//         }

//         const token = generateToken(user._id);

//         return res.status(200).json({
//             message: "User successfully logged in!",
//             user,
//             token
//         });
//     } catch (e) {
//         console.log(e);
//         return res.status(500).json({ error: e });
//     }
// };

// export const logoutUser = async (req, res) => {
//     try {
//         res.clearCookie("token", {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === "production",
//             sameSite: "strict",
//         });

//         return res.status(200).json({
//             message: "User logged out successfully!"
//         });
//     } catch (e) {
//         return res.status(500).json({ message: "Logout failed!", error: e });
//     }
// };


// export const displayAllEntries = async (req, res) => {
//     const { userId } = req.params;
//     console.log(userId);

//     try {
//         const entries = await journalModel.find({ user: userId });
//         console.log(entries);
//         return res.status(200).json({
//             message: "All entries retrieved!",
//             entries
//         });
//     } catch (e) {
//         return res.status(500).json({ message: e });
//     }
// };


import bcryptjs from "bcryptjs";
import { userModel } from "../models/user.model.js";
import { journalModel } from "../models/journalEntry.model.js";
import { generateToken } from "../utils/jwt.token.js";

export const registerUser = async (req, res) => {
  const { name, email, password, phoneNumber } = req.body;

  if ([name, email, password].some(field => !field || field.trim() === "") || !phoneNumber) {
    return res.status(400).json({ statusCode: 400, message: "All fields are required!" });
  }

  if (!/^\d{10}$/.test(phoneNumber)) {
    return res.status(400).json({ statusCode: 400, message: "Phone number must be 10 digits!" });
  }

  try {
    const existingUser = await userModel.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists. Please login to continue!",
        statusCode: 400
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    const newUser = new userModel({ name, email, password: hashPassword, phoneNumber });
    await newUser.save();

    return res.status(200).json({ message: "User successfully registered!", user: newUser });
  } catch (e) {
    return res.status(500).json({ error: e });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if ([email, password].some(field => !field || field.trim() === "")) {
    return res.status(400).json({ statusCode: 400, message: "All fields are required!" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User does not exist, please register!", statusCode: 400 });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password!", statusCode: 400 });
    }

    const token = generateToken(user._id);

    return res.status(200).json({ message: "User successfully logged in!", user, token });
  } catch (e) {
    return res.status(500).json({ error: e });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });

    return res.status(200).json({ message: "User logged out successfully!" });
  } catch (e) {
    return res.status(500).json({ message: "Logout failed!", error: e });
  }
};

export const displayAllEntries = async (req, res) => {
  const { userId } = req.params;

  try {
    const entries = await journalModel.find({ user: userId });
    return res.status(200).json({ message: "All entries retrieved!", entries });
  } catch (e) {
    return res.status(500).json({ message: e });
  }
};


export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ message: 'Server error while fetching profile' });
  }
};
