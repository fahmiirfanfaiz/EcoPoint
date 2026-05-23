import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  userRole?: string;
}

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

const normalizeBearerToken = (authHeader: string): string => {
  const raw = authHeader.replace(/^Bearer\s+/i, "").trim();

  // Handle accidental nested prefix: "Bearer Bearer <token>"
  const withoutNestedPrefix = raw.replace(/^Bearer\s+/i, "").trim();

  // Handle accidentally quoted token values.
  const unquoted = withoutNestedPrefix.replace(/^"+|"+$/g, "").trim();

  // Extract raw JWT payload if there are trailing/leading unexpected characters.
  const jwtMatch = unquoted.match(
    /[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/,
  );
  return jwtMatch?.[0] ?? unquoted;
};

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Token tidak ditemukan" });
      return;
    }

    const token = normalizeBearerToken(authHeader);
    if (!token) {
      res.status(401).json({ message: "Token tidak ditemukan" });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    res.status(401).json({ message: "Token tidak valid atau sudah expired" });
  }
};

/**
 * Admin-only middleware. Must be used AFTER authMiddleware.
 * Checks if the authenticated user has the "admin" role.
 */
export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const role = req.userRole?.replace(/'/g, "") ?? "";
  if (role !== "admin") {
    res
      .status(403)
      .json({ message: "Akses ditolak. Hanya admin yang diizinkan." });
    return;
  }
  next();
};
