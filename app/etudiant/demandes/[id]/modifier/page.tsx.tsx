'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase'

const ENTREPRISES = [
  "Sonatel","Orange Senegal","Expresso Senegal","Free Senegal",
  "CTIC Dakar","Gainde 2000","Volkeno","Intech","Dexchange",
  "Wave Mobile Money","Wari","InTouch","La Poste Senegal",
  "Banque de Dakar","Ecobank Senegal","SGBS","Total Energies Senegal",
  "Sapco","Ageroute","ADIE","Autre"
]

const ADRESSES = [
  "Plateau, Dakar","Almadies, Dakar","Mermoz, Dakar","Fann, Dakar",
  "Point E, Dakar","Ouakam, Dakar","Yoff, Dakar","Ngor, Dakar",
  "Sacre Coeur, Dakar","Grand Yoff, Dakar","Parcelles Assainies, Dakar",
  "Pikine, Dakar","Guediawaye, Dakar","Rufisque, Dakar",
  "Thies","Saint-Louis","Ziguinchor","Kaolack","Autre"
]

export default function ModifierDemandePage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    entreprise: '',
    adresseentreprise: '',
    datedebut: '',
    datefin: '',
    objectifsstage: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('demande_stage')
        .select('*')
        .eq('id_demande', id)
        .single()

      if (!data) { setLoading(false); return }

      // Verifier que la demande est encore en attente
      if (data.statut !== 'en_attente') {
        router.push('/etudiant/demandes/' + id)
        return
      }

      setForm({
        entreprise: data.entreprise || '',
        adresseentreprise: data.adresseentreprise || '',
        datedebut: data.datedebut ? data.datedebut.slice(0, 10) : '',
        datefin: data.datefin ? data.datefin.slice(0, 10) : '',
        objectifsstage: data.objectifsstage || '',
      })
      setLoading(false)
    }
    load()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (new Date(form.datefin) <= new Date(form.datedebut)) {
      setError('La date de fin doit etre posterieure a la date de debut.')
      return
    }

    setSaving(true)
    const { error: updateError } = await supabase
      .from('demande_stage')
      .update({
        entreprise: form.entreprise,
        adresseentreprise: form.adresseentreprise,
        datedebut: form.datedebut,
        datefin: form.datefin,
        objectifsstage: form.objectifsstage,
      })
      .eq('id_demande', id)

    if (updateError) {
      setError('Erreur lors de la modification : ' + updateError.message)
      setSaving(false)
      return
    }

    router.push('/etudiant/demandes/' + id + '?updated=1')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="text-[#1E3A5F] font-semibold">Chargement...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <div className="mb-8">
          <Link href={'/etudiant/demandes/' + id}
            className="text-[#64748B] hover:text-[#1E3A5F] text-sm font-medium transition-colors">
            Retour au detail
          </Link>
          <h1 className="text-3xl font-black text-[#1E3A5F] mt-4">Modifier la demande</h1>
          <p className="text-[#64748B] mt-1">Vous pouvez modifier votre demande tant qu'elle est en attente.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md border border-slate-100 p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="md:col-span-2">
              <label className="label">Nom de l'entreprise *</label>
              <select
                value={form.entreprise}
                onChange={(e) => setForm(prev => ({ ...prev, entreprise: e.target.value }))}
                className="input-field" required>
                <option value="">-- Selectionnez une entreprise --</option>
                {ENTREPRISES.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="label">Adresse de l'entreprise</label>
              <select
                value={form.adresseentreprise}
                onChange={(e) => setForm(prev => ({ ...prev, adresseentreprise: e.target.value }))}
                className="input-field">
                <option value="">-- Selectionnez une adresse --</option>
                {ADRESSES.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Date de debut *</label>
              <input type="date" value={form.datedebut}
                onChange={(e) => setForm(prev => ({ ...prev, datedebut: e.target.value }))}
                className="input-field" required />
            </div>

            <div>
              <label className="label">Date de fin *</label>
              <input type="date" value={form.datefin}
                onChange={(e) => setForm(prev => ({ ...prev, datefin: e.target.value }))}
                className="input-field" required />
            </div>

            <div className="md:col-span-2">
              <label className="label">Objectifs du stage *</label>
              <textarea
                value={form.objectifsstage}
                onChange={(e) => setForm(prev => ({ ...prev, objectifsstage: e.target.value }))}
                rows={5} className="input-field resize-none"
                placeholder="Decrivez les objectifs et missions prevues..." required />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <Link href={'/etudiant/demandes/' + id}
              className="flex-1 border-2 border-slate-200 text-[#64748B] font-semibold py-3 rounded-xl text-center hover:border-[#1E3A5F] hover:text-[#1E3A5F] transition-colors">
              Annuler
            </Link>
            <button type="submit" disabled={saving}
              className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60">
              {saving ? 'Modification en cours...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
