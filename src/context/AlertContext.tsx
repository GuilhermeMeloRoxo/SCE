"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type AlertType = "error" | "ok";

interface AlertContextData {
  mostrarAlerta: (tipo: AlertType, msg: string) => void;
}

const AlertContext = createContext<AlertContextData>({} as AlertContextData);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerta, setAlerta] = useState<{ tipo: AlertType; msg: string } | null>(null);

  const mostrarAlerta = (tipo: AlertType, msg: string) => {
    setAlerta({ tipo, msg });

    setTimeout(() => {
      setAlerta(null);
    }, 3000);
  };

  return (
    <AlertContext.Provider value={{ mostrarAlerta }}>
      {children}

      {alerta && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-3 pointer-events-none transition-all duration-300">
          {alerta.tipo === "error" ? (
            <div className="flex items-center justify-center gap-x-2 p-3 text-red-800 border border-red-300 rounded-lg bg-red-50 animate-bounce" role="alert">
              <span className="material-symbols-outlined !text-2xl text-red-600">error</span>
              <div>
                <span className="font-medium">Erro: {alerta.msg}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-x-2 p-3 text-green-800 border border-green-300 rounded-lg bg-green-50 animate-bounce" role="alert">
              <span className="material-symbols-outlined !text-2xl text-green-600">check_circle</span>
              <div>
                <span className="font-medium">Ok: {alerta.msg}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </AlertContext.Provider>
  );
}

export const useAlerta = () => useContext(AlertContext);