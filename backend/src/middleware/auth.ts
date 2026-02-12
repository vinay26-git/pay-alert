import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

type AccessPayload = {
  sub: string;
  type: "access";
};

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.header("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ message: "Missing access token" });
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;

    if (payload.type !== "access") {
      res.status(401).json({ message: "Invalid token type" });
      return;
    }

    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired access token" });
  }
};
