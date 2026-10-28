import "./globals.css"
import Providers from "@/providers/Providers";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const heading = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata = {
  title: {
    template: '%s | eWasteMart',
    default: 'eWasteMart - Responsible E-Waste Management',
  },
  description: 'A role-based marketplace for responsible e-waste management. Connect with verified recyclers, get AI smart estimates, and schedule secure pickups.',
  keywords: ['e-waste', 'recycling', 'sustainability', 'marketplace', 'scrap', 'electronics recycling', 'India'],
  authors: [{ name: 'eWasteMart Team' }],
  creator: 'eWasteMart',
  publisher: 'eWasteMart',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'eWasteMart',
    description: 'A role-based marketplace for responsible e-waste management.',
    url: 'https://ewastemart.com',
    siteName: 'eWasteMart',
    images: [
      {
        url: 'https://ewastemart.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'eWasteMart Preview',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'eWasteMart',
    description: 'Responsible e-waste management marketplace.',
    images: ['https://ewastemart.com/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${heading.variable}`} suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
