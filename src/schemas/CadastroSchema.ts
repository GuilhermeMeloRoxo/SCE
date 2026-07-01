import { z } from "zod";

export const cadastroSchema = z.object({
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+ [A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, "Digite seu nome completo"),
  username: z
    .string()
    .min(4, "Nome de usuário muito curto")
    .regex(/^[A-Za-z0-9-]+$/, "Permitido apenas letras, números e hífen"),
  email: z.string().email("Email inválido"),
  cpf: z.string().regex(/^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}$/, "CPF deve ter o formato 000.000.000-00"),
  senha: z.string().min(8, "Senha deve ter no mínimo 8 dígitos"),
});

export type CadastroSchema = z.infer<typeof cadastroSchema>;
