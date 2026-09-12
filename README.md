# Canopy Product Configurator

Interactive 3D product configurator (React + TypeScript + R3F) for the Vertical 3D technical assessment.
**Shopify and pricing are mocked.** Services are structured so real APIs can replace them later without rewriting the UI.

## Run

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

## Architecture

```text
Controls / 2D editor
        ↓
  3D preview · pricing · cart · PDF
```

| Layer | Role |
| --- | --- |
| `types/` | Domain contracts (product, configuration, pricing, cart) |
| `data/` | Product variants, colors, mock pricing catalog |
| `store/` | Configuration state + UI/async status |
| `services/` | Pricing, mock Shopify cart, PDF, import/export |
| `components/canvas` | React Three Fiber preview |
| `components/editor` | Konva 2D artwork editor |
| `components/configurator` | Controls and commerce actions |

Domain logic stays out of presentational components. Pricing, cart, and PDF go through services.

## Key technical decisions

**1. One configuration drives 2D and 3D**  
Zustand holds size, colors, sections, text/images, and normalized transforms (`x/y/scale/rotation` in 0–1 space). The 2D editor writes; the 3D view reads. No duplicated design state.

**2. GLBs used as provided**  
Models share `fabric` / `leg*` / `mechanism*` with materials `fabric_Mat`, `Inner_fabric`, and `Metal_mat`. Colors tint cloned materials (cache-safe). Walls are not separate meshes, so wall packages are priced options plus optional wall planes. Branding is a front-panel texture synced from the same offscreen canvas as the 2D editor—a production-style approximation when UV decals aren’t available.

**3. Pricing via a service, not the UI**  
`pricingService` loads a mock catalog and returns a quote (base size + walls + print side + text/logo fees × quantity). Components only render the quote. Swap `fetchPricingCatalog()` for a real HTTP client later.

**4. Mock Shopify cart adapter**  
`shopifyCartService.addToCart()` builds `{ productId, quantity, price, configuration }`. UI → cart service → mock API today; the same seam can target Shopify Storefront API later.

**5. PDF as an order attachment shape**  
`pdfService` generates a production summary (selections, artwork, price, previews) as a client-side blob suitable to attach to an order later.

**6. Reusable product model**  
Abstractions as `ProductDefinition`, `MaterialSlot`, and design elements—not hard-wired only to “tent”—so the shell can support other configurable products.

**7. Performance basics**  
Lazy-loaded 3D canvas, one GLB at a time by size, cloned materials, disposed textures, modest shadows.

## Embed

Static SPA; no top-window assumptions:

```html
<iframe
  src="https://your-configurator-url"
  title="Canopy Configurator"
  style="width:100%;height:900px;border:0"
  allow="fullscreen"
></iframe>
```

## Stack

React 19, TypeScript, Vite, Three.js / R3F / Drei, Zustand, Konva, Tailwind CSS v4, jsPDF, Lucide.
