# SGDS — Systeme de Gestion des Demandes de Stage
### ESP — UCAD | Departement Genie Informatique | L2 GLSI

Plateforme web de gestion des demandes de stage de l'Ecole Superieure Polytechnique de l'UCAD.

---

## Stack technique

- **Frontend** : Next.js 14 (App Router) + Tailwind CSS
- **Backend** : Supabase (Auth + PostgreSQL)
- **Deploiement** : Vercel

---

## Installation locale

### 1. Cloner le projet

```bash
git clone https://github.com/votre-groupe/sgds.git
cd sgds
```

### 2. Installer les dependances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Remplir `.env.local` avec vos credentials Supabase :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
```

### 4. Configurer la base de donnees Supabase

1. Creer un projet sur [supabase.com](https://supabase.com)
2. Aller dans **SQL Editor**
3. Executer le contenu de `seed.sql` (section CREATE TABLE)
4. Creer les buckets de stockage : `pieces-jointes` et `conventions`

### 5. Creer les comptes utilisateurs

Dans **Supabase > Authentication > Users**, creer :

| Email | Mot de passe | Role |
|-------|-------------|------|
| admin@esp.sn | Admin2026! | administrateur |
| etudiant1@esp.sn | Etudiant2026! | etudiant |
| etudiant2@esp.sn | Etudiant2026! | etudiant |
| encadrant@esp.sn | Encadrant2026! | encadrant |
| stages@esp.sn | Stages2026! | service_stages |

Puis inserer les donnees de la section commentee de `seed.sql` en remplacant les UUIDs par ceux generes.

### 6. Lancer le serveur de developpement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

---

## Deploiement sur Vercel

### Via CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Via GitHub

1. Pousser le code sur GitHub
2. Aller sur [vercel.com](https://vercel.com) > **New Project**
3. Importer le repo GitHub
4. Ajouter les variables d'environnement dans Vercel :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Cliquer **Deploy**

---

## Structure du projet

```
sgds/
├── app/
│   ├── page.tsx                        # Page d'accueil (publique)
│   ├── login/page.tsx                  # Connexion
│   ├── etudiant/
│   │   ├── dashboard/page.tsx          # Dashboard etudiant
│   │   ├── nouvelle-demande/page.tsx   # Formulaire soumission
│   │   └── demandes/[id]/page.tsx      # Detail d'une demande
│   ├── encadrant/
│   │   ├── dashboard/page.tsx          # Dashboard encadrant
│   │   └── demandes/[id]/page.tsx      # Validation/rejet
│   ├── service-stages/
│   │   └── dashboard/page.tsx          # Dashboard service stages
│   ├── admin/
│   │   └── dashboard/page.tsx          # Administration
│   ├── offres/page.tsx                 # Offres de stage
│   └── api/
│       ├── demandes/route.ts
│       └── utilisateurs/route.ts
├── components/
│   ├── Navbar.tsx                      # Navigation
│   ├── Footer.tsx                      # Pied de page
│   ├── DemandeBadge.tsx               # Badge de statut
│   └── NotificationBell.tsx           # Cloche notifications
├── lib/
│   ├── supabase.ts                     # Client Supabase (browser)
│   ├── supabase-server.ts              # Client Supabase (server)
│   └── auth.ts                         # Helpers auth
├── middleware.ts                        # Protection des routes
├── seed.sql                            # Schema BDD + donnees de test
└── .env.example                        # Variables d'environnement
```

---

## Fonctionnalites

| Role | Fonctionnalites |
|------|----------------|
| **Etudiant** | Soumettre une demande, consulter ses demandes, telecharger sa convention |
| **Encadrant** | Consulter les demandes, valider ou rejeter avec commentaire |
| **Service des stages** | Gerer les conventions, publier des offres de stage |
| **Administrateur** | CRUD utilisateurs, statistiques globales |

---

## Equipe

- **Serigne Falou Niang DIOUF** — Chef de projet
- **Awa WAR** — Developpement
- **Pape Babacar DIOUF** — Developpement
- **Khadijatou Oumy TRAORE** — Developpement

Encadrant : Dr. Mouhamadou Lamine Ba
