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

## Permission justifications
- activeTab: read the product page the user is on when they click the toolbar icon (image list, title, description).
- scripting: inject the read-only collector script into that page and briefly outline an image when the user asks where it is.
- storage: remember the selected marketplace.
- contextMenus: "Create an on-model photo with Fashio" on images (opens fashiolabs.com) and "Size chart builder" on the toolbar icon.
- optional host permission <all_urls>: requested only when the user clicks "Allow image reading", so product images hosted on a different server (store CDNs) can be read for size, file size and background checks. Never requested automatically.
- Remote code: No. All code is in the package.

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
