-- ============================================================
-- SGDS — Script de creation et initialisation des tables
-- Universite Cheikh Anta Diop — ESP — L2 GLSI
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS utilisateur (
    id_utilisateur  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom             VARCHAR(100) NOT NULL,
    prenom          VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    motDePasse      VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('etudiant','encadrant','service_stages','administrateur')),
    actif           BOOLEAN NOT NULL DEFAULT TRUE,
    dateCreation    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS etudiant (
    id_etudiant     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matricule       VARCHAR(50) NOT NULL UNIQUE,
    filiere         VARCHAR(100) NOT NULL,
    niveau          VARCHAR(20) NOT NULL,
    id_utilisateur  UUID NOT NULL UNIQUE REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS encadrant (
    id_encadrant    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    departement     VARCHAR(150) NOT NULL,
    id_utilisateur  UUID NOT NULL UNIQUE REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS demande_stage (
    id_demande          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referenceUnique     VARCHAR(50) NOT NULL UNIQUE,
    entreprise          VARCHAR(200) NOT NULL,
    adresseEntreprise   VARCHAR(300),
    dateDebut           DATE NOT NULL,
    dateFin             DATE NOT NULL,
    objectifsStage      TEXT,
    statut              VARCHAR(20) NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente','validee','rejetee')),
    dateSoumission      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dateDecision        TIMESTAMP,
    id_etudiant         UUID NOT NULL REFERENCES etudiant(id_etudiant) ON DELETE CASCADE,
    id_encadrant        UUID REFERENCES encadrant(id_encadrant) ON DELETE SET NULL,
    CONSTRAINT chk_dates CHECK (dateFin > dateDebut)
);

CREATE TABLE IF NOT EXISTS piece_jointe (
    id_piece        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    typeDocument    VARCHAR(100) NOT NULL,
    nomFichier      VARCHAR(255) NOT NULL,
    cheminFichier   VARCHAR(500) NOT NULL,
    dateDepot       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_demande      UUID NOT NULL REFERENCES demande_stage(id_demande) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS commentaire (
    id_commentaire  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contenu         TEXT NOT NULL,
    dateCreation    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_demande      UUID NOT NULL REFERENCES demande_stage(id_demande) ON DELETE CASCADE,
    id_encadrant    UUID NOT NULL REFERENCES encadrant(id_encadrant) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS convention_stage (
    id_convention       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numeroConvention    VARCHAR(50) NOT NULL UNIQUE,
    cheminFichierPDF    VARCHAR(500),
    dateGeneration      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    statut              VARCHAR(20) NOT NULL DEFAULT 'generee' CHECK (statut IN ('generee','signee','archivee')),
    id_demande          UUID NOT NULL UNIQUE REFERENCES demande_stage(id_demande) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notification (
    id_notification UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message         TEXT NOT NULL,
    type            VARCHAR(50) NOT NULL,
    lue             BOOLEAN NOT NULL DEFAULT FALSE,
    dateEnvoi       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_utilisateur  UUID NOT NULL REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS offre_stage (
    id_offre        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titre           VARCHAR(200) NOT NULL,
    entreprise      VARCHAR(200) NOT NULL,
    description     TEXT,
    datePublication TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    id_utilisateur  UUID NOT NULL REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE
);

-- ============================================================
-- DONNEES DE TEST
-- Note: Les UUIDs ci-dessous sont des placeholders.
-- Dans Supabase, inserer d'abord les users via Auth Dashboard
-- puis utiliser leurs UUIDs reels.
-- Comptes : admin@esp.sn / Admin2026!
--           etudiant1@esp.sn / Etudiant2026!
--           etudiant2@esp.sn / Etudiant2026!
--           encadrant@esp.sn / Encadrant2026!
--           stages@esp.sn / Stages2026!
-- ============================================================

-- Inserer apres avoir cree les comptes via Supabase Auth
-- et recupere les UUIDs generes automatiquement.
-- Exemple (remplacer les UUIDs par les vrais) :

/*
INSERT INTO utilisateur (id_utilisateur, nom, prenom, email, motDePasse, role, actif) VALUES
  ('UUID_ADMIN',     'Diallo',  'Moussa',    'admin@esp.sn',       'hashed', 'administrateur', true),
  ('UUID_ETU1',      'Diouf',   'Serigne',   'etudiant1@esp.sn',   'hashed', 'etudiant',        true),
  ('UUID_ETU2',      'War',     'Awa',       'etudiant2@esp.sn',   'hashed', 'etudiant',        true),
  ('UUID_ENC',       'Ba',      'Lamine',    'encadrant@esp.sn',   'hashed', 'encadrant',       true),
  ('UUID_SVC',       'Traore',  'Khadijatou','stages@esp.sn',      'hashed', 'service_stages',  true);

INSERT INTO etudiant (matricule, filiere, niveau, id_utilisateur) VALUES
  ('ESP-2024-001', 'Genie Logiciel et Systemes d Information', 'L2', 'UUID_ETU1'),
  ('ESP-2024-002', 'Genie Logiciel et Systemes d Information', 'L2', 'UUID_ETU2');

INSERT INTO encadrant (departement, id_utilisateur) VALUES
  ('Departement Genie Informatique', 'UUID_ENC');

INSERT INTO demande_stage (referenceUnique, entreprise, adresseEntreprise, dateDebut, dateFin, objectifsStage, statut, id_etudiant) VALUES
  ('DEM-2026-0001', 'Sonatel', 'Plateau, Dakar', '2026-07-01', '2026-09-30', 'Developper une application web pour la gestion des clients.', 'en_attente', (SELECT id_etudiant FROM etudiant WHERE matricule='ESP-2024-001')),
  ('DEM-2026-0002', 'Orange Senegal', 'Almadies, Dakar', '2026-07-15', '2026-10-15', 'Contribuer au developpement d un systeme de paiement mobile.', 'validee', (SELECT id_etudiant FROM etudiant WHERE matricule='ESP-2024-002')),
  ('DEM-2026-0003', 'CTIC Dakar', 'Mermoz, Dakar', '2026-08-01', '2026-10-31', 'Travailler sur des projets de transformation digitale.', 'rejetee', (SELECT id_etudiant FROM etudiant WHERE matricule='ESP-2024-001'));

INSERT INTO convention_stage (numeroConvention, dateGeneration, statut, id_demande) VALUES
  ('CONV-2026-0001', NOW(), 'generee', (SELECT id_demande FROM demande_stage WHERE referenceUnique='DEM-2026-0002'));

INSERT INTO offre_stage (titre, entreprise, description, active, id_utilisateur) VALUES
  ('Stage Developpeur Full Stack', 'Sonatel', 'Rejoignez notre equipe technique pour developper des applications web et mobile innovantes. Maitrise de React et Node.js souhaitee.', true, 'UUID_SVC'),
  ('Stage Data Analyst', 'CTIC Dakar', 'Analysez et visualisez des donnees pour aider les entreprises senegalaises dans leur transformation digitale.', true, 'UUID_SVC'),
  ('Stage Securite Informatique', 'Orange Senegal', 'Participez a la mise en place de politiques de securite et a la detection de vulnerabilites.', true, 'UUID_SVC');
*/
