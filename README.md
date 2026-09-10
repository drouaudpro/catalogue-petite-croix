# Petite Croix

Mobile product catalogue for indoor LED and neon crosses.

## Catalogue

9 distinct products, ordered by size, with the 3 neon products in their own final section. 49 photo variants with their exact SKU references. 5 product videos with the audio tracks removed.

Each product includes French specifications and packaging information, its EXW unit price in RMB, and an indicative EUR conversion. Prices are not landed costs in France. Tax, freight, customs duties and bank fees are excluded from the EUR conversion. The interface opens directly on the products, with no branding header, marketing copy, footer, pricing-information block or audio labels. Photos and prices take priority on mobile; technical details and packaging are expandable.

Conversion: **EUR = RMB / 7.8159**, using the [ECB reference rate for 9 September 2026](https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml). This rate is a dated snapshot and is not refreshed automatically. The ECB daily link changes as new rates are published.

## Files

- `index.html`, `style.css`, `app.js`: the website.
- `catalogue.json`: product details, SKU references, media paths and exchange-rate metadata.
- `assets/`: optimized photos, thumbnails and silent MP4 videos.

The supplier workbook and original source folders are kept outside this repository. The site uses only new product names and the supplied SKU references. An unnamed orange Classic 30 photo has been assigned `VAL-classic-30-010`, as approved by the catalogue owner. Obvious repeated dimensions in the source have been normalized using its display-size column and stated depth.

## Run locally

Serve this folder using any static HTTP server, for example `python3 -m http.server 8080`, then open `http://localhost:8080`. A server is needed because the site loads the JSON catalogue.

## Publishing

GitHub Pages serves the root of the `main` branch. All application and asset URLs are relative, so the catalogue works under a repository URL. No build or account is required to browse the site.

To update a price or specification, edit `catalogue.json`. To change the conversion, update `exchange.rmbPerEuro` and `exchange.date` together. Add variant images to `assets/` and preserve their SKU names. Videos must have no audio stream.
