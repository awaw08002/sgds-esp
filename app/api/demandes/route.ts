import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('demande_stage').select('*, etudiant(*, utilisateur(nom,prenom,email)), commentaire(*), convention_stage(*)').order('datesoumission', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const body = await req.json()
  const ref = 'DEM-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000)
  const { data, error } = await supabase.from('demande_stage').insert({ ...body, referenceunique: ref, statut: 'en_attente', datesoumission: new Date().toISOString() }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
