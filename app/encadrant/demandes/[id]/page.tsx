'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import DemandeBadge from '@/components/DemandeBadge'
import { createClient } from '@/lib/supabase'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function EncadrantValidationPage() {
  const { id } = useParams()
  const [demande, setDemande] = useState<any>(null)
  const [commentaire, setCommentaire] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [encadrantId, setEncadrantId] = useState('')
  const [encadrantUserId, setEncadrantUserId] = useState('')
  const [confirmation, setConfirmation] = useState<'valider' | 'rejeter' | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setEncadrantUserId(user.id)
        const { data: enc } = await supabase.from('encadrant').select('id_encadrant').eq('id_utilisateur', user.id).single()
        if (enc) setEncadrantId(enc.id_encadrant)
      }
      const { data } = await supabase
        .from('demande_stage')
        .select('*, etudiant(*, utilisateur(nom, prenom, email)), commentaire(*), piece_jointe(*)')
        .eq('id_demande', id)
        .single()
      setDemande(data)
      setLoading(false)
    }
    load()
  }, [id])

  const handleDecision = async (decision: 'validee' | 'rejetee') => {
    setSubmitting(true)
    try {
      await supabase.from('demande_stage').update({ statut: decision, datedecision: new Date().toISOString(), id_encadrant: encadrantId }).eq('id_demande', id)

      if (commentaire.trim()) {
        await supabase.from('commentaire').insert({ contenu: commentaire, datecreation: new Date().toISOString(), id_demande: id, id_encadrant: encadrantId })
      }

      // Notifier etudiant
      const etudiantUserId = demande?.etudiant?.id_utilisateur
      if (etudiantUserId) {
        const msg = decision === 'validee'
          ? 'Votre demande ' + demande.referenceunique + ' a ete validee. Vous pouvez telecharger votre convention.'
          : 'Votre demande ' + demande.referenceunique + ' a ete rejetee. Consultez le commentaire de l encadrant.'
        await supabase.from('notification').insert({
          message: msg,
          type: decision === 'validee' ? 'DEMANDE_VALIDEE' : 'DEMANDE_REJETEE',
          lue: false,
          dateenvoi: new Date().toISOString(),
          id_utilisateur: etudiantUserId,
        })
      }

      // Generer convention si validee
      if (decision === 'validee') {
        const numConv = 'CONV-' + new Date().getFullYear() + '-' + String(Math.floor(1000 + Math.random() * 9000))
        await supabase.from('convention_stage').insert({
          numeroconvention: numConv,
          cheminfichier: 'conventions/' + numConv + '.pdf',
          dategeneration: new Date().toISOString(),
          statut: 'generee',
          id_demande: id,
        })
      }

      router.push('/encadrant/dashboard?success=1')
    } catch (err) {
      console.error(err)
    }
    setSubmitting(false)
  }

  if (loading) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center"><div className="text-[#1E3A5F] font-semibold">Chargement...</div></div>
  if (!demande) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center"><div className="text-red-600">Demande introuvable.</div></div>

  const isDecidable = demande.statut === 'en_attente'

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      {/* Modal confirmation */}
      {confirmation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-[#1E3A5F] mb-3">Confirmer la decision</h3>
            <p className="text-[#64748B] mb-6 text-sm">
              Etes-vous sur de vouloir <strong>{confirmation === 'valider' ? 'valider' : 'rejeter'}</strong> la demande <strong>{demande.referenceunique}</strong> ?
              Cette action est irreversible.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmation(null)}
                className="flex-1 border-2 border-slate-200 text-[#64748B] font-semibold py-3 rounded-xl hover:border-[#1E3A5F] transition-colors">
                Annuler
              </button>
              <button
                onClick={() => { handleDecision(confirmation === 'valider' ? 'validee' : 'rejetee'); setConfirmation(null) }}
                disabled={submitting}
                className={`flex-1 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60 ${confirmation === 'valider' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                {confirmation === 'valider' ? 'Valider' : 'Rejeter'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <div className="mb-8">
          <Link href="/encadrant/dashboard" className="text-[#64748B] hover:text-[#1E3A5F] text-sm font-medium transition-colors">Retour au tableau de bord</Link>
          <div className="flex items-center gap-4 mt-4">
            <h1 className="text-3xl font-black text-[#1E3A5F]">Examen de la demande</h1>
            <DemandeBadge statut={demande.statut} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Infos etudiant */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-[#1E3A5F] mb-4">Etudiant</h2>
              <div className="text-sm space-y-1">
                <p className="font-semibold text-[#1E293B]">{demande.etudiant?.utilisateur?.prenom} {demande.etudiant?.utilisateur?.nom}</p>
                <p className="text-[#64748B]">{demande.etudiant?.utilisateur?.email}</p>
                <p className="text-[#64748B]">Matricule : {demande.etudiant?.matricule}</p>
                <p className="text-[#64748B]">{demande.etudiant?.filiere} — {demande.etudiant?.niveau}</p>
              </div>
            </div>

            {/* Infos stage */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-[#1E3A5F] mb-4">Informations du stage</h2>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                {[
                  ['Reference', demande.referenceunique],
                  ['Entreprise', demande.entreprise],
                  ['Adresse', demande.adresseentreprise || 'Non precisee'],
                  ['Periode', format(new Date(demande.datedebut), 'dd/MM/yyyy', {locale:fr}) + ' au ' + format(new Date(demande.datefin), 'dd/MM/yyyy', {locale:fr})],
                  ['Soumise le', format(new Date(demande.datesoumission), 'dd MMMM yyyy', {locale:fr})],
                ].map(([l, v], i) => (
                  <div key={i}>
                    <dt className="text-[#64748B] font-medium mb-0.5">{l}</dt>
                    <dd className="text-[#1E293B] font-semibold">{v}</dd>
                  </div>
                ))}
              </div>
              {demande.objectifsstage && (
                <div className="pt-4 border-t border-slate-100">
                  <dt className="text-[#64748B] font-medium text-sm mb-2">Objectifs du stage</dt>
                  <dd className="text-[#1E293B] text-sm leading-relaxed">{demande.objectifsstage}</dd>
                </div>
              )}
            </div>

            {/* Zone commentaire */}
            {isDecidable && (
              <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
                <h2 className="text-lg font-bold text-[#1E3A5F] mb-3">Commentaire</h2>
                <textarea
                  value={commentaire} onChange={e => setCommentaire(e.target.value)}
                  rows={4} placeholder="Motivez votre decision (obligatoire en cas de rejet)..."
                  className="input-field resize-none" />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-4">
            {isDecidable && (
              <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 space-y-3">
                <h3 className="font-bold text-[#1E3A5F] mb-4">Prendre une decision</h3>
                <button onClick={() => setConfirmation('valider')} disabled={submitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60">
                  Valider la demande
                </button>
                <button onClick={() => setConfirmation('rejeter')} disabled={submitting || !commentaire.trim()}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60">
                  Rejeter la demande
                </button>
                {!commentaire.trim() && <p className="text-xs text-[#64748B] text-center">Un commentaire est requis pour rejeter</p>}
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
          </div>
        </div>
      </div>
    </div>
  )
}
