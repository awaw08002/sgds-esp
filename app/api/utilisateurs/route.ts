import { NextResponse } from 'next/server'

function getAdminClient() {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET() {
  const supabase = getAdminClient()
  const { data, error } = await supabase.from('utilisateur').select('*').order('datecreation', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  try {
    const supabase = getAdminClient()
    const { nom, prenom, email, role, password } = await req.json()
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true
    })
    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

    const { data: util, error: dbError } = await supabase.from('utilisateur').insert({
      id_utilisateur: authData.user.id,
      nom, prenom, email, role, actif: true,
      motdepasse: 'hashed',
      datecreation: new Date().toISOString(),
    }).select().single()
    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

    if (role === 'etudiant') {
      await supabase.from('etudiant').insert({ id_utilisateur: authData.user.id, matricule: 'MAT-' + Date.now(), filiere: 'GLSI', niveau: 'L2' })
    } else if (role === 'encadrant') {
      await supabase.from('encadrant').insert({ id_utilisateur: authData.user.id, departement: 'Genie Informatique' })
    }

    return NextResponse.json(util, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const supabase = getAdminClient()
  const { id, actif } = await req.json()
  const { data, error } = await supabase.from('utilisateur').update({ actif }).eq('id_utilisateur', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
