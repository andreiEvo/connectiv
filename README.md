# connectiv

Rețea socială video-first pentru antreprenori și oameni cu side-hustle-uri din Cluj-Napoca, București, Timișoara și Craiova — un loc pentru construcție și acțiune, nu pentru CV-uri.

**Live demo:** [connectiv-omega.vercel.app](https://connectiv-omega.vercel.app)

## Funcționalități

- **Feed video vertical** (stil TikTok) + **Home** — grid de descoperire globală
- **Story-uri** efemere de 24h, cu inel animat pe poza de profil
- **Autentificare** email/parolă cu politică de parolă și confirmare pe email
- **Mesagerie 1-la-1 în timp real**, pornită din 4 tipuri de acțiuni contextuale (chat, sprijin la tranziție, cafea, colaborare)
- **Reacții** (foc/fulger) și comentarii pe fiecare postare
- **Postări de tip eveniment** cu integrare „adaugă în calendar" (.ics)
- **Conturi de companie** separate de conturile personale
- **Cropper de imagine** (drag + zoom) pentru poză de profil și fundal personalizabil
- **Freemium** cu limită lunară de conversații + upgrade la Master Profile
- **Bilingv** RO/EN, instant, fără reîncărcare de pagină
- **PWA** instalabilă pe telefon
- Layout responsive: sidebar de navigare pe desktop, bară de jos pe mobil

## Stack tehnic

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **Supabase** — Postgres, Auth, Storage, Realtime, Row Level Security
- **Vercel** — hosting + deploy automat, colocat regional cu baza de date
- **Sentry** — monitorizare erori în producție
- **Stripe** — plăți (integrare în curs)
- **Zod** — validare server-side pe toate acțiunile

## Arhitectură

- Server Actions pentru toată logica de scriere (fără endpoint-uri API separate)
- Rate limiting la nivel de bază de date pentru login, înregistrare, mesaje, postări
- RLS (Row Level Security) pe fiecare tabel — accesul la date e impus de Postgres, nu doar de aplicație

## Rulare locală

```bash
npm install
npm run dev
```

Necesită un fișier `.env.local` cu cheile unui proiect Supabase propriu (vezi `.env.local.example`) și migrațiile din `supabase/migrations/` aplicate.
