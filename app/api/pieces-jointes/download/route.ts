import { NextResponse } from 'next/server'

function getAdminClient() {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path')

  if (!path) {
    return NextResponse.json({ error: 'Chemin manquant' }, { status: 400 })
  }

  const supabase = getAdminClient()
  const { data, error } = await supabase.storage.from('pieces-jointes').download(path)

  if (error || !data) {
    return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 })
  }

  const buffer = await data.arrayBuffer()

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${path.split('/').pop()}"`,
    },
  })
}