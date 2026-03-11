import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../lib/authMiddleware.js';

const router = Router();

const CreateUserSchema = z.object({
  login: z.string().min(3),
  password: z.string().min(6),
  email: z.string().email().optional().or(z.literal('')),
  fullName: z.string().min(1),
  phone: z.string().min(6).optional().or(z.literal('')),
  role: z.enum(['USER', 'ADMIN']).default('USER'),
  isApproved: z.boolean().default(true),
});

const UpdateUserSchema = z.object({
  password: z.string().min(6).optional(),
  email: z.string().email().optional().or(z.literal('')),
  fullName: z.string().min(1).optional(),
  phone: z.string().min(6).optional().or(z.literal('')),
  role: z.enum(['USER', 'ADMIN']).optional(),
  isApproved: z.boolean().optional(),
});

router.use(requireAuth, requireAdmin);

router.get('/users', async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        login: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isApproved: true,
        approvedAt: true,
        createdAt: true,
      },
    });
    res.json({ users });
  } catch (e) {
    next(e);
  }
});

router.post('/users', async (req, res, next) => {
  try {
    const payload = CreateUserSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(payload.password, 10);

    const user = await prisma.user.create({
      data: {
        login: payload.login,
        email: payload.email || null,
        fullName: payload.fullName,
        phone: payload.phone || null,
        role: payload.role,
        isApproved: payload.isApproved,
        approvedAt: payload.isApproved ? new Date() : null,
        passwordHash,
      },
      select: {
        id: true,
        login: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isApproved: true,
        approvedAt: true,
        createdAt: true,
      },
    });

    res.status(201).json({ user });
  } catch (e) {
    next(e);
  }
});

router.patch('/users/:id', async (req, res, next) => {
  try {
    const payload = UpdateUserSchema.parse(req.body);
    const data = {
      ...(payload.email !== undefined ? { email: payload.email || null } : {}),
      ...(payload.fullName !== undefined ? { fullName: payload.fullName } : {}),
      ...(payload.phone !== undefined ? { phone: payload.phone || null } : {}),
      ...(payload.role !== undefined ? { role: payload.role } : {}),
      ...(payload.isApproved !== undefined
        ? { isApproved: payload.isApproved, approvedAt: payload.isApproved ? new Date() : null }
        : {}),
      ...(payload.password ? { passwordHash: await bcrypt.hash(payload.password, 10) } : {}),
    };

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: {
        id: true,
        login: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isApproved: true,
        approvedAt: true,
        createdAt: true,
      },
    });

    res.json({ user });
  } catch (e) {
    next(e);
  }
});

export const adminRouter = router;
