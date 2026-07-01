'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import DemandeBadge from '@/components/DemandeBadge'
import { createClient } from '@/lib/supabase'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function EtudiantDashboard() {
  const [demandes, setDemandes] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) return
      const { data: util } = await supabase.from('utilisateur').select('*, etudiant(id_etudiant)').eq('id_utilisateur', u.id).single()
      setUser(util)
      if (util?.etudiant?.id_etudiant) {
        const { data } = await supabase
          .from('demande_stage')
          .select('*, commentaire(*), convention_stage(*)')
          .eq('id_etudiant', util.etudiant.id_etudiant)
          .order('datesoumission', { ascending: false })
        setDemandes(data || [])
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const stats = {
    total: demandes.length,
    enAttente: demandes.filter(d => d.statut === 'en_attente').length,
    validees: demandes.filter(d => d.statut === 'validee').length,
    rejetees: demandes.filter(d => d.statut === 'rejetee').length,
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="text-[#1E3A5F] font-semibold">Chargement...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-[#1E3A5F]">
              Bonjour, {user?.prenom} {user?.nom}
            </h1>
            <p className="text-[#64748B] mt-1">Tableau de bord etudiant</p>
          </div>
          <Link href="/etudiant/nouvelle-demande"
            className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold px-6 py-3 rounded-xl transition-colors">
            + Nouvelle demande
          </Link>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total demandes', value: stats.total, color: 'text-[#1E3A5F]', bg: 'bg-blue-50', border: 'border-blue-100' },
            { label: 'En attente', value: stats.enAttente, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
            { label: 'Validees', value: stats.validees, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
            { label: 'Rejetees', value: stats.rejetees, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} border ${s.border} rounded-2xl p-6`}>
              <div className={`text-4xl font-black ${s.color} mb-1`}>{s.value}</div>
              <div className="text-[#64748B] text-sm font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tableau des demandes */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#1E3A5F]">Mes demandes de stage</h2>
            <span className="text-sm text-[#64748B]">{demandes.length} demande(s)</span>
          </div>

          {demandes.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">-</div>
              <h3 className="text-lg font-bold text-[#1E3A5F] mb-2">Aucune demande</h3>
              <p className="text-[#64748B] mb-6 text-sm">Vous n'avez pas encore soumis de demande de stage.</p>
              <Link href="/etudiant/nouvelle-demande" className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold px-6 py-3 rounded-xl transition-colors">
                Soumettre ma premiere demande
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8FAFC] border-b border-slate-100">
                  <tr>
                    {['Reference','Entreprise','Date soumission','Statut','Actions'].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {demandes.map((d, i) => (
                    <tr key={d.id_demande} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'}>
                      <td className="px-6 py-4 text-sm font-mono font-medium text-[#1E3A5F]">{d.referenceunique}</td>
                      <td className="px-6 py-4 text-sm text-[#1E293B] font-medium">{d.entreprise}</td>
                      <td className="px-6 py-4 text-sm text-[#64748B]">
                        {format(new Date(d.datesoumission), 'dd MMM yyyy', { locale: fr })}
                      </td>
                      <td className="px-6 py-4"><DemandeBadge statut={d.statut} /></td>
                      <td className="px-6 py-4">
                        <Link href={'/etudiant/demandes/' + d.id_demande}
                          className="text-[#F59E0B] hover:text-[#D97706] font-semibold text-sm transition-colors">
                          Voir le detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
