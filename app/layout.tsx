import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata = {
  title: "Sistema de Inventario TI",
  description: "Gestión profesional de inventario tecnológico",
  icons: {
    icon: '/logo-ti.jpg',
    apple: '/logo-ti.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
