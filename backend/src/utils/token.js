import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
  const secret =
    process.env.JWT_SECRET ||
    "hubly-crm-default-secret-key-change-in-production";

  const ttl = process.env.JWT_EXPIRE || "7d";

  if (!process.env.JWT_SECRET) {
    console.warn(
      "WARNING: JWT_SECRET is not set in environment variables. Using default secret."
    );
  }

  return jwt.sign({ id: userId }, secret, { expiresIn: ttl });
};

export const verifyToken = (token) => {
  const secret =
    process.env.JWT_SECRET ||
    "hubly-crm-default-secret-key-change-in-production";

  return jwt.verify(token, secret);
};

export default { generateToken, verifyToken };