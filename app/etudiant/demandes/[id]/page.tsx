'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import DemandeBadge from '@/components/DemandeBadge'
import { createClient } from '@/lib/supabase'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function DemandeDetailPage() {
  const { id } = useParams()
  const [demande, setDemande] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('demande_stage')
        .select('*, commentaire(*), piece_jointe(*)')
        .eq('id_demande', id)
        .single()

      const { data: conv } = await supabase
        .from('convention_stage')
        .select('*')
        .eq('id_demande', id)

      setDemande({ ...data, convention_stage: conv || [] })
      setLoading(false)
    }
    load()
  }, [id])

  const downloadConvention = () => {
    const path = demande?.convention_stage?.[0]?.cheminfichierpdf
    if (!path) return
    window.open(`/api/conventions/download?path=${path}`, '_blank')
  }

  if (loading) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center"><div className="text-[#1E3A5F] font-semibold">Chargement...</div></div>
  if (!demande) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center"><div className="text-red-600">Demande introuvable.</div></div>

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <div className="mb-8">
          <Link href="/etudiant/dashboard" className="text-[#64748B] hover:text-[#1E3A5F] text-sm font-medium transition-colors">
            Retour au tableau de bord
          </Link>
          <div className="flex items-center gap-4 mt-4">
            <h1 className="text-3xl font-black text-[#1E3A5F]">Demande #{demande.referenceunique}</h1>
            <DemandeBadge statut={demande.statut} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-[#1E3A5F] mb-4">Informations du stage</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ['Entreprise', demande.entreprise],
                  ['Adresse', demande.adresseentreprise || 'Non precisee'],
                  ['Date de debut', format(new Date(demande.datedebut), 'dd MMMM yyyy', { locale: fr })],
                  ['Date de fin', format(new Date(demande.datefin), 'dd MMMM yyyy', { locale: fr })],
                  ['Date de soumission', format(new Date(demande.datesoumission), 'dd MMMM yyyy', { locale: fr })],
                  ['Statut', demande.statut],
                ].map(([label, value], i) => (
                  <div key={i}>
                    <dt className="text-[#64748B] font-medium mb-1">{label}</dt>
                    <dd className="text-[#1E293B] font-semibold">{value}</dd>
                  </div>
                ))}
              </div>
              {demande.objectifsstage && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <dt className="text-[#64748B] font-medium text-sm mb-2">Objectifs du stage</dt>
                  <dd className="text-[#1E293B] text-sm leading-relaxed">{demande.objectifsstage}</dd>
                </div>
              )}
            </div>

            {demande.commentaire?.length > 0 && (
              <div className={`rounded-2xl p-6 border ${demande.statut === 'rejetee' ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                <h2 className="text-lg font-bold text-[#1E3A5F] mb-3">Commentaire de l'encadrant</h2>
                {demande.commentaire.map((c: any) => (
                  <div key={c.id_commentaire}>
                    <p className="text-[#1E293B] text-sm leading-relaxed">{c.contenu}</p>
                    <p className="text-[#64748B] text-xs mt-2">
                      {format(new Date(c.datecreation), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {demande.statut === 'validee' && demande.convention_stage?.length > 0 && (
              <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
                <h3 className="font-bold text-green-800 mb-3">Convention disponible</h3>
                <p className="text-green-700 text-sm mb-4">Votre convention a ete generee. Vous pouvez la telecharger.</p>
                <p className="text-xs text-green-600 mb-4 font-mono">{demande.convention_stage[0].numeroconvention}</p>
                <button onClick={downloadConvention}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors text-sm">
                  Telecharger la convention
                </button>
              </div>
            )}

            {demande.piece_jointe?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
                <h3 className="font-bold text-[#1E3A5F] mb-3">Pieces jointes</h3>
                <ul className="space-y-2">
                  {demande.piece_jointe.map((p: any) => (
                    <li key={p.id_piece} className="flex items-center gap-3 text-sm text-[#64748B]">
                      <span className="w-2 h-2 rounded-full bg-[#F59E0B] flex-shrink-0"></span>
                      {p.nomfichier}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
              <h3 className="font-bold text-[#1E3A5F] mb-3">Actions</h3>
              {demande.statut === 'en_attente' && (
                <Link href={'/etudiant/demandes/' + demande.id_demande + '/modifier'}
                  className="w-full border-2 border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white font-semibold py-3 rounded-xl transition-colors text-sm text-center block">
                  Modifier la demande
                </Link>
              )}
              <Link href="/etudiant/dashboard"
                className="w-full mt-3 text-[#64748B] hover:text-[#1E3A5F] font-semibold py-2 text-sm text-center block transition-colors">
                Retour au tableau de bord
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
