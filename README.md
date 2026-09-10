# Petite Croix

Mobile product catalogue for indoor LED and neon crosses.

## Catalogue

9 distinct products, with the 3 neon products in their own final section. 49 photo variants with their exact SKU references. 5 product videos with the audio tracks removed.

Each product includes French specifications and packaging information. The interface opens directly on the products. Photos take priority on mobile; technical details and packaging are expandable.

## Files

- `index.html`, `style.css`, `app.js`: the website.
- `catalogue.json`: product details, SKU references and media paths.
- `assets/`: optimized photos, thumbnails and silent MP4 videos.

The supplier workbook and original source folders are kept outside this repository. The site uses only new product names and the supplied SKU references. An unnamed orange Classic 30 photo has been assigned `VAL-classic-30-010`, as approved by the catalogue owner. Obvious repeated dimensions in the source have been normalized using its display-size column and stated depth.

## Run locally

Serve this folder using any static HTTP server, for example `python3 -m http.server 8080`, then open `http://localhost:8080`. A server is needed because the site loads the JSON catalogue.

## Publishing

GitHub Pages serves the root of the `main` branch. All application and asset URLs are relative, so the catalogue works under a repository URL. No build or account is required to browse the site.

To update a specification, edit `catalogue.json`. Add variant images to `assets/` and preserve their SKU names. Videos must have no audio stream.
