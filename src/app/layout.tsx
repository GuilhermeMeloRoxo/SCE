import type { Metadata } from 'next';
import '../styles/global.css';
import { Footer } from "@/components/Footer";
import { AlertProvider } from '@/context/AlertContext';

export const metadata: Metadata = {
    title: 'Mural - SCE',
    description: 'Mural de Notícias do Sistema de Controle de Egressos',
};

export default function Rootlayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-br">
            <body className="bg-white flex items-center sm:justify-center">
                <AlertProvider>
                    {children}
                    <Footer />
                </AlertProvider>
            </body>
        </html>
    );
}