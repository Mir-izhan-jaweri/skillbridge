import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .max(128)
      .regex(/[A-Za-z]/, 'Include at least one letter')
      .regex(/\d/, 'Include at least one number'),
    confirm: z.string().min(1, 'Confirm your password'),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  bio: z.string().max(2000).optional().or(z.literal('')),
  location: z.string().max(120).optional().or(z.literal('')),
})

export function parseSkillInput(raw) {
  return [...new Set(String(raw || '').split(/[,;\n]/).map((s) => s.trim()).filter(Boolean))]
}
