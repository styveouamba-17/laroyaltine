# La Royaltine, site de démonstration

Site vitrine et commande en ligne (retrait en boutique) pour la Pâtisserie La Royaltine, Dakar.
Astro 5, prêt pour Vercel. Même base technique que Kotao.

## Lancer en local

```bash
npm install
npm run dev     # http://localhost:4321
```

En local, les commandes sont enregistrées dans `data/commandes.json`.

- Site : `/` (hero, nous trouver, la vitrine et ses prix, gâteaux et bûches sur commande)
- Commande en ligne : `/commander` (panier, jour et heure de retrait, paiement au retrait)
- Espace boutique : `/admin` (mot de passe `demo` par défaut, variable `ADMIN_PASSWORD`) :
  commandes par jour, « Marquer prête », « Marquer retirée », « Annuler »
- API : `GET /api/creneaux?date=AAAA-MM-JJ&delai=jour|48h`, `POST /api/commande`

Les prix et les délais sont recalculés côté serveur à partir du catalogue (le navigateur n'envoie que
les identifiants et les quantités). Une bûche ou un gâteau entier dans le panier impose 48 h de délai.

## Déployer sur Vercel

1. Importer le projet (preset Astro détecté). Laisser « Output Directory » vide.
2. *Storage* → *Create Database* → **Upstash for Redis** → *Connect* au projet
   (ajoute `KV_REST_API_URL` et `KV_REST_API_TOKEN`). Sans Redis, la commande répond
   « momentanément indisponible, appelez-nous ».
3. *Environment Variables* : `ADMIN_PASSWORD`.
4. Redéployer. Domaine personnalisé : l'ajouter dans `security.allowedDomains` (`astro.config.mjs`).

## Où modifier quoi

- Produits, prix, catégories, horaires, téléphones, délais, capacité : `src/lib/royaltine.ts`
- Couleurs et polices : `src/styles/global.css`
- Photos : `public/img/` (les originaux WhatsApp sont dans `royaltineImage/`)

## Vrai / supposé

Réel (Instagram @laroyaltine) : nom, métiers, Dakar, les deux téléphones, les horaires, les catégories
(Noël 2026, pains, viennoiseries, gâteaux glacés, cakes), les six photos.

**À confirmer avec la boutique :**
- Tous les prix, et les produits qui ne sont pas sur les photos (liste complète de la vitrine).
- Délais : 1 h pour la vitrine, 48 h pour gâteaux entiers et bûches ; 8 commandes max par demi-heure.
- Moyens de paiement au retrait (espèces, Wave, Orange Money).
- L'adresse exacte (seul « Dakar » est affiché, le lien carte cherche « Pâtisserie La Royaltine Dakar »).
- Logo en SVG (le site utilise un mot-symbole en script), photos HD (actuelles : WhatsApp ~830 px,
  dont des captures Instagram recadrées), une photo de la boutique et du fournil.
