export const dynamic = 'force-dynamic'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

async function getOffres() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offre_stage?active=eq.true&order=datepublication.desc`,
      {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        },
        cache: 'no-store',
      }
    )
    if (!res.ok) return []
    return await res.json()
  } catch (e) {
    console.error(e)
    return []
  }
}

export default async function OffresPage() {
  const offres = await getOffres()
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 flex-1">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-[#1E3A5F] mb-3">Offres de stage</h1>
          <p className="text-[#64748B] text-lg">Decouvrez les opportunites de stage disponibles publiees par le service des stages de l'ESP.</p>
        </div>
        {offres.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-md">
            <h3 className="text-xl font-bold text-[#1E3A5F] mb-3">Aucune offre disponible</h3>
            <p className="text-[#64748B]">Revenez bientot pour consulter les prochaines offres.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offres.map(o => (
              <div key={o.id_offre} className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-[#1E3A5F]/10 rounded-xl flex items-center justify-center">
                    <span className="text-[#1E3A5F] font-black text-lg">{o.entreprise?.[0] || 'S'}</span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">Active</span>
                </div>
                <h3 className="text-lg font-bold text-[#1E3A5F] mb-1">{o.titre}</h3>
                <p className="text-[#F59E0B] font-semibold text-sm mb-3">{o.entreprise}</p>
                {o.description && <p className="text-[#64748B] text-sm leading-relaxed mb-4 line-clamp-3">{o.description}</p>}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400">{format(new Date(o.datePublication), 'dd MMM yyyy', {locale:fr})}</p>
                  <a href="/login" className="text-[#F59E0B] hover:text-[#D97706] font-semibold text-sm transition-colors">Postuler</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
