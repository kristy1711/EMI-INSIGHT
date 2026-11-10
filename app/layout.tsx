import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { UsuariosProvider } from '@/contexts/UsuariosContext';
import { FuentesProvider } from '@/contexts/FuentesContext';
import { PlnProvider } from '@/contexts/PlnContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'PercepciónEMI',
  description:
    'Sistema de identificación de factores de percepción institucional en redes sociales — EMI-UALP, Bolivia',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <UsuariosProvider>
            <FuentesProvider>
              <PlnProvider>
                {children}
                <Toaster position="top-right" richColors closeButton />
              </PlnProvider>
            </FuentesProvider>
          </UsuariosProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
