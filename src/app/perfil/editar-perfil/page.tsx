import type { Metadata } from "next";
import EditarPerfilClient from "./EditarPerfilClient";

export const metadata: Metadata = {
  title: "Edição de Perfil",
};

export default function EditarPerfil() {
  return <EditarPerfilClient />;
}