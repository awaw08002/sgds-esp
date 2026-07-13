'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import DemandeBadge from '@/components/DemandeBadge'
import { createClient } from '@/lib/supabase'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function ServiceStagesDashboard() {
  const [demandes, setDemandes] = useState<any[]>([])
  const [offres, setOffres] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'demandes' | 'offres'>('demandes')
  const [newOffre, setNewOffre] = useState({ titre: '', entreprise: '', description: '', niveauetude: 'L2' })
  const [showOffresForm, setShowOffresForm] = useState(false)
  const supabase = createClient()

  const load = async () => {
    const { data: { user: u } } = await supabase.auth.getUser()
    if (!u) return
    const { data: util } = await supabase.from('utilisateur').select('*').eq('id_utilisateur', u.id).single()
    setUser(util)
    const { data: dem } = await supabase
      .from('demande_stage')
      .select('*, etudiant(*, utilisateur(nom, prenom))')
      .eq('statut', 'validee')
      .order('datesoumission', { ascending: false })

    const { data: convs } = await supabase
      .from('convention_stage')
      .select('*')

    const demandesAvecConventions = (dem || []).map((d: any) => ({
      ...d,
      convention_stage: (convs || []).filter((c: any) => c.id_demande === d.id_demande)
    }))
    setDemandes(demandesAvecConventions)
    const { data: off } = await supabase.from('offre_stage').select('*').order('datepublication', { ascending: false })
    setOffres(off || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [genError, setGenError] = useState('')

  const genererConvention = async (demandeId: string, ref: string) => {
    setGeneratingId(demandeId)
    setGenError('')
    try {
      const res = await fetch('/api/conventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_demande: demandeId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la generation')
      await load()
      window.location.reload()
    } catch (e: any) {
      setGenError(e.message)
    }
    setGeneratingId(null)
  }

  const publierOffre = async () => {
    const { data: { user: u } } = await supabase.auth.getUser()
    await supabase.from('offre_stage').insert({
      ...newOffre,
      datepublication: new Date().toISOString(),
      active: true,
      id_utilisateur: u?.id,
    })
    setNewOffre({ titre: '', entreprise: '', description: '', niveauetude: ''})
    setShowOffresForm(false)
    load()
  }

  if (loading) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center"><div className="text-[#1E3A5F] font-semibold">Chargement...</div></div>

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {genError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">{genError}</div>
        )}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-3xl font-black text-[#1E3A5F]">Service des stages</h1>
            <p className="text-[#64748B] mt-1">Bonjour {user?.prenom} {user?.nom}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Demandes validees', value: demandes.length, color: 'text-[#1E3A5F]', bg: 'bg-blue-50', border: 'border-blue-100' },
            { label: 'Conventions generees', value: demandes.filter(d => d.convention_stage?.length > 0).length, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
            { label: 'Offres publiees', value: offres.filter(o => o.active).length, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} border ${s.border} rounded-2xl p-6`}>
              <div className={`text-4xl font-black ${s.color} mb-1`}>{s.value}</div>
              <div className="text-[#64748B] text-sm font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          {(['demandes', 'offres'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === tab ? 'bg-[#1E3A5F] text-white' : 'bg-white text-[#64748B] border border-slate-200 hover:border-[#1E3A5F]'}`}>
              {tab === 'demandes' ? 'Demandes validees' : 'Offres de stage'}
            </button>
          ))}
        </div>

        {activeTab === 'demandes' && (
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
            {demandes.length === 0 ? (
              <div className="text-center py-16 text-[#64748B]">Aucune demande validee pour le moment.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F8FAFC] border-b border-slate-100">
                    <tr>
                      {['Etudiant','Entreprise','Date validation','Convention','Actions'].map(h => (
                        <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {demandes.map((d, i) => (
                      <tr key={d.id_demande} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'}>
                        <td className="px-6 py-4 text-sm font-semibold text-[#1E293B]">{d.etudiant?.utilisateur?.prenom} {d.etudiant?.utilisateur?.nom}</td>
                        <td className="px-6 py-4 text-sm text-[#1E293B]">{d.entreprise}</td>
                        <td className="px-6 py-4 text-sm text-[#64748B]">{d.datedecision ? format(new Date(d.datedecision), 'dd MMM yyyy', {locale:fr}) : '—'}</td>
                        <td className="px-6 py-4">
                          {d.convention_stage?.length > 0
                            ? <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">{d.convention_stage[0].numeroconvention}</span>
                            : <span className="text-sm text-[#64748B]">Non generee</span>}
                        </td>
                        <td className="px-6 py-4">
                          {(!d.convention_stage || !Array.isArray(d.convention_stage) || d.convention_stage.length === 0) && (
                            <button onClick={() => genererConvention(d.id_demande, d.referenceunique)}
                              disabled={generatingId === d.id_demande}
                              className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors disabled:opacity-60">
                              {generatingId === d.id_demande ? 'Generation...' : 'Generer convention'}
                            </button>
                          )}
                          {Array.isArray(d.convention_stage) && d.convention_stage.length > 0 && (
                            <a href={`/api/conventions/download?path=${d.convention_stage[0].cheminfichierpdf}`}
                              target="_blank"
                              className="text-[#1E3A5F] hover:text-[#F59E0B] font-semibold text-xs transition-colors">
                              Telecharger
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'offres' && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={() => setShowOffresForm(!showOffresForm)}
                className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
                + Publier une offre
              </button>
            </div>
            {showOffresForm && (
              <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 mb-6">
                <h3 className="font-bold text-[#1E3A5F] mb-4">Nouvelle offre de stage</h3>
                <div className="space-y-4">
                  <div>
                    <label className="label">Titre</label>
                    <select className="input-field" value={newOffre.titre} onChange={e => setNewOffre(p => ({...p, titre: e.target.value}))}>
  <option value="">-- Selectionnez un titre --</option>
  <option>Stage Developpeur Web</option>
  <option>Stage Developpeur Mobile</option>
  <option>Stage Data Analyst</option>
  <option>Stage Ingenieur Reseaux</option>
  <option>Stage Cybersecurite</option>
  <option>Stage DevOps</option>
  <option>Stage Intelligence Artificielle</option>
  <option>Stage Genie Logiciel</option>
  <option>Stage Administrateur Systeme</option>
  <option>Stage UI/UX Designer</option>
  <option>Stage Chef de Projet IT</option>
  <option>Stage Support Technique</option>
</select>
                  </div>
                  <div>
  <label className="label">Entreprise</label>
  <select className="input-field" value={newOffre.entreprise} onChange={e => setNewOffre(p => ({...p, entreprise: e.target.value}))}>
    <option value="">-- Selectionnez une entreprise --</option>
    <option>Sonatel</option>
    <option>Orange Senegal</option>
    <option>Expresso Senegal</option>
    <option>Free Senegal</option>
    <option>CTIC Dakar</option>
    <option>Gainde 2000</option>
    <option>Volkeno</option>
    <option>Wave Mobile Money</option>
    <option>Wari</option>
    <option>InTouch</option>
    <option>La Poste Senegal</option>
    <option>Ecobank Senegal</option>
    <option>SGBS</option>
    <option>Total Energies Senegal</option>
    <option>Ageroute</option>
    <option>ADIE</option>
    <option>Autre</option>
  </select>
</div>
                  <div>
                    <label className="label">Description</label>
                    <textarea className="input-field resize-none" rows={3} value={newOffre.description} onChange={e => setNewOffre(p => ({...p, description: e.target.value}))} />
                  </div>
                <div>
  <label className="label">Niveau d'etudes requis</label>
  <select className="input-field" value={newOffre.niveauetude}
    onChange={e => setNewOffre(p => ({...p, niveauetude: e.target.value}))}>
    <option value="L1">L1</option>
    <option value="L2">L2</option>
    <option value="L3">L3</option>
    <option value="L2 ou plus">L2 ou plus</option>
    <option value="L3 ou plus">L3 ou plus</option>
    <option value="M1">M1</option>
    <option value="M2">M2</option>
    <option value="M1 ou M2">M1 ou M2</option>
    <option value="Tous niveaux">Tous niveaux</option>
  </select>
</div>
                  <button onClick={publierOffre} className="bg-[#1E3A5F] hover:bg-[#162d4a] text-white font-bold px-6 py-3 rounded-xl transition-colors">Publier</button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offres.map(o => (
                <div key={o.id_offre} className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-[#1E3A5F]">{o.titre}</h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${o.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{o.active ? 'Active' : 'Archivee'}</span>
                  </div>
                  <p className="text-[#64748B] text-sm font-medium mb-2">{o.entreprise}</p>
                  <p className="text-[#64748B] text-sm">{o.description}</p>
                  <p className="text-xs text-slate-400 mt-3">{format(new Date(o.datepublication), 'dd MMM yyyy', {locale:fr})}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
