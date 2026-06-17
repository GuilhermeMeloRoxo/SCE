export function formatarDataMural(dataString: string): string {
  if (!dataString) return "";
  
  return new Date(dataString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}