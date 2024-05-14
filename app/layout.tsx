import '@/app/ui/global.css';

import { Metadata } from 'next';
import { inter } from '@/app/ui/fonts';

export const metadata: Metadata = {
  title: {
    template: '%s | Acme Dashboard',
    default: 'Acme Dashboard',
  },
  description:
    'The official Next.js Course Dashboard, built with App Router and Prisma.',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh')
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
