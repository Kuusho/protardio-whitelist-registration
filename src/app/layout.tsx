import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Protardio Whitelist | Phase 1 Tier 3',
  description: '10,000 wartime farcaster pfps. Register for the Protardio Phase 1 Tier 3 allowlist.',
  openGraph: {
    title: 'Protardio Whitelist',
    description: '10,000 wartime farcaster pfps. Join the allowlist.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Protardio Whitelist',
    description: '10,000 wartime farcaster pfps. Join the allowlist.',
    images: ['/og-image.png'],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': '/og-image.png',
    'fc:frame:button:1': 'Register for Allowlist',
    'fc:frame:button:1:action': 'launch_frame',
    'fc:frame:button:1:target': process.env.NEXT_PUBLIC_APP_URL || '',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" 
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0a0a0a] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
