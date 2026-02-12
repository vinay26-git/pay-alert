import { PaymentStatus, Frequency, Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

import { prisma } from "../db/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const paymentSchema = z.object({
  serviceName: z.string().min(1),
  category: z.string().min(1),
  amount: z.number().positive(),
  dueDate: z.coerce.date(),
  frequency: z.nativeEnum(Frequency),
  status: z.nativeEnum(PaymentStatus).optional(),
  paymentLink: z.string().url().optional(),
  notes: z.string().max(500).optional()
});

router.use(requireAuth);

router.get("/", async (req, res) => {
  const payments = await prisma.payment.findMany({
    where: { userId: req.userId },
    orderBy: { dueDate: "asc" }
  });

  res.json(payments);
});

router.post("/", async (req, res) => {
  const parsed = paymentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });
    return;
  }

  const payment = await prisma.payment.create({
    data: {
      ...parsed.data,
      amount: new Prisma.Decimal(parsed.data.amount),
      userId: req.userId!
    }
  });

  res.status(201).json(payment);
});

router.put("/:paymentId", async (req, res) => {
  const parsed = paymentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });
    return;
  }

  const payment = await prisma.payment.updateMany({
    where: { id: req.params.paymentId, userId: req.userId },
    data: {
      ...parsed.data,
      amount: new Prisma.Decimal(parsed.data.amount)
    }
  });

  if (payment.count === 0) {
    res.status(404).json({ message: "Payment not found" });
    return;
  }

  res.json({ message: "Payment updated" });
});

router.delete("/:paymentId", async (req, res) => {
  const deleted = await prisma.payment.deleteMany({
    where: { id: req.params.paymentId, userId: req.userId }
  });

  if (deleted.count === 0) {
    res.status(404).json({ message: "Payment not found" });
    return;
  }

  res.status(204).send();
});

export default router;
