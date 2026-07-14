'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase'

export default function NouvelleDemandePage() {
  const [form, setForm] = useState({
    entreprise: '', Niveau: '', dateDebut: '',
    dateFin: '', objectifsStage: '',
  })
  const [fichiers, setFichiers] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [etudiantId, setEtudiantId] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase.from('etudiant').select('id_etudiant').eq('id_utilisateur', user.id).single()
      if (data) setEtudiantId(data.id_etudiant)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (new Date(form.dateFin) <= new Date(form.dateDebut)) {
      setError('La date de fin doit etre posterieure a la date de debut.')
      return
    }
    setLoading(true)
    try {
      const ref = 'DEM-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000)
      const { data: demande, error: dErr } = await supabase.from('demande_stage').insert({
        referenceunique: ref,
        entreprise: form.entreprise,
        Niveau: form.Niveau,
        datedebut: form.dateDebut,
        datefin: form.dateFin,
        objectifsstage: form.objectifsStage,
        statut: 'en_attente',
        datesoumission: new Date().toISOString(),
        id_etudiant: etudiantId,
      }).select().single()

      if (dErr) throw dErr

      // Upload pieces jointes
      for (const fichier of fichiers) {
        const path = demande.id_demande + '/' + fichier.name
        const { error: uploadError } = await supabase.storage.from('pieces-jointes').upload(path, fichier)
if (uploadError) console.error('Upload error:', uploadError)
        const { error: insertError } = await supabase.from('piece_jointe').insert({
  typedocument: fichier.name.endsWith('.pdf') ? 'PDF' : 'Document',
  nomfichier: fichier.name,
  cheminfichier: path,
  datedepot: new Date().toISOString(),
  id_demande: demande.id_demande,
})
if (insertError) console.error('Insert piece jointe error:', insertError)
      }

      // Notification encadrant (si assigne)
      const { data: enc } = await supabase.from('encadrant').select('id_utilisateur').limit(1).single()
      if (enc) {
        await supabase.from('notification').insert({
          message: 'Nouvelle demande de stage soumise : ' + ref + ' — ' + form.entreprise,
          type: 'NOUVELLE_DEMANDE',
          lue: false,
          dateEnvoi: new Date().toISOString(),
          id_utilisateur: enc.id_utilisateur,
        })
      }

      router.push('/etudiant/dashboard?success=1')
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.')
    }
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <div className="mb-8">
          <Link href="/etudiant/dashboard" className="text-[#64748B] hover:text-[#1E3A5F] text-sm font-medium transition-colors flex items-center gap-2">
            Retour au tableau de bord
          </Link>
          <h1 className="text-3xl font-black text-[#1E3A5F] mt-4">Nouvelle demande de stage</h1>
          <p className="text-[#64748B] mt-1">Remplissez le formulaire ci-dessous pour soumettre votre demande.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md border border-slate-100 p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="label">Nom de l'entreprise *</label>
              <select name="entreprise" value={form.entreprise}
  onChange={(e) => setForm(prev => ({ ...prev, entreprise: e.target.value }))}
  className="input-field" required>
  <option value="">-- Selectionnez une entreprise --</option>
  <option>Sonatel</option>
  <option>Orange Senegal</option>
  <option>Expresso Senegal</option>
  <option>Free Senegal</option>
  <option>CTIC Dakar</option>
  <option>Gainde 2000</option>
  <option>Volkeno</option>
  <option>Intech</option>
  <option>Dexchange</option>
  <option>Wave Mobile Money</option>
  <option>Wari</option>
  <option>InTouch</option>
  <option>La Poste Senegal</option>
  <option>Banque de Dakar</option>
  <option>Ecobank Senegal</option>
  <option>SGBS</option>
  <option>Total Energies Senegal</option>
  <option>Sapco</option>
  <option>Ageroute</option>
  <option>ADIE</option>
  <option>Autre</option>
</select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Niveau</label>
              <select name="adresseEntreprise" value={form.Niveau}
  onChange={(e) => setForm(prev => ({ ...prev, Niveau: e.target.value }))}
  className="input-field">
  <option value="">-- Niveau d'étude --</option>
  <option>L1</option>
  <option>L2</option>
  <option>L3</option>
  <option>M1</option>
  <option>M2</option>
  <option>Autre</option>
</select>
            </div>
            <div>
              <label className="label">Date de debut *</label>
              <input type="date" name="dateDebut" value={form.dateDebut} onChange={handleChange}
                className="input-field" required />
            </div>
            <div>
              <label className="label">Date de fin *</label>
              <input type="date" name="dateFin" value={form.dateFin} onChange={handleChange}
                className="input-field" required />
            </div>
            <div className="md:col-span-2">
              <label className="label">Objectifs du stage *</label>
              <textarea name="objectifsStage" value={form.objectifsStage} onChange={handleChange}
                rows={5} className="input-field resize-none"
                placeholder="Decrivez les objectifs et les missions prevues durant votre stage..." required />
            </div>
            <div className="md:col-span-2">
              <label className="label">Pieces jointes</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                <input type="file" multiple accept=".pdf,.doc,.docx"
                  onChange={e => setFichiers(Array.from(e.target.files || []))}
                  className="hidden" id="files" />
                <label htmlFor="files" className="cursor-pointer">
                  <p className="text-[#64748B] text-sm mb-1">Glissez votre cv et lettre de motivation</p>
                  <span className="text-[#F59E0B] font-semibold text-sm hover:text-[#D97706]">cliquez pour selectionner</span>
                  <p className="text-xs text-slate-400 mt-2">PDF, DOC, DOCX acceptes</p>
                </label>
                {fichiers.length > 0 && (
                  <div className="mt-4 space-y-1">
                    {fichiers.map((f, i) => (
                      <p key={i} className="text-sm text-[#1E3A5F] font-medium">{f.name}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <Link href="/etudiant/dashboard"
              className="flex-1 border-2 border-slate-200 text-[#64748B] font-semibold py-3 rounded-xl text-center hover:border-[#1E3A5F] hover:text-[#1E3A5F] transition-colors">
              Annuler
            </Link>
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60">
              {loading ? 'Soumission en cours...' : 'Soumettre la demande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
