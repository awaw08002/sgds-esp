'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase'

export default function PostulerOffrePage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [offre, setOffre] = useState<any>(null)
  const [etudiantId, setEtudiantId] = useState('')
  const [form, setForm] = useState({
    datedebut: '',
    datefin: '',
    objectifsstage: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      // Charger l'offre
      const { data: offreData } = await supabase
        .from('offre_stage')
        .select('*')
        .eq('id_offre', id)
        .single()
      setOffre(offreData)

      // Charger l'etudiant connecte
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: etudiant } = await supabase
          .from('etudiant')
          .select('id_etudiant')
          .eq('id_utilisateur', user.id)
          .single()
        if (etudiant) setEtudiantId(etudiant.id_etudiant)
      }
      setLoading(false)
    }
    load()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!etudiantId) {
      setError('Vous devez etre connecte en tant qu etudiant pour postuler.')
      return
    }
    if (new Date(form.datefin) <= new Date(form.datedebut)) {
      setError('La date de fin doit etre posterieure a la date de debut.')
      return
    }

    setSaving(true)
    try {
      const ref = 'DEM-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000)

      const { error: dErr } = await supabase.from('demande_stage').insert({
        referenceunique: ref,
        entreprise: offre.entreprise,
        adresseentreprise: '',
        datedebut: form.datedebut,
        datefin: form.datefin,
        objectifsstage: form.objectifsstage ||
          'Candidature pour l offre : ' + offre.titre + '. ' + (offre.description || ''),
        statut: 'en_attente',
        datesoumission: new Date().toISOString(),
        id_etudiant: etudiantId,
      })

      if (dErr) throw dErr

      // Notification encadrant
      const { data: enc } = await supabase
        .from('encadrant')
        .select('id_utilisateur')
        .limit(1)
        .single()
      if (enc) {
        await supabase.from('notification').insert({
          message: 'Nouvelle candidature pour l offre ' + offre.titre + ' chez ' + offre.entreprise + ' — Ref: ' + ref,
          type: 'NOUVELLE_DEMANDE',
          lue: false,
          dateenvoi: new Date().toISOString(),
          id_utilisateur: enc.id_utilisateur,
        })
      }

      router.push('/etudiant/dashboard?success=1')
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.')
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="text-[#1E3A5F] font-semibold">Chargement...</div>
    </div>
  )

  if (!offre) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="text-red-600">Offre introuvable.</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-12">

        <div className="mb-8">
          <Link href="/offres"
            className="text-[#64748B] hover:text-[#1E3A5F] text-sm font-medium transition-colors">
            Retour aux offres
          </Link>
          <h1 className="text-3xl font-black text-[#1E3A5F] mt-4">Postuler a cette offre</h1>
        </div>

        {/* Carte offre */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-[#1E3A5F]/10 rounded-xl flex items-center justify-center">
              <span className="text-[#1E3A5F] font-black text-lg">
                {offre.entreprise?.[0] || 'S'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1E3A5F]">{offre.titre}</h2>
              <p className="text-[#F59E0B] font-semibold text-sm">{offre.entreprise}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <span className="text-[#64748B] font-medium">Entreprise</span>
              <p className="text-[#1E293B] font-semibold mt-0.5">{offre.entreprise}</p>
            </div>
            <div>
              <span className="text-[#64748B] font-medium">Niveau requis</span>
              <p className="text-[#1E293B] font-semibold mt-0.5">{offre.niveauetude || 'Non precise'}</p>
            </div>
          </div>

          {offre.description && (
            <div className="pt-4 border-t border-slate-100">
              <span className="text-[#64748B] font-medium text-sm">Description</span>
              <p className="text-[#1E293B] text-sm leading-relaxed mt-1">{offre.description}</p>
            </div>
          )}
        </div>

        {/* Formulaire */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {!etudiantId ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
            <p className="text-amber-700 font-medium mb-4">
              Vous devez etre connecte en tant qu etudiant pour postuler.
            </p>
            <Link href="/login"
              className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold px-6 py-3 rounded-xl transition-colors">
              Se connecter
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md border border-slate-100 p-8 space-y-5">
            <h3 className="text-lg font-bold text-[#1E3A5F]">Completer votre candidature</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Date de debut *</label>
                <input type="date" value={form.datedebut}
                  onChange={e => setForm(p => ({...p, datedebut: e.target.value}))}
                  className="input-field" required />
              </div>
              <div>
                <label className="label">Date de fin *</label>
                <input type="date" value={form.datefin}
                  onChange={e => setForm(p => ({...p, datefin: e.target.value}))}
                  className="input-field" required />
              </div>
            </div>

            <div>
              <label className="label">Message de motivation (optionnel)</label>
              <textarea
                value={form.objectifsstage}
                onChange={e => setForm(p => ({...p, objectifsstage: e.target.value}))}
                rows={4} className="input-field resize-none"
                placeholder="Expliquez pourquoi vous souhaitez postuler a cette offre..." />
            </div>

            <div className="flex gap-4 pt-2">
              <Link href="/offres"
                className="flex-1 border-2 border-slate-200 text-[#64748B] font-semibold py-3 rounded-xl text-center hover:border-[#1E3A5F] transition-colors">
                Annuler
              </Link>
              <button type="submit" disabled={saving}
                className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60">
                {saving ? 'Envoi en cours...' : 'Postuler'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
