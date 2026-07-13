'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import DemandeBadge from '@/components/DemandeBadge'
import { createClient } from '@/lib/supabase'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function EncadrantDashboard() {
  const [demandes, setDemandes] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'en_attente' | 'toutes'>('en_attente')
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) return
      const { data: util } = await supabase.from('utilisateur').select('*, encadrant(id_encadrant)').eq('id_utilisateur', u.id).single()
      setUser(util)
      const { data } = await supabase
        .from('demande_stage')
        .select('*, etudiant(*, utilisateur(nom, prenom, email))')
        .order('datesoumission', { ascending: false })
      setDemandes(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = activeTab === 'en_attente' ? demandes.filter(d => d.statut === 'en_attente') : demandes

  if (loading) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center"><div className="text-[#1E3A5F] font-semibold">Chargement...</div></div>

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-[#1E3A5F]">Tableau de bord encadrant</h1>
          <p className="text-[#64748B] mt-1">Bonjour {user?.prenom} {user?.nom} {user?.encadrant?.departement}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: demandes.length, color: 'text-[#1E3A5F]', bg: 'bg-blue-50', border: 'border-blue-100' },
            { label: 'En attente', value: demandes.filter(d => d.statut === 'en_attente').length, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
            { label: 'Validees', value: demandes.filter(d => d.statut === 'validee').length, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
            { label: 'Rejetees', value: demandes.filter(d => d.statut === 'rejetee').length, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} border ${s.border} rounded-2xl p-6`}>
              <div className={`text-4xl font-black ${s.color} mb-1`}>{s.value}</div>
              <div className="text-[#64748B] text-sm font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          {(['en_attente', 'toutes'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === tab ? 'bg-[#1E3A5F] text-white' : 'bg-white text-[#64748B] border border-slate-200 hover:border-[#1E3A5F]'}`}>
              {tab === 'en_attente' ? 'En attente de validation' : 'Toutes les demandes'}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#64748B] font-medium">Aucune demande {activeTab === 'en_attente' ? 'en attente' : ''}.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8FAFC] border-b border-slate-100">
                  <tr>
                    {['Etudiant','Entreprise','Date soumission','Statut','Actions'].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((d, i) => (
                    <tr key={d.id_demande} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'}>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-sm text-[#1E293B]">
                          {d.etudiant?.utilisateur?.prenom} {d.etudiant?.utilisateur?.nom}
                        </div>
                        <div className="text-xs text-[#64748B]">{d.etudiant?.utilisateur?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-[#1E293B]">{d.entreprise}</td>
                      <td className="px-6 py-4 text-sm text-[#64748B]">
                        {format(new Date(d.datesoumission), 'dd MMM yyyy', { locale: fr })}
                      </td>
                      <td className="px-6 py-4"><DemandeBadge statut={d.statut} /></td>
                      <td className="px-6 py-4">
                        <Link href={'/encadrant/demandes/' + d.id_demande}
                          className="text-[#F59E0B] hover:text-[#D97706] font-semibold text-sm transition-colors">
                          {d.statut === 'en_attente' ? 'Examiner' : 'Voir detail'}
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
