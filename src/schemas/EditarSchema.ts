import { z } from 'zod';

export const editarSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+ [A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, 'Digite seu nome completo'),
  username: z
    .string()
    .min(4, 'Nome de usuário muito curto')
    .regex(/^[A-Za-z0-9-]+$/, 'Permitido apenas letras, números e hífen'),
  email: z.string().email('Email inválido'),
  cpf: z.string().regex(/^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}$/, 'CPF deve ter o formato 000.000.000-00'),
  senha: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (typeof val === 'string' && val.trim() === '' ? null : val))
    .refine((val) => val == null || val.length >= 8, {
      message: 'Senha deve ter no mínimo 8 dígitos',
    }),
  matricula: z.string().regex(/^(?:\d{7}|\d{9,})$/, 'Matrícula inválida'),
  curso: z.string().min(1, 'Selecione uma opção de curso'),
  formacao: z.string().regex(/^[0-9]{4}\.[0-9]{1}$/, 'Data de formação inválida'),
  telefone: z
    .string()
    .optional()
    .refine((val) => !val || /^\(\d{2}\) \d{5}-\d{4}$/.test(val), {
      message: 'Telefone inválido',
    }),
});

export type EditarSchema = z.infer<typeof editarSchema>;
