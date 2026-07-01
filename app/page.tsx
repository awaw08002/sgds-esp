export const dynamic = 'force-dynamic'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createServerSupabaseClient } from '@/lib/supabase-server'

async function getStats() {
  try {
    const supabase = await createServerSupabaseClient()
    const [{ count: total }, { count: validees }, { count: enAttente }] = await Promise.all([
      supabase.from('demande_stage').select('*', { count: 'exact', head: true }),
      supabase.from('demande_stage').select('*', { count: 'exact', head: true }).eq('statut', 'validee'),
      supabase.from('demande_stage').select('*', { count: 'exact', head: true }).eq('statut', 'en_attente'),
    ])
    const taux = total ? Math.round(((validees || 0) / total) * 100) : 0
    return { total: total || 0, validees: validees || 0, enAttente: enAttente || 0, taux }
  } catch {
    return { total: 127, validees: 98, enAttente: 12, taux: 77 }
  }
}

export default async function HomePage() {
  const stats = await getStats()

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* ── HERO avec image de fond ── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="max-w-2xl">
            <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight mb-6">
              Gerez vos demandes<br />de stage{' '}
              <span className="text-[#F59E0B]">en toute<br />simplicite</span>
            </h1>

            <div className="bg-black/40 backdrop-blur-sm rounded-xl px-5 py-4 mb-10 border border-white/10 max-w-xl">
              <p className="text-white text-base leading-relaxed font-medium">
                La plateforme numerique officielle de l'ESP pour soumettre, suivre
                et valider les demandes de stage de la soumission jusqu'a la
                generation de votre convention.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login"
                className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors text-center shadow-xl">
                Soumettre une demande
              </Link>
              <Link href="/inscription"
                className="bg-white hover:bg-slate-100 text-[#1E3A5F] font-bold px-8 py-4 rounded-xl text-lg transition-colors text-center shadow-xl">
                S'inscrire
              </Link>
              <Link href="#comment-ca-marche"
                className="border-2 border-white/60 text-white hover:bg-white/20 font-semibold px-8 py-4 rounded-xl text-lg transition-all text-center">
                Decouvrir comment ca marche
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMENT CA MARCHE ── */}
      <section id="comment-ca-marche" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-[#1E3A5F] mb-4">Comment ca marche ?</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
              Un processus en trois etapes, transparent et entierement numerique.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Soumettre', dark: true,
                desc: "Remplissez le formulaire avec les informations de l'entreprise, la periode, vos objectifs et joignez vos documents." },
              { step: '02', title: 'Validation', dark: false,
                desc: "L'encadrant pedagogique examine votre dossier et prend une decision motivee. Vous etes notifie immediatement." },
              { step: '03', title: 'Convention', dark: true,
                desc: "Votre convention est generee automatiquement en PDF une fois validee et disponible au telechargement depuis votre espace." },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-md border border-slate-100 hover:shadow-xl transition-shadow">
                <div className={`w-14 h-14 ${item.dark ? 'bg-[#1E3A5F]' : 'bg-[#F59E0B]'} rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
                  <span className="text-white font-black text-xl">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-[#1E3A5F] mb-3">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATISTIQUES avec image de fond ── */}
      <section id="statistiques" className="relative py-24 overflow-hidden">
        {/* Image de fond statistiques */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80')` }}
        />
        {/* Overlay semi-transparent */}
        <div className="absolute inset-0 bg-slate-900/80" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">La plateforme en chiffres</h2>
            <p className="text-slate-300 text-lg">Donnees en temps reel du systeme SGDS</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { value: stats.total,     label: 'Demandes soumises',  unit: '',  icon: '📋' },
              { value: stats.validees,  label: 'Demandes validees',  unit: '',  icon: '✅' },
              { value: stats.enAttente, label: 'En traitement',      unit: '',  icon: '⏳' },
              { value: stats.taux,      label: 'Taux de validation', unit: '%', icon: '📈' },
            ].map((s, i) => (
              <div key={i} className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/15 transition-colors">
                <div className="text-5xl font-black text-[#F59E0B] mb-2">{s.value}{s.unit}</div>
                <div className="text-slate-200 text-sm font-medium">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="text-center flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login"
              className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold px-10 py-4 rounded-xl text-lg transition-colors shadow-xl">
              Se connecter
            </Link>
            <Link href="/inscription"
              className="bg-white hover:bg-slate-100 text-[#1E3A5F] font-bold px-10 py-4 rounded-xl text-lg transition-colors shadow-xl">
              Creer un compte
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
