"use client";

import { useState } from "react";

export function useTogglePassword() {
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const toggleSenha = () => setMostrarSenha((prev) => !prev);

  return { mostrarSenha, toggleSenha };
}
