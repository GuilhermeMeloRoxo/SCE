export function formatarDataMural(dataString: string): string {
  if (!dataString) return "";
  
  return new Date(dataString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export function formatarFormacao(valor: string): string {
  const apenasDigitos = valor.replace(/\D/g, "").slice(0, 5);
  if (apenasDigitos.length <= 4) {
    return apenasDigitos;
  } return `${apenasDigitos.slice(0, 4)}.${apenasDigitos.slice(4)}`;
}

export function formatarCPF(valor: string): string {
  const apenasDigitos = valor.replace(/\D/g, "").slice(0, 11);

  if (apenasDigitos.length <= 3) {
    return apenasDigitos;
  }

  if (apenasDigitos.length <= 6) {
    return `${apenasDigitos.slice(0, 3)}.${apenasDigitos.slice(3)}`;
  }

  if (apenasDigitos.length <= 9) {
    return `${apenasDigitos.slice(0, 3)}.${apenasDigitos.slice(3, 6)}.${apenasDigitos.slice(6)}`;
  }

  return `${apenasDigitos.slice(0, 3)}.${apenasDigitos.slice(3, 6)}.${apenasDigitos.slice(6, 9)}-${apenasDigitos.slice(9, 11)}`;
}

export function formatarTelefone(valor: string): string {
  const apenasDigitos = valor.replace(/\D/g, "").slice(0, 11);

  if (apenasDigitos.length <= 2) {
    return apenasDigitos;
  }

  if (apenasDigitos.length <= 7) {
    return `(${apenasDigitos.slice(0, 2)}) ${apenasDigitos.slice(2)}`;
  }

  return `(${apenasDigitos.slice(0, 2)}) ${apenasDigitos.slice(2, 7)}-${apenasDigitos.slice(7)}`;
}