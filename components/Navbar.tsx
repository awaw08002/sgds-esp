'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import NotificationBell from './NotificationBell'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Detecter le scroll pour changer le style de la navbar sur l'accueil
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      if (u) {
        setUser(u)
        const { data } = await supabase
          .from('utilisateur')
          .select('role, nom, prenom')
          .eq('id_utilisateur', u.id)
          .single()
        if (data) setRole(data.role)
      }
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const dashboardLink = () => {
    switch (role) {
      case 'etudiant':       return '/etudiant/dashboard'
      case 'encadrant':      return '/encadrant/dashboard'
      case 'service_stages': return '/service-stages/dashboard'
      case 'administrateur': return '/admin/dashboard'
      default:               return '/'
    }
  }

  const isHome = pathname === '/'

  // Sur l'accueil : transparent en haut, blanc après scroll
  // Sur les autres pages : toujours blanc
  const navBg = isHome
    ? scrolled ? 'bg-white shadow-md' : 'bg-transparent'
    : 'bg-white shadow-sm border-b border-slate-100'

  const textColor    = (isHome && !scrolled) ? 'text-white'        : 'text-[#1E293B]'
  const subTextColor = (isHome && !scrolled) ? 'text-white/70'     : 'text-[#64748B]'
  const linkColor    = (isHome && !scrolled) ? 'text-white/90 hover:text-white' : 'text-[#64748B] hover:text-[#1E3A5F]'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#F59E0B] rounded-lg flex items-center justify-center flex-shrink-0 shadow">
              <span className="text-white font-black text-sm">G</span>
            </div>
            <div className="leading-tight">
              <span className={`font-bold text-base block leading-none transition-colors ${textColor}`}>
                Gestion des Demandes de Stages
              </span>
            </div>
          </Link>

          {/* Navigation desktop */}
          <div className="hidden md:flex items-center gap-7">
            {!user && (
              <>
                <Link href="/#comment-ca-marche" className={`text-sm font-medium transition-colors ${linkColor}`}>
                  Comment ca marche
                </Link>
                <Link href="/#statistiques" className={`text-sm font-medium transition-colors ${linkColor}`}>
                  Statistiques
                </Link>
                <Link href="/offres" className={`text-sm font-medium transition-colors ${linkColor}`}>
                  Offres de stage
                </Link>
              </>
            )}
            {user && (
              <>
                <Link href={dashboardLink()} className={`text-sm font-medium transition-colors ${linkColor}`}>
                  Tableau de bord
                </Link>
                {role === 'etudiant' && (
                  <>
                    <Link href="/etudiant/nouvelle-demande" className={`text-sm font-medium transition-colors ${linkColor}`}>
                      Nouvelle demande
                    </Link>
                    <Link href="/offres" className={`text-sm font-medium transition-colors ${linkColor}`}>
                      Offres
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Actions droite */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <NotificationBell userId={user.id} />
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className={`text-sm font-medium transition-colors ${linkColor}`}
                >
                  Deconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`text-sm font-semibold transition-colors ${linkColor}`}
                >
                  Se connecter
                </Link>
                <Link
                  href="/inscription"
                  className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors shadow"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          {/* Burger mobile */}
          <button
            className={`md:hidden transition-colors ${textColor}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 py-4 space-y-1 shadow-lg rounded-b-xl">
            {!user ? (
              <>
                <Link href="/#comment-ca-marche" className="block px-4 py-2 text-[#64748B] hover:text-[#1E3A5F] hover:bg-slate-50 rounded-lg text-sm font-medium">
                  Comment ca marche
                </Link>
                <Link href="/offres" className="block px-4 py-2 text-[#64748B] hover:text-[#1E3A5F] hover:bg-slate-50 rounded-lg text-sm font-medium">
                  Offres de stage
                </Link>
                <div className="border-t border-slate-100 pt-3 mt-3 flex flex-col gap-2 px-4">
                  <Link href="/login" className="block border border-slate-200 text-[#1E3A5F] font-semibold py-2.5 rounded-xl text-sm text-center hover:bg-slate-50 transition-colors">
                    Se connecter
                  </Link>
                  <Link href="/inscription" className="block bg-[#F59E0B] text-white font-bold py-2.5 rounded-xl text-sm text-center hover:bg-[#D97706] transition-colors">
                    S'inscrire
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Link href={dashboardLink()} className="block px-4 py-2 text-[#64748B] hover:text-[#1E3A5F] rounded-lg text-sm font-medium">
                  Tableau de bord
                </Link>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="block w-full text-left px-4 py-2 text-[#64748B] hover:text-[#1E3A5F] hover:bg-slate-50 rounded-lg text-sm font-medium"
                >
                  Deconnexion
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmation de déconnexion */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-[#1E3A5F] mb-2">Deconnexion</h3>
            <p className="text-[#64748B] text-sm mb-6">
              Voulez-vous vraiment vous deconnecter de votre espace SGDS ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 border-2 border-slate-200 text-[#64748B] font-semibold py-3 rounded-xl hover:border-[#1E3A5F] hover:text-[#1E3A5F] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Se deconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}