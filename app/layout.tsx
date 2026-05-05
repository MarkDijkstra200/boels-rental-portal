import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Boels Rental Portal — In-Store Self Service',
  description: 'Boels in-store rental portal for B2B and cash customers. Browse, quote, and rent construction equipment.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="%23FF6600"/><text y=".9em" font-size="80" font-weight="900" fill="white" font-family="Arial">B</text></svg>',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
