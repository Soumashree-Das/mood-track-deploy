import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config(); // ✅ Fixed typo from `congifDotenv` to correct `dotenv.config()`

const JWT_SECRET = process.env.JWT_SECRET || '1e2f58a3fdd206a288e5caabb2b6bdbcca47e68b65af07d94bab53bd84cb78064c';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    // throw new Error('Invalid or expired token');
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      message: error.message
    });
  }
};

// Middleware to protect routes
export const protect = async (req, res, next) => {
  let token;
  console.log("AUTH HEADER:", req.headers.authorization);

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};
