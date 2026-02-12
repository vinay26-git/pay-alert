import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

import { prisma } from "../db/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const budgetSchema = z.object({
  category: z.string().min(1),
  limit: z.number().positive()
});

router.use(requireAuth);

router.get("/", async (req, res) => {
  const budgets = await prisma.budget.findMany({
    where: { userId: req.userId },
    orderBy: { category: "asc" }
  });

  res.json(budgets);
});

router.put("/:category", async (req, res) => {
  const parsed = budgetSchema.safeParse({ ...req.body, category: req.params.category });
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });
    return;
  }

  const budget = await prisma.budget.upsert({
    where: {
      userId_category: {
        userId: req.userId!,
        category: parsed.data.category
      }
    },
    update: { limit: new Prisma.Decimal(parsed.data.limit) },
    create: {
      userId: req.userId!,
      category: parsed.data.category,
      limit: new Prisma.Decimal(parsed.data.limit)
    }
  });

  res.json(budget);
});

export default router;
