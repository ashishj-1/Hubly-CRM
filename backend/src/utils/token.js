import jwt from "jsonwebtoken";

// Generate JWT token
export const generateToken = (userId) => {
  const secret =
    process.env.JWT_SECRET ||
    "hubly-crm-default-secret-key-change-in-production";
  const expiresIn = process.env.JWT_EXPIRE || "7d";

  if (!process.env.JWT_SECRET) {
    console.warn(
      "WARNING: JWT_SECRET is not set in environment variables. Using default secret."
    );
  }

  return jwt.sign({ id: userId }, secret, { expiresIn });
};

// Verify JWT token
export const verifyToken = (token) => {
  const secret =
    process.env.JWT_SECRET ||
    "hubly-crm-default-secret-key-change-in-production";

  return jwt.verify(token, secret);
};

export default { generateToken, verifyToken };