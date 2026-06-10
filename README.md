# TrackPay Admin — Documentation Technique

> Panneau d'administration de la plateforme de paiement TrackPay.  
> Construit avec **Next.js 16**, **React 19**, **TypeScript**, **TailwindCSS 4** et **TanStack Query**.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Stack technique](#2-stack-technique)
3. [Architecture du projet](#3-architecture-du-projet)
4. [Authentification & Sécurité](#4-authentification--sécurité)
5. [Gestion des données — TanStack Query](#5-gestion-des-données--tanstack-query)
6. [Gestion de l'état global — Zustand](#6-gestion-de-létat-global--zustand)
7. [Couche API — Axios](#7-couche-api--axios)
8. [Routing — Next.js App Router](#8-routing--nextjs-app-router)
9. [Interface utilisateur — TailwindCSS & Composants](#9-interface-utilisateur--tailwindcss--composants)
10. [TypeScript — Typage fort](#10-typescript--typage-fort)
11. [Fonctionnalités implémentées](#11-fonctionnalités-implémentées)
12. [Variables d'environnement](#12-variables-denvironnement)
13. [Lancer le projet](#13-lancer-le-projet)
14. [Questions fréquentes jury](#14-questions-fréquentes-jury)

---

## 1. Vue d'ensemble

TrackPay Admin est une **Single Page Application (SPA)** côté client qui communique avec une API REST Django (backend hébergé sur Render.com).  
Elle permet aux administrateurs de :
- Superviser les **marchands** (CRUD complet : créer, lire, modifier, suspendre, supprimer)
- Valider les **KYC** (Know Your Customer — vérification d'identité)
- Consulter toutes les **transactions**
- Gérer les **abonnements** et plans
- Visualiser les statistiques sur un **dashboard** avec graphiques

---

## 2. Stack technique

| Technologie | Version | Rôle |
|---|---|---|
| **Next.js** | 16.2.6 | Framework React (routing, SSR/CSR, middleware) |
| **React** | 19.2.4 | Bibliothèque UI |
| **TypeScript** | 5.x | Typage statique |
| **TailwindCSS** | 4.x | Styles utilitaires |
| **TanStack Query** | 5.x | Fetching, cache et synchronisation des données serveur |
| **Zustand** | 5.x | État global client (authentification) |
| **Axios** | 1.x | Client HTTP avec intercepteurs |
| **Recharts** | 3.x | Graphiques (AreaChart des transactions) |
| **Sonner** | 2.x | Notifications toast |
| **Lucide React** | 1.x | Icônes SVG |
| **shadcn/ui** | 4.x | Composants UI de base (Badge, Button, etc.) |

---

## 3. Architecture du projet

```
trackpay-admin/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Groupe de routes publiques
│   │   └── login/page.tsx      # Page de connexion
│   ├── (dashboard)/            # Groupe de routes protégées
│   │   ├── layout.tsx          # Layout avec sidebar
│   │   ├── dashboard/          # Page principale
│   │   ├── commercants/        # Liste + détail marchands
│   │   ├── transactions/       # Historique transactions
│   │   ├── abonnements/        # Gestion abonnements
│   │   └── kyc/                # Vérification KYC
│   ├── globals.css             # Styles globaux + thème
│   ├── layout.tsx              # Root layout (font, metadata)
│   └── providers.tsx           # QueryClientProvider + Sonner
│
├── components/                 # Composants réutilisables
│   ├── layout/                 # Sidebar, Header
│   ├── dashboard/              # StatsCards, TransactionsChart
│   ├── commercants/            # CommercantsTable, EditModal, StatusToggle
│   ├── transactions/           # TransactionsTable, Badges
│   └── shared/                 # Pagination, ErrorState, LoadingSkeleton
│
├── lib/
│   ├── api/                    # Fonctions d'appel API (axios)
│   │   ├── axios.ts            # Instance axios + intercepteurs
│   │   ├── auth.api.ts         # Login, getMe, logout
│   │   ├── commercants.api.ts  # CRUD marchands
│   │   ├── transactions.api.ts # Lecture transactions
│   │   ├── abonnements.api.ts  # Abonnements + plans
│   │   └── kyc.api.ts          # Validation KYC
│   ├── hooks/                  # Custom hooks React Query
│   │   ├── use-commercants.ts
│   │   ├── use-transactions.ts
│   │   ├── use-abonnements.ts
│   │   ├── use-dashboard.ts
│   │   └── use-kyc.ts
│   ├── store/
│   │   └── auth.store.ts       # Store Zustand (user, tokens)
│   ├── types/                  # Interfaces TypeScript
│   │   ├── user.types.ts
│   │   ├── transaction.types.ts
│   │   └── abonnement.types.ts
│   └── utils/
│       ├── cn.ts               # Fusion de classes Tailwind
│       └── format.ts           # Formatage montants/dates
│
├── proxy.ts                    # Middleware Next.js (protection routes)
├── next.config.ts              # Configuration Next.js
└── .env.local                  # Variables d'environnement
```

### Principe de séparation des responsabilités

```
Page → Hook → Fonction API → Axios → Backend Django
  ↑       ↑         ↑
  UI   Cache     HTTP + intercepteurs
       (React Query)
```

Chaque couche a un rôle précis :
- **Page** : affichage et interactions utilisateur
- **Hook** : cache, états de chargement/erreur, invalidation
- **Fonction API** : construction de la requête HTTP
- **Axios** : injection du token, désenveloppement des réponses

---

## 4. Authentification & Sécurité

### Flux de connexion (JWT)

```
1. POST /auth/login/  →  { access: "eyJ...", refresh: "eyJ..." }
2. GET  /auth/me/     →  { id, email, role: "admin", ... }
3. Vérification role === "admin"  (accès refusé si role !== "admin")
4. Stockage tokens :
   - Zustand store (mémoire vive)
   - localStorage via middleware persist (survie au refresh)
   - Cookie HTTP (lu par le middleware Next.js côté serveur)
```

### Tokens JWT — Deux tokens complémentaires

| Token | Durée de vie | Rôle |
|---|---|---|
| `access_token` | Court (~1h) | Authentifie chaque requête API (`Authorization: Bearer ...`) |
| `refresh_token` | Long (~7 jours) | Renouvelle l'access token sans se reconnecter |

**Pourquoi deux tokens ?** Si l'access token est volé, il expire rapidement. Le refresh token, plus long, ne circule qu'une fois par heure.

### Problème rencontré et solution : timing du token

Au départ, `getMe()` était appelé juste après le login, mais le token n'était pas encore dans le localStorage (Zustand persist est asynchrone). La requête partait sans header Authorization → 401.

**Solution finale** : contourner l'intercepteur axios pour l'appel post-login en utilisant l'instance axios brute :

```typescript
// lib/api/auth.api.ts
export async function getMe(token?: string): Promise<User> {
  if (token) {
    // Appel direct avec axios (bypasse l'intercepteur) après login
    const { data } = await axios.get<ApiResponse<User>>(`${BASE_URL}/auth/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data.data  // désenveloppement manuel
  }
  // Appel normal via l'instance api (intercepteur actif) pour les autres cas
  const { data } = await api.get<User>('/auth/me/')
  return data
}
```

### Intercepteur de renouvellement automatique du token

```typescript
// lib/api/axios.ts
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true  // évite la boucle infinie
      // 1. Récupère le refresh token depuis Zustand/localStorage
      // 2. Appelle POST /auth/token/refresh/
      // 3. Met à jour le store avec le nouveau access token
      // 4. Rejoue la requête originale automatiquement
    }
    // Si le refresh échoue → logout + redirect /login
  }
)
```

### Protection des routes — Middleware Next.js

```typescript
// proxy.ts — s'exécute côté SERVEUR avant chaque chargement de page
export function proxy(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value
  if (!token && !isPublicRoute) → redirect('/login')
  if (token && isLoginPage)    → redirect('/dashboard')
}
```

Double sécurité :
1. **Serveur** : le middleware vérifie le cookie avant de servir la page
2. **Client** : l'intercepteur axios envoie le JWT et gère les 401

---

## 5. Gestion des données — TanStack Query

**TanStack Query** (anciennement React Query) gère tout le cycle de vie des données serveur : fetching, cache, rechargement, états loading/error.

### Sans vs Avec TanStack Query

```typescript
// ❌ Sans TanStack Query — 15 lignes pour une simple liste
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)
useEffect(() => {
  setLoading(true)
  fetch('/api/commercants')
    .then(r => r.json())
    .then(d => { setData(d); setLoading(false) })
    .catch(e => { setError(e); setLoading(false) })
}, [])

// ✅ Avec TanStack Query — 1 ligne, plus de fonctionnalités
const { data, isLoading, isError, refetch } = useCommercants({ page: 1 })
```

### Concepts clés

**`queryKey`** — identifiant unique du cache. Tout changement de clé déclenche un rechargement.
```typescript
queryKey: ['commercants', { page: 1, search: 'teyeb', kyc_status: 'pending' }]
// Chaque combinaison de filtres a son propre cache indépendant
```

**`useMutation`** — pour les opérations d'écriture (POST, PATCH, DELETE).
```typescript
const { mutate, isPending } = useMutation({
  mutationFn: (id: number) => suspendreCommercant(id),
  onSuccess: (_, id) => {
    // Invalide le cache → les composants affichant la liste se rechargent
    queryClient.invalidateQueries({ queryKey: ['commercants'] })
    queryClient.invalidateQueries({ queryKey: ['commercant', id] })
  }
})
```

**Cache & Invalidation** — Quand on modifie un marchand, on invalide son cache. TanStack Query refetch automatiquement les composants abonnés à ce cache.

**`enabled`** — évite les requêtes prématurées :
```typescript
useQuery({
  queryKey: ['commercant', id],
  queryFn: () => getCommercantDetail(id),
  enabled: !!id,  // ne lance la requête que si id est défini
})
```

**`refetchInterval`** — Le dashboard se recharge toutes les 60 secondes :
```typescript
useQuery({ ..., refetchInterval: 60_000 })
```

---

## 6. Gestion de l'état global — Zustand

**Zustand** stocke l'état de session (utilisateur connecté, tokens JWT).

```typescript
// lib/store/auth.store.ts
const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, access, refresh) =>
        set({ user, accessToken: access, refreshToken: refresh }),
      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null }),
      isAuthenticated: () =>
        !!get().accessToken && get().user?.role === 'admin',
    }),
    { name: 'trackpay-admin-auth' }  // clé dans localStorage
  )
)
```

**Middleware `persist`** — Sérialise automatiquement le store dans `localStorage` sous la clé `trackpay-admin-auth`. La session survit aux rechargements de page.

### Zustand vs TanStack Query — Quand utiliser lequel ?

| | Zustand | TanStack Query |
|---|---|---|
| **Type de données** | État CLIENT (session, UI) | Données SERVEUR (API) |
| **Exemples** | Utilisateur connecté, tokens, préférences | Liste marchands, transactions, abonnements |
| **Persistance** | localStorage (via persist middleware) | Cache mémoire (TTL configurable) |
| **Source de vérité** | Le frontend | Le backend |

### Zustand vs Redux (Context API)

Zustand est choisi plutôt que Redux car :
- Beaucoup moins de boilerplate (pas d'actions, reducers, dispatch)
- Composants ne se re-rendent que si les données qu'ils consomment changent
- Plus simple à utiliser que le Context API de React pour l'état global

---

## 7. Couche API — Axios

### Instance centralisée

```typescript
// lib/api/axios.ts
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,  // https://config-ap28-1mhk.onrender.com/api/v1
  headers: { 'Content-Type': 'application/json' },
})
```

Toutes les fonctions API utilisent cette instance → un seul endroit pour changer l'URL ou les headers globaux.

### Intercepteur de requête — Injection automatique du token

```typescript
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('trackpay-admin-auth')
    if (stored) {
      const { state } = JSON.parse(stored)
      if (state?.accessToken) {
        config.headers.Authorization = `Bearer ${state.accessToken}`
      }
    }
  }
  return config
})
```

**Principe** : Avant chaque requête, le token JWT est automatiquement injecté dans le header `Authorization`. Les fonctions API n'ont pas à s'en soucier.

### Intercepteur de réponse — Désenveloppement API (envelope pattern)

L'API Django enveloppe **toutes** ses réponses dans ce format :
```json
{ "success": true, "message": "Succès", "data": { "id": 1, "nom": "..." } }
```

Sans intercepteur, chaque appel devrait faire `.data.data`. L'intercepteur extrait automatiquement la propriété `data` :

```typescript
api.interceptors.response.use((res) => {
  if (res.data && typeof res.data === 'object'
      && 'data' in res.data && 'success' in res.data) {
    res.data = res.data.data  // unwrap automatique
  }
  return res
})
```

**Avantage** : Les fonctions API reçoivent directement l'objet métier :
```typescript
// Sans intercepteur :
const { data } = await api.get('/auth/users/1/')
const user = data.data  // ← obligatoire

// Avec intercepteur :
const { data } = await api.get('/auth/users/1/')
const user = data  // ← data EST déjà l'objet user
```

---

## 8. Routing — Next.js App Router

### Route Groups `(auth)` et `(dashboard)`

Les parenthèses `()` créent des **groupes logiques** sans affecter l'URL :
```
app/(auth)/login          → URL finale : /login
app/(dashboard)/commercants → URL finale : /commercants
```

Chaque groupe peut avoir son propre `layout.tsx`, ce qui permet d'avoir :
- Le layout de connexion (page centrée, pas de sidebar) pour `(auth)`
- Le layout dashboard (avec sidebar) pour `(dashboard)`

### Layouts imbriqués

```
RootLayout (app/layout.tsx)           ← font, metadata globale
└── DashboardLayout ((dashboard)/layout.tsx)  ← sidebar + zone principale
    └── Page spécifique               ← contenu de la page
```

### Routes dynamiques `[id]`

```
app/(dashboard)/commercants/[id]/page.tsx
```

`[id]` capture le segment de l'URL. Ex : `/commercants/42` → `id = "42"`.

**Changement Next.js 16** : `params` est désormais une `Promise` (breaking change vs Next.js 14). Il faut utiliser `use()` de React 19 :

```typescript
// Next.js 16 + React 19
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)  // use() déballe la Promise de manière synchrone
  const numId = Number(id)
  // ...
}
```

### Directive `'use client'`

Next.js rend les composants côté **serveur par défaut** (Server Components — pas de JavaScript envoyé au navigateur). La directive `'use client'` est nécessaire pour :
- Utiliser des hooks React (`useState`, `useEffect`, `use`)
- Accéder aux APIs du navigateur (`localStorage`, `document`)
- Utiliser TanStack Query, Zustand, Sonner
- Gérer les interactions (formulaires, boutons)

---

## 9. Interface utilisateur — TailwindCSS & Composants

### TailwindCSS 4 — Approche utility-first

Tailwind évite d'écrire des fichiers CSS séparés. Les styles sont directement dans les classes JSX :

```tsx
<div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
```

**Avantages** :
- Pas de conflits de noms CSS
- Styles visibles directement dans le composant
- Purge automatique : seules les classes utilisées sont incluses en production
- Design system cohérent via une palette de couleurs limitée

### Palette de couleurs du projet

| Usage | Couleur |
|---|---|
| Fond sidebar | `slate-900` |
| Fond page | `slate-50` |
| Accent principal | `indigo-500` / `indigo-600` |
| Succès | `emerald-500` / `green` |
| Avertissement | `amber-400` / `yellow` |
| Erreur | `red-500` |
| Neutre | `slate-400` / `slate-500` |

### Fonction `cn()` — Classes conditionnelles sans conflits

```typescript
// lib/utils/cn.ts — combine clsx + tailwind-merge
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
```

```tsx
// Usage : classes conditionnelles propres
<span className={cn(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
  isActive && 'bg-emerald-50 text-emerald-700',
  !isActive && 'bg-red-50 text-red-600'
)}>
```

`twMerge` évite les conflits (ex: `bg-red-500 bg-blue-500` → garde seulement `bg-blue-500`).

### shadcn/ui — Composants de base

shadcn/ui fournit des composants accessibles (Badge, Button, Skeleton...) basés sur Radix UI. Le code source est **copié dans le projet** (dans `components/ui/`) → modifiable directement, pas une dépendance externe figée.

### Recharts — Graphiques

Le dashboard utilise un `AreaChart` avec dégradés pour visualiser les volumes de transactions :

```tsx
<AreaChart data={chartData}>
  <defs>
    <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
    </linearGradient>
  </defs>
  <Area type="monotone" dataKey="success" fill="url(#colorSuccess)" stroke="#10b981" />
</AreaChart>
```

---

## 10. TypeScript — Typage fort

### Interfaces métier

```typescript
// lib/types/user.types.ts
export interface User {
  id: number
  email: string
  role: 'commercant' | 'admin'   // union type — uniquement ces deux valeurs
  kyc_status: 'pending' | 'verified' | 'failed'
  is_active: boolean
  is_verified: boolean
  created_at: string
}

export interface CommercantDetail extends User {  // héritage d'interface
  wallet: { balance: string; currency: string; is_active: boolean } | null  // nullable
  abonnement: { plan: string; statut: string; date_expiration: string | null; auto_renouvellement: boolean } | null
  kyc: { kyc_id: string; nni: string; nom_fr: string; confidence: number; face_verified: boolean; created_at: string } | null
  nb_comptes: number
  nb_transactions: number
}
```

### Génériques (Generics) — Type réutilisable

```typescript
// Un seul type pour toutes les réponses paginées Django REST Framework
export interface PaginatedResponse<T> {
  count: number          // total d'items dans la base
  next: string | null    // URL de la page suivante
  previous: string | null
  results: T[]           // T = le type des items
}

// Réutilisé pour User, Transaction, Abonnement...
const response: PaginatedResponse<User> = await getCommercants()
const response: PaginatedResponse<Transaction> = await getAllTransactions()
```

### Union types — Valeurs limitées

```typescript
type TransactionType = 'interne' | 'externe' | 'chargement'
type TransactionStatut = 'success' | 'pending' | 'failed' | 'cancelled'

// TypeScript empêchera toute valeur non-listée à la compilation
```

### `Partial<Pick<...>>` — Type utilitaire pour les mises à jour partielles

```typescript
async function updateCommercant(
  id: number,
  payload: Partial<Pick<User, 'nom' | 'telephone' | 'adresse'>>
  // Partial = tous les champs sont optionnels
  // Pick = uniquement ces 3 champs de l'interface User
): Promise<User>
```

---

## 11. Fonctionnalités implémentées

### Dashboard
- Cartes de statistiques (total marchands, total transactions, revenus estimés)
- Graphique en aires des transactions par statut (succès, en attente, échouées)
- Liste des 8 dernières transactions avec badges colorés
- Rechargement automatique toutes les 60 secondes

### Gestion des Marchands — CRUD complet
| Action | Méthode HTTP | Endpoint |
|---|---|---|
| Lister | GET | `/auth/users/?page=1&search=...&kyc_status=...` |
| Détailler | GET | `/auth/users/{id}/detail/` (fallback sur `/auth/users/{id}/`) |
| Modifier | PATCH | `/auth/users/{id}/` |
| Suspendre | POST | `/auth/users/{id}/suspendre/` |
| Activer | POST | `/auth/users/{id}/activer/` |
| Supprimer | DELETE | `/auth/users/{id}/` |

- Recherche en temps réel par nom/email
- Filtre par statut KYC
- Pagination
- Modal d'édition avec backdrop blur
- Bouton supprimer avec double confirmation (UX anti-erreur)
- Page de détail : infos + wallet + abonnement + KYC + actions

### KYC
- Vue filtrée par statut (En attente / Vérifiés / Échoués)
- Compteurs cliquables comme filtres actifs
- Validation KYC inline dans le tableau et sur la page de détail

### Transactions
- Historique paginé
- Filtres cumulables : type (interne/externe/chargement) + statut (success/pending/failed/cancelled)
- Badges colorés sémantiques

### Abonnements
- Liste paginée avec plan et statut
- Affichage du renouvellement automatique
- Gestion du format de l'API : `plan` est un objet `{id, type, prix_mensuel, ...}`, pas une chaîne

---

## 12. Variables d'environnement

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://config-ap28-1mhk.onrender.com/api/v1
```

**Le préfixe `NEXT_PUBLIC_`** expose la variable côté **navigateur** (client bundle). Sans ce préfixe, la variable n'est accessible que côté serveur Node.js (process.env) et serait `undefined` dans le navigateur.

---

## 13. Lancer le projet

```bash
# 1. Installer les dépendances
npm install

# 2. Créer le fichier d'environnement
cp .env.example .env.local
# Renseigner NEXT_PUBLIC_API_URL

# 3. Démarrer en développement (avec Turbopack)
npm run dev
# → http://localhost:3000

# 4. Build de production
npm run build
npm run start
```

### Prérequis
- Node.js 18+
- Un compte avec `role = "admin"` dans la base de données backend
- Le backend Django doit être accessible (Render.com ou instance locale)

---

## 14. Questions fréquentes jury

**Q : Pourquoi Next.js et pas React pur (Vite) ?**  
→ Next.js apporte le routing intégré (App Router avec layouts imbriqués), le middleware serveur pour la protection des routes, l'optimisation automatique des fonts et images, et une structure de projet conventionnelle. React pur aurait nécessité React Router, une configuration Vite, et une gestion manuelle des layouts.

**Q : Pourquoi TanStack Query pour les données serveur ?**  
→ Il gère automatiquement les états `loading/error/data` sans `useEffect`, offre un cache intelligent (stale-while-revalidate : les données s'affichent immédiatement depuis le cache pendant le rechargement en arrière-plan), et synchronise les données après chaque mutation (`invalidateQueries`).

**Q : Pourquoi Zustand et pas le Context API de React ?**  
→ Le Context API re-rend tous les composants enfants à chaque changement d'état. Zustand est sélectif : un composant ne se re-rend que si les données précises qu'il consomme changent. Il est aussi beaucoup plus simple que Redux (pas d'actions, pas de reducers, pas de dispatch).

**Q : Comment fonctionne la sécurité de l'application ?**  
→ Deux niveaux : (1) côté **serveur**, le middleware Next.js (`proxy.ts`) vérifie le cookie `access_token` avant de servir chaque page protégée — si absent, redirect vers `/login` ; (2) côté **client**, l'intercepteur Axios injecte automatiquement le JWT Bearer token dans chaque requête API.

**Q : Qu'est-ce qu'un intercepteur Axios ?**  
→ C'est un middleware HTTP : une fonction qui s'exécute automatiquement avant chaque requête sortante (request interceptor — injection du token) ou après chaque réponse reçue (response interceptor — désenveloppement du format API, gestion des 401). Les fonctions API individuelles n'ont pas à gérer ces aspects transversaux.

**Q : Qu'est-ce que le JWT ?**  
→ JSON Web Token — un token signé cryptographiquement qui encode les informations de l'utilisateur (id, role, expiration). Le serveur peut vérifier sa validité sans interroger la base de données à chaque requête.

**Q : Pourquoi TypeScript plutôt que JavaScript ?**  
→ TypeScript détecte les erreurs à la compilation plutôt qu'à l'exécution. Dans ce projet, cela a permis de typer précisément les réponses API (`PaginatedResponse<T>`, les union types pour les statuts), d'avoir l'autocomplétion dans l'éditeur, et d'éviter des bugs comme accéder à une propriété inexistante sur un objet `null`.

**Q : Comment avez-vous géré les erreurs API ?**  
→ Pattern défensif à plusieurs niveaux : (1) intercepteur Axios pour les erreurs 401 (refresh auto) ; (2) `try/catch` avec fallback sur les endpoints inexistants (ex: `/detail/` → `/`); (3) `isError` + composant `ErrorState` avec bouton "Réessayer" dans chaque page ; (4) toasts `sonner` pour le feedback des mutations.
