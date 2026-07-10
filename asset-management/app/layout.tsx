import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';

export const metadata = {
  title: 'AssetFlow | Master Your Infrastructure',
  description: 'Enterprise asset management for tracking, maintenance, and lifecycle operations.',
  icons: {
    icon: '/images/AssetFlow_logo-removebg-preview.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
