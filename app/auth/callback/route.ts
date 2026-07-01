import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Verifier si l'utilisateur existe deja dans notre table
      const { data: util } = await supabase
        .from('utilisateur')
        .select('role')
        .eq('id_utilisateur', data.user.id)
        .single()

      if (util?.role) {
        const roleMap: Record<string, string> = {
          etudiant: '/etudiant/dashboard',
          encadrant: '/encadrant/dashboard',
          service_stages: '/service-stages/dashboard',
          administrateur: '/admin/dashboard',
        }
        return NextResponse.redirect(new URL(roleMap[util.role] || '/', origin))
      }

      // Extraire le nom/prenom depuis les metadonnees Google
      // Google fournit : full_name, name, given_name, family_name, picture, avatar_url
      const meta = data.user.user_metadata || {}
      const fullName = meta.full_name || meta.name || ''
      const prenom = meta.given_name || fullName.split(' ')[0] || 'Utilisateur'
      const nom = meta.family_name || fullName.split(' ').slice(1).join(' ') || ''

      // Si pas de profil, creer un profil etudiant par defaut
      await supabase.from('utilisateur').insert({
        id_utilisateur: data.user.id,
        nom: nom || 'Google',
        prenom: prenom,
        email: data.user.email || '',
        motdepasse: '',
        role: 'etudiant',
        actif: true,
        datecreation: new Date().toISOString(),
      })
      await supabase.from('etudiant').insert({
        id_utilisateur: data.user.id,
        matricule: 'G-' + Date.now(),
        filiere: 'GLSI',
        niveau: 'L2',
      })
      return NextResponse.redirect(new URL('/etudiant/dashboard', origin))
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth', origin))
}
