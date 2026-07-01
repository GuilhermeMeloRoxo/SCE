import type { Metadata } from 'next';
import '../styles/global.css';
import { Footer } from "@/components/Footer";
import { AlertProvider } from '@/context/AlertContext';
import { ReactQueryProvider } from '@/components/ReactQueryProvider';

export const metadata: Metadata = {
    title: {
        default: 'SCE',
        template: '%s | SCE'
    },
    description: 'Mural de Notícias do Sistema de Controle de Egressos',
};

export default function Rootlayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-br">
            <body className="bg-slate-200 flex sm:justify-center">
                <AlertProvider>
                    <ReactQueryProvider>
                        {children}
                    </ReactQueryProvider>
                    <Footer />
                </AlertProvider>
            </body>
        </html>
    );
}