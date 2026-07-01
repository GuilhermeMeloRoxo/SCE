import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(8, 'Senha deve ter no mínimo 8 dígitos'),
});

export type LoginSchema = z.infer<typeof loginSchema>;
