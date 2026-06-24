import type {Metadata} from 'next';
import { Cormorant_Garamond, Poppins } from 'next/font/google';
import './globals.css'; // Global styles

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Fantasy - Website Oficial',
  description: 'Website oficial do Fantasy.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${cormorantGaramond.variable} ${poppins.variable}`}>
      <body className="bg-[#080402] text-[#FFFFFF] font-sans antialiased selection:bg-[#FF6A00] selection:text-[#080402]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
