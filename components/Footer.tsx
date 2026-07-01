import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-[#F59E0B] rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">G</span>
              </div>
              <span className="text-white font-bold text-base leading-tight">
                Gestion des Demandes<br />de Stages
              </span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Plateforme numerique officielle de l'Ecole Superieure
              Polytechnique de l'Universite Cheikh Anta Diop de Dakar.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link href="/" className="hover:text-white transition-colors">Accueil</Link></li>
              <li><Link href="/offres" className="hover:text-white transition-colors">Offres de stage</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Se connecter</Link></li>
              <li><Link href="/inscription" className="hover:text-white transition-colors">S'inscrire</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>Ecole Superieure Polytechnique</li>
              <li>Universite Cheikh Anta Diop</li>
              <li>Dakar, Senegal</li>
              <li className="mt-3">
                <a href="mailto:stages@esp.sn" className="hover:text-white transition-colors">stages@esp.sn</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} Gestion des Demandes de Stages. Tous droits reserves.
          </p>
          <p className="text-slate-500 text-xs">
            Ecole Superieur Polytechnique de Dakar 
          </p>
        </div>
      </div>
    </footer>
  )
}
