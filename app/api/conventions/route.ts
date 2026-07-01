import { NextResponse } from 'next/server'
import { generateConventionPDF } from '@/lib/conventionPdf'

function getAdminClient() {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: Request) {
  try {
    const { id_demande } = await req.json()
    if (!id_demande) {
      return NextResponse.json({ error: 'id_demande manquant' }, { status: 400 })
    }

    const supabase = getAdminClient()

    // Recuperer toutes les infos necessaires
    const { data: demande, error: demandeErr } = await supabase
      .from('demande_stage')
      .select(`
        *,
        etudiant:id_etudiant ( matricule, filiere, niveau, utilisateur:id_utilisateur ( nom, prenom ) ),
        encadrant:id_encadrant ( departement, utilisateur:id_utilisateur ( nom, prenom ) )
      `)
      .eq('id_demande', id_demande)
      .single()

    if (demandeErr || !demande) {
      return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 })
    }

    if (demande.statut !== 'validee') {
      return NextResponse.json({ error: 'La demande doit etre validee avant de generer la convention' }, { status: 400 })
    }

    // Generer le numero de convention
    const numeroConvention = 'CONV-' + new Date().getFullYear() + '-' + String(Math.floor(1000 + Math.random() * 9000))
    const dateGeneration = new Date().toISOString()

    // Generer le PDF
    const pdfBuffer = await generateConventionPDF({
      numeroConvention,
      etudiantNom: demande.etudiant?.utilisateur?.nom || '',
      etudiantPrenom: demande.etudiant?.utilisateur?.prenom || '',
      matricule: demande.etudiant?.matricule || '',
      filiere: demande.etudiant?.filiere || '',
      niveau: demande.etudiant?.niveau || '',
      entreprise: demande.entreprise || '',
      adresseEntreprise: demande.adresseentreprise || '',
      dateDebut: demande.datedebut || '',
      dateFin: demande.datefin || '',
      objectifsStage: demande.objectifsstage || '',
      encadrantNom: demande.encadrant?.utilisateur?.nom || 'Non assigne',
      encadrantPrenom: demande.encadrant?.utilisateur?.prenom || '',
      departement: demande.encadrant?.departement || 'Departement Genie Informatique',
      dateGeneration,
    })

    // Stocker le PDF dans Supabase Storage
    const filePath = `${numeroConvention}.pdf`
    const { error: uploadErr } = await supabase.storage
      .from('conventions')
      .upload(filePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadErr) {
      return NextResponse.json({ error: 'Erreur upload PDF: ' + uploadErr.message }, { status: 500 })
    }

    // Enregistrer dans la table convention_stage
    const { data: convention, error: convErr } = await supabase
      .from('convention_stage')
      .insert({
        numeroconvention: numeroConvention,
        cheminfichierpdf: filePath,
        dategeneration: dateGeneration,
        statut: 'generee',
        id_demande: id_demande,
      })
      .select()
      .single()

    if (convErr) {
      return NextResponse.json({ error: 'Erreur enregistrement: ' + convErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, convention, numeroConvention }, { status: 201 })

  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erreur serveur' }, { status: 500 })
  }
}
