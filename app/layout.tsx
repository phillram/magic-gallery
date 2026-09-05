import type { Metadata } from 'next';
import { Inter, Spectral } from 'next/font/google';
import Header from '@/components/Header';
import './globals.css';

// Card names are printed in a serif, so names and headings are set in one here. It
// keeps its lowercase, which a roman capital face would take away from every card
// name on the page.
const display = Spectral({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Magic Card Browser',
    template: '%s · Magic Card Browser',
  },
  description:
    'Search every paper Magic: The Gathering card by name, set, color, type, rarity, and mana value.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen">
        {/* The first stop for a keyboard, so the header does not have to be walked
            through on every page. */}
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-md focus:bg-gold-400 focus:px-4 focus:py-2 focus:font-semibold focus:text-ink-950"
        >
          Skip to content
        </a>
        <Header />
        <main id="content" className="mx-auto max-w-[104rem] px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
