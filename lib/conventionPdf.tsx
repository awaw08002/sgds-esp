import { renderToBuffer } from '@react-pdf/renderer'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import React from 'react'

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#000000',
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
    borderBottom: '1pt solid #000000',
    paddingBottom: 15,
  },
  university: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  school: {
    fontSize: 11,
    marginBottom: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 30,
    color: '#444444',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    borderBottom: '0.5pt solid #000000',
    paddingBottom: 3,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    width: 160,
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.6,
    marginBottom: 10,
    textAlign: 'justify',
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 60,
  },
  signatureBox: {
    width: '30%',
    textAlign: 'center',
  },
  signatureLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  signatureLine: {
    borderTop: '0.5pt solid #000000',
    paddingTop: 4,
    fontSize: 8,
    color: '#444444',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    fontSize: 8,
    textAlign: 'center',
    color: '#666666',
    borderTop: '0.5pt solid #cccccc',
    paddingTop: 8,
  },
  numConv: {
    fontSize: 9,
    textAlign: 'right',
    marginBottom: 10,
    color: '#444444',
  },
})

interface ConventionProps {
  numeroConvention: string
  etudiantNom: string
  etudiantPrenom: string
  matricule: string
  filiere: string
  niveau: string
  entreprise: string
  adresseEntreprise: string
  dateDebut: string
  dateFin: string
  objectifsStage: string
  encadrantNom: string
  encadrantPrenom: string
  departement: string
  dateGeneration: string
}

function ConventionDocument(props: ConventionProps) {
  const formatDate = (d: string) => {
    if (!d) return '—'
    const date = new Date(d)
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tete */}
        <View style={styles.header}>
          <Text style={styles.university}>UNIVERSITE CHEIKH ANTA DIOP DE DAKAR</Text>
          <Text style={styles.school}>ECOLE SUPERIEURE POLYTECHNIQUE</Text>
          <Text style={styles.school}>Departement Genie Informatique</Text>
        </View>

        <Text style={styles.numConv}>N° {props.numeroConvention}</Text>

        <Text style={styles.title}>Convention de Stage</Text>
        <Text style={styles.subtitle}>
          Etablie en application du reglement interieur de l'ESP — UCAD
        </Text>

        {/* Etudiant */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>I. Identification de l'etudiant</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nom et prenom</Text>
            <Text style={styles.value}>{props.etudiantPrenom} {props.etudiantNom}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Matricule</Text>
            <Text style={styles.value}>{props.matricule}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Filiere</Text>
            <Text style={styles.value}>{props.filiere}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Niveau</Text>
            <Text style={styles.value}>{props.niveau}</Text>
          </View>
        </View>

        {/* Entreprise */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>II. Organisme d'accueil</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Entreprise</Text>
            <Text style={styles.value}>{props.entreprise}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Adresse</Text>
            <Text style={styles.value}>{props.adresseEntreprise || 'Non precisee'}</Text>
          </View>
        </View>

        {/* Periode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>III. Periode du stage</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Date de debut</Text>
            <Text style={styles.value}>{formatDate(props.dateDebut)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date de fin</Text>
            <Text style={styles.value}>{formatDate(props.dateFin)}</Text>
          </View>
        </View>

        {/* Objectifs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>IV. Objectifs et missions</Text>
          <Text style={styles.paragraph}>{props.objectifsStage || 'Non precise.'}</Text>
        </View>

        {/* Encadrement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>V. Encadrement pedagogique</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Encadrant ESP</Text>
            <Text style={styles.value}>{props.encadrantPrenom} {props.encadrantNom}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Departement</Text>
            <Text style={styles.value}>{props.departement}</Text>
          </View>
        </View>

        {/* Signatures */}
        <View style={styles.signatureRow}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>L'Etudiant</Text>
            <Text style={styles.signatureLine}>Signature</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>L'Encadrant pedagogique</Text>
            <Text style={styles.signatureLine}>Signature</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Le Service des Stages</Text>
            <Text style={styles.signatureLine}>Signature et cachet</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Document genere automatiquement le {formatDate(props.dateGeneration)} par le Systeme de Gestion des Demandes de Stage (SGDS) — ESP/UCAD.
        </Text>
      </Page>
    </Document>
  )
}

export async function generateConventionPDF(props: ConventionProps): Promise<Buffer> {
  return renderToBuffer(<ConventionDocument {...props} />)
}
