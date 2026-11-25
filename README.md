# Fashio Listing Helper (browser extension)

Single purpose: help fashion sellers check and prepare product listings.

- **Images tab:** finds the large images and the JSON-LD Product images on the open product page and checks each one against the chosen marketplace. It reads size, ratio and served file size, and checks the main image for a white background and how much of the frame the product fills (an estimate). It flags missing alt text and product-data images that return an HTTP error. Pixels are read by the background script: the tab's own origin is covered by activeTab, and CDN images need the optional `<all_urls>` permission ("Allow image reading"). If neither applies, the image is marked "can't read".
- **Listing text tab:** title / page title / meta description / structured-data description with lengths, checked against the marketplace's published limits.
- **Size chart builder** (`sizechart.html`): women's US/UK/EU/FR/IT/JP or men's UK/EU/IT/FR/JP, cm or inch, editable measurements, copy HTML or CSV, or download CSV. The data is copied from the site's `utils/sizeCharts.ts` so both stay identical.
- **Right-click on an image → "Create an on-model photo with Fashio":** opens the localised model-generator page. Nothing is uploaded and nothing is generated for free.

It does NOT guess whether a photo is on-model or a flat lay.

## Marketplace numbers (read 2026-11-25)
| Marketplace | Rules used | Source |
|---|---|---|
| Amazon | rules: longest side ≥1000 px (zoom), main image pure white. Shown as "commonly cited — confirm in Seller Central": 1600+ px, product fills ~85% | Amazon Seller Forums post (help page G1881 needs login) |
| Etsy | first photo ≥635 px wide and tall, recommended ≥2000 px, title ≤140 chars | help.etsy.com 115015663347, 115015628707 |
| Shopify | ≤5000×5000 px / 25 MP, <20 MB, 2048×2048 recommended for square images, SEO title ≤70 (60 recommended), meta description ~160 | help.shopify.com product-media-types, seo/adding-keywords |
| eBay | ≥500 px on the longest side, ~1600 recommended, uploads ≤12 MB, title ≤80 chars | ebay.com/help picture-policy 4370, adding-pictures 4148, developer.ebay.com listing-title |
| Zalando | ratio 1:1.44, min 762×1100, best 1801×2600, ≤20 MB | partner.zalando.com zalando-image-guidelines |

## Gaps
- **Trendyol:** left out. The Seller Academy pages are rendered by JavaScript and couldn't be read. A search snippet says 600×800 minimum and 10 MB, but that wasn't confirmed on the page.
- **Amazon:** the official help page is behind a login, so the numbers come from an Amazon-hosted forum post whose author couldn't be confirmed.
- Amazon and Zalando have no published title-length rule in these sources, so lengths are shown without a pass/fail.

## Build / check
`npm run check` (tsc + build + `web-ext lint`). Outputs `dist/{chrome,firefox}` + zips. Chrome zip → Chrome Web Store, Edge, Opera.
E2E: `cd test/site && python3 -m http.server 8767`, then `node test/e2e.mjs dist/chrome http://localhost:8767/` (needs `playwright` + Playwright Chromium).
