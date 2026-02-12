import crypto from "node:crypto";

import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { env, isProd } from "../config/env.js";
import { prisma } from "../db/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

const signAccessToken = (userId: string) =>
  jwt.sign({ type: "access" }, env.JWT_ACCESS_SECRET, {
    subject: userId,
    expiresIn: env.ACCESS_TOKEN_TTL
  });

const signRefreshToken = (userId: string) =>
  jwt.sign({ type: "refresh" }, env.JWT_REFRESH_SECRET, {
    subject: userId,
    expiresIn: env.REFRESH_TOKEN_TTL
  });

const issueTokens = async (userId: string) => {
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);
  const decoded = jwt.decode(refreshToken) as { exp: number };

  await prisma.refreshSession.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(decoded.exp * 1000)
    }
  });

  return { accessToken, refreshToken };
};

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });
    return;
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ message: "Email already in use" });
    return;
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      fullName: parsed.data.fullName,
      email,
      passwordHash
    }
  });

  const { accessToken, refreshToken } = await issueTokens(user.id);

  res
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    .status(201)
    .json({
      accessToken,
      user: { id: user.id, email: user.email, fullName: user.fullName }
    });
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const matches = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!matches) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const { accessToken, refreshToken } = await issueTokens(user.id);

  res
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    .json({
      accessToken,
      user: { id: user.id, email: user.email, fullName: user.fullName }
    });
});

router.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken as string | undefined;

  if (!refreshToken) {
    res.status(401).json({ message: "Missing refresh token" });
    return;
  }

  try {
    const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { sub: string; type: string };
    if (payload.type !== "refresh") {
      res.status(401).json({ message: "Invalid token type" });
      return;
    }

    const tokenHash = hashToken(refreshToken);
    const session = await prisma.refreshSession.findUnique({ where: { tokenHash } });

    if (!session || session.expiresAt < new Date()) {
      res.status(401).json({ message: "Refresh token is invalid or expired" });
      return;
    }

    await prisma.refreshSession.delete({ where: { tokenHash } });
    const tokens = await issueTokens(payload.sub);

    res
      .cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict",
        path: "/api/auth/refresh",
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      .json({ accessToken: tokens.accessToken });
  } catch {
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
});

router.post("/logout", async (req, res) => {
  const refreshToken = req.cookies.refreshToken as string | undefined;
  if (refreshToken) {
    await prisma.refreshSession.deleteMany({ where: { tokenHash: hashToken(refreshToken) } });
  }

  res.clearCookie("refreshToken", { path: "/api/auth/refresh" }).status(204).send();
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, fullName: true, createdAt: true }
  });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json(user);
});

export default router;
