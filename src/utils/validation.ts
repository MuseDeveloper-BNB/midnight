import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const commentSchema = z.object({
  contentId: z.string().uuid(),
  body: z.string().min(1).max(5000),
});

export const contentSchema = z.object({
  type: z.enum(['NEWS', 'BLOG']),
  title: z.string().min(1).max(255),
  body: z.string().min(1),
  slug: z.string().min(1).max(255).optional(),
  imageUrl: z.string().min(1).max(2048).optional(),
  blogAuthor: z.string().trim().min(1).max(120).optional(),
  publishNow: z
    .union([z.boolean(), z.literal('true'), z.literal('false'), z.literal('on')])
    .optional()
    .transform((v) => v === true || v === 'true' || v === 'on'),
  scheduledPublishAt: z
    .string()
    .min(1)
    .optional()
    .transform((v) => (v && v.trim() ? new Date(v.trim()) : undefined))
    .refine((v) => !v || !Number.isNaN(v.getTime()), {
      message: 'Invalid scheduled publish date.',
    }),
  publishedAt: z
    .string()
    .min(1)
    .optional()
    .transform((v) => (v && v.trim() ? new Date(v.trim()) : undefined))
    .refine((v) => !v || !Number.isNaN(v.getTime()), {
      message: 'Invalid published date.',
    }),
});

const emptyToUndefined = (v: unknown) =>
  v === '' || v === undefined ? undefined : v;

/** Profile update: at least one of name or email required; email format and length. */
export const profileUpdateSchema = z
  .object({
    name: z.preprocess(emptyToUndefined, z.string().min(1).max(255).optional()),
    email: z.preprocess(emptyToUndefined, z.string().email().max(255).optional()),
  })
  .refine((data) => (data.name ?? '').trim() !== '' || (data.email ?? '').trim() !== '', {
    message: 'At least one of name or email must be provided',
    path: ['name'],
  });
