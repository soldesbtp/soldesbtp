# SoldesBTP.ma

Marketplace de surplus de matériaux BTP au Maroc. Stack : Next.js 14 (App
Router) + Tailwind CSS + Supabase.

## Étape 1 — Lancer le projet en local

Il te faut Node.js installé (version 18 ou plus) sur ton ordinateur.

```bash
npm install
npm run dev
```

Le site sera visible sur http://localhost:3000

## Étape 2 — Créer le projet Supabase (base de données + comptes)

1. Va sur https://supabase.com et crée un compte gratuit.
2. Crée un nouveau projet (choisis une région proche, ex. Europe).
3. Dans **Project Settings > API**, copie :
   - `Project URL`
   - `anon public key`
   - `service_role key` (onglet "Legacy anon, service_role API keys" — à ne
     jamais rendre publique, elle contourne toutes les règles de sécurité)
4. Copie le fichier `.env.local.example` en `.env.local` et colle ces
   valeurs dedans (URL, anon key, et service_role key).

Pour l'instant le site affiche des annonces d'exemple codées en dur — la
prochaine étape sera de créer la table `listings` dans Supabase et de
brancher la page dessus.

## Étape 3 — Mettre le code sur GitHub

1. Crée un compte sur https://github.com si tu n'en as pas.
2. Crée un nouveau dépôt (repository), par exemple `soldesbtp`.
3. Depuis ce dossier :

```bash
git init
git add .
git commit -m "Premiere version du site"
git branch -M main
git remote add origin https://github.com/TON-COMPTE/soldesbtp.git
git push -u origin main
```

## Étape 4 — Déployer sur Vercel

1. Va sur https://vercel.com et connecte-toi avec ton compte GitHub.
2. Clique "Add New Project" et sélectionne le dépôt `soldesbtp`.
3. Dans les réglages du projet, ajoute les mêmes variables d'environnement
   que dans `.env.local` (NEXT_PUBLIC_SUPABASE_URL et
   NEXT_PUBLIC_SUPABASE_ANON_KEY).
4. Clique "Deploy". Après 1-2 minutes, ton site est en ligne sur une
   adresse du type `soldesbtp.vercel.app`.

## Étape 5 — Brancher le domaine soldesbtp.ma (déjà chez Herbafacile)

1. Dans Vercel, va dans **Project > Settings > Domains** et ajoute
   `soldesbtp.ma`.
2. Vercel te donne des valeurs DNS à configurer (en général un enregistrement
   A et/ou CNAME).
3. Connecte-toi à ton espace client Herbafacile > **Mes domaines** >
   `soldesbtp.ma` > gestion des DNS, et ajoute les enregistrements indiqués
   par Vercel.
4. La propagation DNS peut prendre de quelques minutes à 24h.

Aucune de ces étapes ne nécessite de transférer le domaine — il reste chez
Herbafacile, on change juste où il pointe.

## Structure du projet

```
app/            pages (App Router de Next.js)
components/     composants réutilisables (Header, Hero, cartes annonces...)
lib/            connexion à Supabase (client + serveur)
```
