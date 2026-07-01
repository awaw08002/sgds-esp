import { createClient } from './supabase'

export type UserRole = 'etudiant' | 'encadrant' | 'service_stages' | 'administrateur'

export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: utilisateur } = await supabase
    .from('utilisateur')
    .select('*')
    .eq('id_utilisateur', user.id)
    .single()

  return utilisateur
}

export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'etudiant': return '/etudiant/dashboard'
    case 'encadrant': return '/encadrant/dashboard'
    case 'service_stages': return '/service-stages/dashboard'
    case 'administrateur': return '/admin/dashboard'
    default: return '/login'
  }
}
