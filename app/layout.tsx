import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SGDS — Systeme de Gestion des Demandes de Stage | ESP UCAD',
  description: 'Plateforme de gestion des stages de l ESP UCAD.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body style={{fontFamily: 'Inter, system-ui, sans-serif'}}>{children}</body>
    </html>
  )
}
