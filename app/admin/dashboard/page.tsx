'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import DemandeBadge from '@/components/DemandeBadge'
import { createClient } from '@/lib/supabase'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const ROLES = ['etudiant','encadrant','service_stages','administrateur'] as const
type Role = typeof ROLES[number]

export default function AdminDashboard() {
  const [utilisateurs, setUtilisateurs] = useState<any[]>([])
  const [demandes, setDemandes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'stats' | 'users'>('stats')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newUser, setNewUser] = useState({ nom: '', prenom: '', email: '', role: 'etudiant' as Role, password: '' })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [showAdminPassword, setShowAdminPassword] = useState(false)
  const supabase = createClient()

  const load = async () => {
    const [{ data: users }, { data: dem }] = await Promise.all([
      supabase.from('utilisateur').select('*').order('datecreation', { ascending: false }),
      supabase.from('demande_stage').select('*').order('datesoumission', { ascending: false }),
    ])
    setUtilisateurs(users || [])
    setDemandes(dem || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggleActif = async (id: string, actif: boolean) => {
    await supabase.from('utilisateur').update({ actif: !actif }).eq('id_utilisateur', id)
    load()
  }

  const createUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.nom) return
    setCreating(true)
    setError('')
    try {
      const res = await fetch('/api/utilisateurs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setNewUser({ nom: '', prenom: '', email: '', role: 'etudiant', password: '' })
      setShowCreateForm(false)
      load()
    } catch (e: any) {
      setError(e.message)
    }
    setCreating(false)
  }

  const stats = {
    total: utilisateurs.length,
    etudiants: utilisateurs.filter(u => u.role === 'etudiant').length,
    encadrants: utilisateurs.filter(u => u.role === 'encadrant').length,
    actifs: utilisateurs.filter(u => u.actif).length,
    demandes: demandes.length,
    validees: demandes.filter(d => d.statut === 'validee').length,
    enAttente: demandes.filter(d => d.statut === 'en_attente').length,
    rejetees: demandes.filter(d => d.statut === 'rejetee').length,
  }

  if (loading) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center"><div className="text-[#1E3A5F] font-semibold">Chargement...</div></div>

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-[#1E3A5F]">Administration</h1>
          <p className="text-[#64748B] mt-1">Gestion globale du systeme SGDS</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          {(['stats','users'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === tab ? 'bg-[#1E3A5F] text-white' : 'bg-white text-[#64748B] border border-slate-200 hover:border-[#1E3A5F]'}`}>
              {tab === 'stats' ? 'Statistiques' : 'Utilisateurs'}
            </button>
          ))}
        </div>

        {activeTab === 'stats' && (
          <div>
            <h2 className="text-xl font-bold text-[#1E3A5F] mb-6">Vue d'ensemble</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total utilisateurs', value: stats.total, color: 'text-[#1E3A5F]', bg: 'bg-blue-50', border: 'border-blue-100' },
                { label: 'Etudiants', value: stats.etudiants, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
                { label: 'Encadrants', value: stats.encadrants, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
                { label: 'Comptes actifs', value: stats.actifs, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
              ].map((s, i) => (
                <div key={i} className={`${s.bg} border ${s.border} rounded-2xl p-6`}>
                  <div className={`text-4xl font-black ${s.color} mb-1`}>{s.value}</div>
                  <div className="text-[#64748B] text-sm font-medium">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total demandes', value: stats.demandes, color: 'text-[#1E3A5F]', bg: 'bg-slate-50', border: 'border-slate-100' },
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
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#1E3A5F]">Gestion des utilisateurs</h2>
              <button onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
                + Creer un utilisateur
              </button>
            </div>

            {showCreateForm && (
              <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 mb-6">
                <h3 className="font-bold text-[#1E3A5F] mb-4">Nouveau compte utilisateur</h3>
                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Prenom</label>
                    <input className="input-field" value={newUser.prenom} onChange={e => setNewUser(p=>({...p,prenom:e.target.value}))} placeholder="Prenom" />
                  </div>
                  <div>
                    <label className="label">Nom</label>
                    <input className="input-field" value={newUser.nom} onChange={e => setNewUser(p=>({...p,nom:e.target.value}))} placeholder="Nom" required />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input type="email" className="input-field" value={newUser.email} onChange={e => setNewUser(p=>({...p,email:e.target.value}))} placeholder="email@esp.sn" required />
                  </div>
                  <div>
                    <label className="label">Mot de passe</label>
                    <div className="relative">
  <input type={showAdminPassword ? 'text' : 'password'} className="input-field pr-12" value={newUser.password} onChange={e => setNewUser(p=>({...p,password:e.target.value}))} placeholder="Minimum 8 caracteres" required />
  <button type="button" onClick={() => setShowAdminPassword(!showAdminPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabIndex={-1}>
    {showAdminPassword ? (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
      </svg>
    ) : (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    )}
  </button>
</div>
                  </div>
                  <div>
                    <label className="label">Role</label>
                    <select className="input-field" value={newUser.role} onChange={e => setNewUser(p=>({...p,role:e.target.value as Role}))}>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setShowCreateForm(false)} className="border-2 border-slate-200 text-[#64748B] font-semibold px-5 py-2.5 rounded-xl hover:border-[#1E3A5F] transition-colors text-sm">Annuler</button>
                  <button onClick={createUser} disabled={creating} className="bg-[#1E3A5F] hover:bg-[#162d4a] text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm disabled:opacity-60">
                    {creating ? 'Creation...' : 'Creer le compte'}
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F8FAFC] border-b border-slate-100">
                    <tr>
                      {['Utilisateur','Email','Role','Statut','Inscription','Actions'].map(h => (
                        <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {utilisateurs.map((u, i) => (
                      <tr key={u.id_utilisateur} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'}>
                        <td className="px-6 py-4 text-sm font-semibold text-[#1E293B]">{u.prenom} {u.nom}</td>
                        <td className="px-6 py-4 text-sm text-[#64748B]">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#1E3A5F]/10 text-[#1E3A5F]">{u.role}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {u.actif ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#64748B]">
                          {u.datecreation ? format(new Date(u.datecreation), 'dd MMM yyyy', {locale:fr}) : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => toggleActif(u.id_utilisateur, u.actif)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${u.actif ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                            {u.actif ? 'Desactiver' : 'Activer'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
