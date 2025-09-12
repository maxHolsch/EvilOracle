import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Malevolent Oracle - ElevenLabs Agent Chat',
  description: 'A dark and evil-themed chat interface for ElevenLabs AI agents',
  keywords: 'ElevenLabs, AI, Chat, Voice, Agent, Dark Theme',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Creepster&family=Nosifer&family=Metal+Mania:wght@400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}