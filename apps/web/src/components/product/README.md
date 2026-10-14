# Product Detail Experience & Routing Architecture

This document explains the routing mechanics, presentation layers, and cart state synchronization for the Product Detail experience in the **AI-Powered Cafe Management System** (`@cafe/web`).

---

## 1. Routing Architecture (Next.js App Router)

The experience leverages Next.js App Router **parallel routes** (`@modal`) and **intercepting routes** (`(.)menu/[slug]`):

```
apps/web/src/app/
├── layout.tsx                     # Injects `{modal}` parallel route slot alongside `{children}`
├── @modal/
│   ├── default.tsx                # Returns null when no modal is active
│   └── (.)menu/[slug]/
│       ├── page.tsx               # Intercepts /menu/[slug] navigations; renders <ProductModal>
│       └── loading.tsx            # Modal skeleton displayed during instant transitions
└── menu/
    ├── page.tsx                   # Menu catalog page; card click pushes /menu/[slug]
    └── [slug]/
        ├── page.tsx               # Standalone direct page (SEO, Open Graph, Schema.org JSON-LD)
        └── loading.tsx            # Standalone page skeleton for initial loads
```

### Navigation Behavior:
1. **From `/menu` (Modal Interception):**
   - Clicking any item card (or Home favorites) triggers `router.push('/menu/[slug]', { scroll: false })`.
   - Hovering or focusing on any card immediately executes `router.prefetch('/menu/[slug]')`.
   - Next.js intercepts the route via `@modal/(.)menu/[slug]/page.tsx`, rendering `<ProductModal>` as a modal/bottom-sheet over the menu without resetting filters, pagination, or scroll position.
   - Closing the modal (via X button, Esc key, backdrop click, or mobile swipe-down) invokes `router.back()`, cleanly dismissing the modal slot while preserving state.

2. **Direct Visit / Browser Refresh (Standalone Page):**
   - Direct visits or full browser refreshes to `/menu/[slug]` route straight to `menu/[slug]/page.tsx`.
   - Renders complete standalone page with breadcrumbs (`Home / Menu / [Dish]`), `Navbar`, `ProductDetailView`, and `Footer`.
   - Generates dynamic SEO metadata (`generateMetadata`) with Open Graph image dimensions (1200x630) and Twitter Card tags.
   - Injects Schema.org `Product` JSON-LD with price currency, availability (`InStock` vs `OutOfStock`), rating aggregate, and image gallery.

---

## 2. Presentation & Responsive Layout

- **Desktop (≥ 768px):** Centered dialog (max-width `960px`), rounded `28px`, white surface, soft forest-tinted shadow (`shadow-[0_24px_50px_rgba(38,50,40,0.28)]`), and blurred backdrop (`backdrop-blur-sm`).
- **Mobile (< 768px):** Bottom sheet pinned at `~92vh` with safe-area padding, pill drag handle, and gesture swipe-to-dismiss via Framer Motion drag (`drag="y"`, `dragConstraints={{ top: 0 }}`).
- **Open Animation:** Shared-element transition (`layoutId="product-image-[id]"`) where the catalog image morphs into the modal gallery, with staggered spring entrance (~350ms). Automatically degrades to a gentle fade under `prefers-reduced-motion`.

---

## 3. Product Media & Details Layout

- **Left Column (Media Stage):**
  - `<ProductGallery>`: Large image on meadow-tint gradient with 3D cursor tilt (max ~8° with parallax shine; disabled on touch devices and reduced-motion).
  - Thumbnail / dot carousel with keyboard navigation (Left/Right arrows) and touch swipe.
  - Badges: Amber discount percentage tag, "Popular" badge, and dietary badges (Vegan, Vegetarian, Contains Nuts, Gluten-Free).
  - Unavailable overlay (SRS BR-002) with grayscale filter and "Currently Unavailable" status badge.
- **Right Column (Customization & Details):**
  - Category chip and interactive Heart favorite button with pop animation and `localStorage` persistence.
  - Name in display font (`--forest`), rating score with review count, and discounted price with struck-through original.
  - Expandable description with "Read more / Show less" toggle.
  - Meta chips: Preparation time, calories, serving size, and spice level with icons.
  - Collapsible Allergens and Ingredients breakdown.
  - `<OptionGroup>`:
    - Required single-choice groups (Size, Milk, etc.) as radio cards with preselected defaults and price deltas (`+20 ETB` or `+$1.00`).
    - Optional multi-choice groups (Extras) as checkbox cards with min/max rules and live "X of Y selected" hint.
    - Inline validation: shakes and scrolls to unselected required options on attempt to add.
  - Special instructions textarea (max 200 characters with live character counter, per FR-ORD-006).
  - `<RelatedItems>`: "Goes well with" horizontal row of cross-sell pairings with 1-tap quick add.

---

## 4. Sticky Action Bar & Cart Store

- **`<StickyAddBar>`:**
  - Pinned to the bottom of the viewport with backdrop blur and shadow.
  - `<QuantityStepper>`: Custom stepper (min 1, max 20) with press-and-hold repetition and number roll bump animation.
  - Primary button: "Add to cart · $XX.XX" (or "Update cart" if pre-configured item exists). Rolling total micro-interaction whenever modifier selections or quantities change.
  - Authoritative notice: *"Final total confirmed at checkout (server authoritative)"* per SRS BR-001.
  - `<FlyToCart>`: Optimistic add triggers a floating product image particle that accelerates toward the cart icon in the navigation bar, accompanied by a toast notification.
  - Unavailable alternative actions: "Notify me" and "See similar items" buttons when `item.available === false`.

- **Cart State (`cart-context.tsx`):**
  - Store holds `item.id`, `menuItemId`, `selectedOptionIds` (chosen option IDs only, not prices), `selectedOptionsMap`, `unitPrice`, `quantity`, `specialInstructions`, and `notes`.
  - Persists to `localStorage` under `cafe_cart_items_v2` with schema versioning (`{ version: 2, items: [...], updatedAt }`) and legacy migration.
  - Helper `generateCheckoutIdempotencyKey()` generates idempotent request keys at checkout start (`ord-idem-...`, per FR-ORD-009), not at add-to-cart.
  - Line total calculation is powered by the unit-tested pure function `calculateLineTotal(item, selections, qty)`.
