# Migration : NestJS sur Render + Supabase → Next.js sur Vercel + Neon

L'API NestJS (`apps/api`) est portée route pour route dans `apps/web`
(ex-`apps/admin`), qui sert désormais les pages publiques, l'admin et l'API
sous `/api`. Mêmes chemins, mêmes réponses JSON, mêmes codes HTTP : les
applis déjà installées continuent de fonctionner.

```
apps/web     pages publiques, contact, admin, API (/api)     → Vercel (fra1)
apps/mobile  appli Expo, appelle https://focus-admin.vercel.app/api
apps/relay   relais de l'ancienne adresse Render vers Vercel → Render
base         Neon (Postgres, région Francfort)
fichiers     Cloudinary
```

## Variables d'environnement sur Vercel (projet `apps/web`)

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | URL **poolée** Neon (hôte en `-pooler`) |
| `DATABASE_URL_UNPOOLED` | URL **directe** Neon, pour les migrations |
| `DATABASE_SSL` | `true` |
| `JWT_SECRET` | **la valeur que l'API NestJS utilisait** (codée en dur dans `apps/api/src/auth/jwt.strategy.ts`), pour que personne ne soit déconnecté. À changer plus tard, une fois toutes les applis passées en 2.2.0 |
| `JWT_EXPIRATION` | `7d` |
| `APP_URL` | `https://focus-admin.vercel.app` |
| `CRON_SECRET` | une longue chaîne aléatoire (`openssl rand -hex 32`) |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | comme sur Render |
| `BREVO_API_KEY`, `MAIL_FROM` | comme sur Render |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_*_PRICE_ID` | comme sur Render, sauf le secret du webhook : il change avec la nouvelle URL |
| `REVENUECAT_WEBHOOK_SECRET`, `REVENUECAT_IOS_API_KEY`, `REVENUECAT_ANDROID_API_KEY` | comme sur Render |
| `DEEPL_API_KEY`, `DEEPL_API_PRO` | comme sur Render |

À **supprimer** : `NEXT_PUBLIC_API_URL`. L'admin ne la lit plus, mais la
garder prête à confusion.

Réglage du projet Vercel : **Root Directory = `apps/web`** (c'était
`apps/admin`). Sans ce changement, le prochain déploiement échoue.

## Tâches planifiées

| Tâche | Où | Quand (UTC) |
|---|---|---|
| Citation premium du jour + expiration des abonnements | Vercel Cron, `/api/cron/daily` | 15:00 |
| Rappels premium matin, midi, soir | GitHub Actions, `.github/workflows/focus-cron.yml` | 08:00, 12:30, 19:00 |
| Annonce d'une nouvelle citation premium | immédiate, à sa création dans l'admin | — |

GitHub : ajouter le secret de dépôt `CRON_SECRET` (même valeur que sur
Vercel). La variable de dépôt `FOCUS_API_URL` est facultative.

L'envoi aléatoire minute par minute est abandonné : l'appli programme les
rappels sur le téléphone.

## Bascule, dans l'ordre

1. **Préparer.** Créer le projet Neon (Postgres 17, région Francfort).
   Changer les mots de passe des deux bases Supabase, exposés dans
   `apps/api/src/seeds/migrate-data.ts`.
2. **Répéter.** Copier dans une branche Neon vide et vérifier les comptages :
   ```bash
   SOURCE_DATABASE_URL='<supabase session pooler, port 5432>' \
   TARGET_DATABASE_URL='<neon direct, branche de test>' \
   ./scripts/db/migrate-to-neon.sh
   ```
3. **Déployer `apps/web`** sur Vercel avec les variables ci-dessus, pointées
   sur la branche de test. Comparer avec l'ancienne API :
   ```bash
   OLD_API=https://focus-app-1.onrender.com NEW_API=https://focus-admin.vercel.app/api \
   USER_EMAIL=... USER_PASSWORD=... ADMIN_EMAIL=... ADMIN_PASSWORD=... \
   node scripts/api/compare.mjs
   ```
4. **Basculer.** Ne plus rien modifier dans l'admin, relancer le script de
   copie vers la branche principale de Neon, y pointer `DATABASE_URL` sur
   Vercel, redéployer.
5. **Webhooks.** Stripe : `https://focus-admin.vercel.app/api/subscriptions/webhook`
   (nouveau secret de signature à reporter dans `STRIPE_WEBHOOK_SECRET`).
   RevenueCat : `https://focus-admin.vercel.app/api/subscriptions/webhook/revenuecat`.
6. **Relais.** Sur Render, le service `focus-app-1` passe sur `apps/relay`
   (Root Directory `apps/relay`, build `npm install --omit=dev`, start
   `npm start`, health check `/relay-health`). Les applis antérieures à la
   2.2.0 passent alors par Vercel.
7. **Publier l'appli 2.2.0**, qui appelle directement Vercel.
8. **Retirer**, quand les anciennes versions ne pèsent plus : le service
   Render, `apps/api`, puis le projet Supabase.

## Ce qui change par rapport à NestJS

- Les écritures sur les comptes, les citations, les sujets et les réseaux
  sociaux demandent un compte admin. Elles étaient ouvertes à tous.
- Aucune réponse ne contient plus le hash du mot de passe ni le code de
  réinitialisation.
- Le rôle admin est relu en base à chaque requête, plus seulement dans le
  jeton.
- Les envois d'e-mails se font après la réponse (`after()`), avec trois
  tentatives.
