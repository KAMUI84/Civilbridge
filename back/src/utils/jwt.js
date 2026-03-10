import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, jti: uuidv4() },
    SECRET,
    { expiresIn: EXPIRES_IN }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};

export const decodeToken = (token) => {
  return jwt.decode(token);
};