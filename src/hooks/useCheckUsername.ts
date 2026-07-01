"use client";

import { useEffect, useState } from "react";
import { verificarUsernameDisponivel } from "@/services/auth";

export function useCheckUsername(username: string) {
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!username) {
      setUsernameStatus('idle');
      return;
    }

    if (username.length < 4) {
      setUsernameStatus('error');
      return;
    }

    setUsernameStatus('loading');

    const timer = window.setTimeout(async () => {
      try {
        const disponivel = await verificarUsernameDisponivel(username);
        setUsernameStatus(disponivel ? 'success' : 'error');
      } catch (error) {
        setUsernameStatus('error');
      }
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [username]);

  return { usernameStatus };
}
