# Store listing — Fashio Listing Helper

Upload: `dist/fashio-extension-chrome-<v>.zip` → Chrome Web Store, Edge Add-ons (same zip; Opera installs from CWS).
`dist/fashio-extension-firefox-<v>.zip` → addons.mozilla.org (readable, unminified bundle; if source is asked for,
upload this repo without node_modules/dist + "npm ci && npm run build").

## Name
Fashio Listing Helper for Fashion Sellers  (localised in _locales/*/messages.json: en, de, es, fr, it, pt_BR, pt_PT, tr)

## Summary (≤132)
Check product photos against marketplace image rules, review listing text length and build size charts for clothing listings.

## Category
Chrome: Tools (alt: Shopping) · Edge: Productivity · Firefox: Other / Shopping

## Description
For people who sell clothing online: check a listing's photos and text before buyers — and marketplace reviewers — see it.

IMAGE CHECKS
• Open any product page — your own store, a draft preview or a live listing — and click the Fashio icon.
• Every large product photo is listed with its pixel size, aspect ratio and file size.
• Pick a marketplace (Amazon, Etsy, Shopify, eBay, Zalando) and each image is checked against that marketplace's published image guidance: minimum and recommended sizes, maximum dimensions, aspect ratio, file size.
• The main image is checked for a white background and how much of the frame the product fills.
• Finds images that are listed in the product's structured data but return an error, and photos with no alt text.
• Click a thumbnail to jump to the image on the page.
• Each rule links to the marketplace help page it came from, so you can confirm it there.

LISTING TEXT
• Product title, page title, meta description and the structured-data description, each with its character count.
• Checked against the published limits where the marketplace gives one (for example Etsy and eBay title limits, Shopify search title and meta description).

SIZE CHART BUILDER
• Women's US / UK / EU / FR / IT / JP or men's UK / EU / IT / FR / JP sizes.
• Bust, waist and hip (or chest, waist and neck) in cm or inches — every measurement cell is editable, so you can put in your garment's real measurements.
• Copy as HTML code for your product description, copy as CSV or download a CSV file.

ON-MODEL PHOTOS
• Right-click any product image → "Create an on-model photo with Fashio" opens Fashio's on-model photo tool on fashiolabs.com. The extension itself uploads nothing.

GOOD TO KNOW
• Checks run on the image files the page serves. Stores often resize photos, so your original upload may be larger.
• Some marketplace rules are only published inside seller accounts; where a number is commonly cited but not on a public help page, the extension says so and asks you to confirm it in your seller dashboard.
• Size conversions are standard ready-to-wear conversions; brands vary by up to a full size. Replace them with your garment's own measurements.

PRIVACY
No account, no analytics, no tracking. Pages and images are read inside your browser and nothing is sent to Fashio or anyone else. The only thing stored is your chosen marketplace.

Made by Fashio — AI fashion model photos for e-commerce, fashiolabs.com.

## Single purpose (CWS field)
Help fashion sellers check and prepare product listings: audit a product page's images and text against marketplace guidance and build a size chart for the listing.

## Permission justifications (paste each into its own CWS field)

**activeTab**
Read the product page the user is on when they click the toolbar icon (image list, title, description).

**scripting**
Inject the read-only collector script into that page and briefly outline an image when the user asks where it is.

**storage**
Remember the selected marketplace.

**contextMenus**
"Create an on-model photo with Fashio" on images (opens fashiolabs.com) and "Size chart builder" on the toolbar icon.

**optional host permission <all_urls>**
Requested only when the user clicks "Allow image reading", so product images hosted on a different server (store CDNs) can be read for size, file size and background checks. Never requested automatically.

**Remote code**
No. All code is in the package.

## Data usage (CWS privacy tab)
Collects nothing — tick none of the data types. Page content and images are processed locally and never transmitted.
Certify: not sold to third parties, not used for purposes unrelated to the single purpose, not used for creditworthiness or lending.
Privacy policy URL: https://fashiolabs.com/extension#privacy  (section must exist on the landing page before submission)

Firefox data_collection_permissions: required ["none"] (already in the Firefox manifest).

## Assets
- Icon 128: static/icons/128.png
- Screenshots 1280×800: store/screenshot-1-amazon-image-audit.png, -2-zalando-ratio, -3-listing-text, -4-size-chart, -5-on-model
- Small promo tile 440×280: store/promo-small-440x280.png
- Homepage: https://fashiolabs.com/extension
- Regenerate: serve test/site on :8767, then `node test/store.mjs dist/chrome http://localhost:8767/ store`

## Before submitting
- fashiolabs.com/extension landing (install/uninstall URLs + #privacy) must be live.
- Marketplace numbers re-checked on the source pages listed in src/specs.ts (read 2026-11-25).


## CWS panel — every field, in panel order
Nothing on this list is optional to check; fields marked (leave empty) really stay empty.

### Package
Upload `dist/fashio-extension-chrome-<version>.zip`.

### Store listing
- Description: "Description" section above (paste as-is).
- Category: Tools (Chrome: "Tools"; Edge: "Productivity")
- Language: English (other languages come from _locales automatically).
- Store icon: static/icons/128.png
- Screenshots: every store/screenshot-*.png (1280×800), in file-name order.
- Small promo tile: store/promo-small-440x280.png
- Marquee promo tile, promo video: (leave empty)
- Official URL: https://fashiolabs.com (shows only after the domain is verified in Search Console with this same Google account)
- Homepage URL: https://fashiolabs.com/extension
- Support URL: https://fashiolabs.com/extension
- Mature content: No

### Privacy
- Single purpose: "Single purpose" section above.
- Permission justifications: one field per permission, text from "Permission justifications" above.
- Are you using remote code? **No** (justification field: leave empty)
- Data usage — "What user data do you plan to collect?": tick **none** of the 9 boxes
  (personally identifiable, health, financial/payment, authentication, personal communications,
  location, web history, user activity, website content). Reading the open page or camera
  locally is not "collecting": nothing leaves the browser.
- Data usage — tick **all 3** certifications (not sold/transferred, not used for unrelated
  purposes, not used for creditworthiness/lending).
- Privacy policy URL: https://fashiolabs.com/extension#privacy (must be live before "Submit for review")

### Distribution
- Payments: Free (no in-app purchases)
- Visibility: Public
- Regions: All regions

### Test instructions
- Doesn't need one. Open any product page (e.g. a shop listing), click the toolbar icon, pick a marketplace preset; the image audit and listing text checks run on that page. The size chart builder is in the popup.
- Username / password: (leave empty)

### Account (once per developer account)
- Trader declaration: non-trader (user's decision 2026-11-25)
- Publisher display name: brand name; verify the contact email.

## 1.0.1 update — panel steps (Chrome Web Store)
Do this only after 1.0.0 is approved (a new upload restarts review).

1. Package → **Upload new package** → `dist/fashio-extension-chrome-1.0.1.zip`.
   Name and summary come from the zip (`_locales`), nothing to type.
2. Store listing → language dropdown → for each language below, paste the whole file into **Description**:

| Listing language | Paste file |
|---|---|
| English (default) | `store/descriptions/en.md` |
| German | `store/descriptions/de.md` |
| Spanish | `store/descriptions/es.md` |
| French | `store/descriptions/fr.md` |
| Italian | `store/descriptions/it.md` |
| Portuguese (Brazil) | `store/descriptions/pt_BR.md` |
| Portuguese (Portugal) | `store/descriptions/pt_PT.md` |
| Turkish | `store/descriptions/tr.md` |

   Screenshots, icon and promo tile can stay the same in every language.
3. Privacy tab: unchanged (the new "rate it" reminder stores only dates on the user's device; nothing is collected).
4. **Submit for review**.

### What changed in 1.0.1
- Store name and summary per language now carry the searched terms (table below).
- Popup shows a one-time "rate it" box after the extension was opened on 5 different days; "Not now" hides it for good. No incentive. Chrome → CWS reviews page, Edge → Edge Add-ons page, Firefox → hidden until `AMO_URL` in `src/rate.ts` is filled in.

### Names, summaries and the searches behind them (Google Ads monthly volume, 2026-11-25)
| Locale | Name (≤75) | Main terms (volume, market) |
|---|---|---|
| en | Fashio: Image Size Checker & Size Chart Maker | image size checker 1,900 · image resolution checker 590 · size chart generator 260 · size chart maker 110 (US) |
| de | Fashio: Bildgröße prüfen & Größentabelle erstellen | größentabelle 12,100 · bildgröße 1,900 · größentabelle kleidung 590 (DE) |
| es | Fashio: tamaño de imagen y tabla de tallas | tabla de tallas 390 · tamaño de imagen 320 (ES) |
| fr | Fashio : taille d'image et guide des tailles | guide des tailles 3,600 · taille image 720 · tableau des tailles 590 (FR) |
| it | Fashio: dimensione immagine e tabella taglie | tabella taglie 720 · dimensione immagine 590 (IT) |
| pt_BR | Fashio: tamanho de imagem e tabela de medidas | tabela de medidas 6,600 · tabela de tamanhos 1,600 · tamanho de imagem 1,600 (BR) |
| pt_PT | Fashio: tamanho de imagem e tabela de tamanhos | tabela de medidas 110 · tabela de tamanhos 90 · tamanho de imagem 70 (PT) |
| tr | Fashio: Görsel Boyutu Kontrolü ve Beden Tablosu | beden tablosu 8,100 · görsel boyutu 70 (TR) |

Marketplace-specific phrases are tiny (amazon image checker 10, etsy listing helper 30, amazon seller chrome extension 30 in the US),
so marketplace names stay out of the name and summary. They appear in the description once, as the presets the tool really has,
with a "trademarks of their owners, not affiliated" line — CWS treats lists of brand names as keyword spam and brand names in a
title as possible impersonation. "trendyol görsel boyutu" (320, TR) is not used: there is no Trendyol preset.

## Microsoft Edge Add-ons (Partner Center) — every field
Panel: https://partner.microsoft.com/dashboard/microsoftedge → **Create new extension**.

### Packages
- Upload `dist/fashio-extension-chrome-1.0.1.zip` (same zip as Chrome).

### Availability
- Visibility: **Public**
- Markets: **All markets**

### Properties
- Category: **Productivity** (alt: Shopping)
- Privacy policy: **Yes, this extension has a privacy policy** → `https://fashiolabs.com/extension#privacy`
- Website URL: `https://fashiolabs.com/extension`
- Support contact details: `https://fashiolabs.com/extension`
- Mature content: **No**

### Store listings (one per language; languages come from the zip's `_locales`)
Assets, same for every language:
- Extension Store logo (300×300): `store/edge-logo-300x300.png`
- Small promotional tile (440×280): `store/promo-small-440x280.png`
- Screenshots (1280×800): `store/screenshot-1 … 5`
- Large promotional tile, YouTube video: leave empty

Description (250–10,000 characters): paste the file from the table in the CWS section (`store/descriptions/<locale>.md`).
Short description: paste that language's summary (same text as the extension description below).

Search terms (max 7 terms, ≤30 characters each, ≤21 words in total):

| Language | Short description | Search terms (one per box) |
|---|---|---|
| English | Image size checker for product photos: resolution, ratio and white background vs marketplace rules, plus a size chart maker. | image size checker · image resolution checker · size chart maker · size chart generator · product photo checker · listing text length · clothing seller tools |
| German | Bildgröße von Produktfotos prüfen: Auflösung, Seitenverhältnis, weißer Hintergrund nach Marktplatz-Regeln. Plus Größentabelle. | bildgröße prüfen · größentabelle erstellen · größentabelle kleidung · bildauflösung prüfen · produktfotos prüfen · maßtabelle · händler tools |
| Spanish | Comprueba el tamaño de imagen, la resolución y el fondo blanco de tus fotos de producto y crea la tabla de tallas del anuncio. | tamaño de imagen · tabla de tallas · crear tabla de tallas · resolución de imagen · fotos de producto · vender ropa online · herramientas vendedor |
| French | Vérifiez la taille d'image, la résolution et le fond blanc de vos photos produit, et créez le guide des tailles de l'annonce. | taille image · guide des tailles · tableau des tailles · résolution image · photos produit · vendre vêtements · outils vendeur |
| Italian | Controlla dimensione immagine, risoluzione e sfondo bianco delle foto prodotto e crea la tabella taglie dell'annuncio. | dimensione immagine · tabella taglie · risoluzione immagine · foto prodotto · vendere abbigliamento · strumenti venditori |
| Portuguese (Brazil) | Confira tamanho de imagem, resolução e fundo branco das fotos de produto e monte a tabela de medidas do anúncio. | tamanho de imagem · tabela de medidas · tabela de tamanhos · resolução de imagem · fotos de produto · vender roupa online · ferramentas vendedor |
| Portuguese (Portugal) | Verifique o tamanho de imagem, a resolução e o fundo branco das fotografias de produto e crie a tabela de tamanhos do anúncio. | tamanho de imagem · tabela de tamanhos · tabela de medidas · resolução de imagem · fotografias de produto · vender roupa online |
| Turkish | Ürün fotoğraflarında görsel boyutu, çözünürlük ve beyaz arka planı kontrol et; ilan için beden tablosu oluştur. | beden tablosu · beden tablosu oluşturma · görsel boyutu · görsel çözünürlüğü · ürün fotoğrafı · giyim satıcısı · e-ticaret araçları |

### Submit → Notes for certification
```
No account or login needed. Open any product page (e.g. a clothing listing in any online shop), click the toolbar icon and pick a marketplace preset: the Images tab lists each product photo with size, ratio and file size checked against that preset; the Listing text tab shows title/description lengths; Tools → Size chart builder opens a local page that builds a size chart (copy HTML/CSV). The optional <all_urls> permission is requested only when the user clicks "Allow image reading", so images on a store CDN can be measured. No data is collected or sent anywhere. Source: https://github.com/fashiolabs/fashio-extension (MIT).
```

## Firefox Add-ons (AMO) — every field
Panel: https://addons.mozilla.org/developers/ → **Submit a New Add-on** → **On this site** (listed).

### Upload
- File: `dist/fashio-extension-firefox-1.0.1.zip`
- Compatible platforms: **Firefox** and **Firefox for Android** (both ticked)
- "Do you need to submit source code?" → **Yes**. Upload `dist/fashio-extension-source-1.0.1.zip`
  (make it with `git archive -o dist/fashio-extension-source-1.0.1.zip v1.0.1` or `HEAD`; the bundle is readable esbuild output, but AMO asks for source whenever a bundler is used).

### Describe add-on (English; other languages via the locale dropdown on the listing's Edit page after submission)
- Name: comes from the zip (`Fashio: Image Size Checker & Size Chart Maker`)
- Add-on URL: `fashio-image-size-checker`
- Summary (≤250): `Image size checker for product photos: resolution, aspect ratio and white background checked against marketplace image rules, listing text length checks, and a size chart maker for clothing listings.`
- Description: paste `store/descriptions/en.md`
- This add-on is experimental: **No** · Requires payment / non-free services: **No** (the extension is free; the on-model tool it links to is a separate website)
- Categories — Firefox: **Shopping** (second, if allowed: Photos, Music & Videos) · Firefox for Android: **Shopping**
- Tags (pick from AMO's list if offered): shopping, productivity
- Support email: `hi@fashiolabs.com` · Support website: `https://fashiolabs.com/extension`
- Homepage: `https://fashiolabs.com/extension`
- License: **MIT License**
- Privacy policy: **Yes** → paste:
  ```
  No data is collected. Pages and images are read inside your browser and nothing is sent to Fashio or anyone else. Stored on your device only: your chosen marketplace and the days you opened the extension (used once to ask whether you want to rate it). Full policy: https://fashiolabs.com/extension#privacy
  ```
- Notes to reviewer:
  ```
  The JS in the package is unminified esbuild output (IIFE bundles of src/*.ts). Source: https://github.com/fashiolabs/fashio-extension (MIT) and the attached source zip. Build: Node 20+, `npm ci && npm run build` → dist/firefox (identical files). No remote code, no network requests except fetching product image URLs the user is viewing to measure their pixel size (only after the user grants the optional <all_urls> permission). Test: open any product page, click the toolbar icon, pick a marketplace preset.
  ```

Localized AMO listing (after submission → Edit Product Page → locale dropdown):

| Locale | Name | Summary | Description |
|---|---|---|---|
| Deutsch | from zip | de summary above | `store/descriptions/de.md` |
| Español | from zip | es summary above | `store/descriptions/es.md` |
| Français | from zip | fr summary above | `store/descriptions/fr.md` |
| Italiano | from zip | it summary above | `store/descriptions/it.md` |
| Português (Brasil) | from zip | pt_BR summary above | `store/descriptions/pt_BR.md` |
| Português (Portugal) | from zip | pt_PT summary above | `store/descriptions/pt_PT.md` |
| Türkçe | from zip | tr summary above | `store/descriptions/tr.md` |

After AMO approval: put the listing URL into `AMO_URL` in `src/rate.ts` so Firefox users also see the rating box (next version).
