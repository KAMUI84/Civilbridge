import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token)
      return res.status(401).json({ message: "Not authorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }
    next();
  };
};