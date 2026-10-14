# Sable — AI-Powered Artisan Cafe & Roastery Frontend

Public customer-facing web application built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Framer Motion** inside the `@cafe/web` monorepo workspace.

---

## 1. Quick Start

### Installation & Development Server
From the monorepo root:
```bash
# Install dependencies across workspaces
pnpm install

# Start the web development server (runs on port 3001)
pnpm --filter @cafe/web dev
```

Visit [http://localhost:3001](http://localhost:3001) in your browser:
- **Home**: `http://localhost:3001/`
- **Menu Catalog**: `http://localhost:3001/menu`
- **Login**: `http://localhost:3001/login`
- **Sign Up**: `http://localhost:3001/signup` (also accessible at `/register`)

### Verification & Quality Gates
```bash
# Run TypeScript compilation check
pnpm --filter @cafe/web typecheck

# Run Biome lint checks
pnpm --filter @cafe/web lint

# Run Biome auto-formatting
pnpm --filter @cafe/web format
```

---

## 2. Design System & Tokens

The application strictly utilizes the warm, organic palette and tinted shadows defined in `apps/web/src/app/globals.css`:

| Token | Hex / Value | Semantic Role |
|---|---|---|
| `--meadow` | `#48A853` | Primary action buttons, active navigation indicators, badges, focus rings |
| `--forest` | `#263228` → `#2D3E35` | Display typography, dark showcase sections, footers (gradient) |
| `--cream` | `#F8F9F5` | Ambient page canvas background |
| `--white` | `#FFFFFF` | Elevated cards, input surfaces, interactive modals |
| `--amber` | `#FF8A3D` | Star ratings, cart count badge, discount tags, accent highlights |
| `--sage` | `#718079` | Secondary text, subtitles, placeholders, subtle borders |

### Typography Pairing
- **Display Serif**: `Playfair Display` (via `next/font/google`, `--font-display`)
- **Body Sans**: `Plus Jakarta Sans` (via `next/font/google`, `--font-sans`)

---

## 3. Pages Built & Features

### 3.1 Home (`/`)
- **Hero**: Split layout with animated hand-drawn SVG underline accent in meadow, dual CTAs ("Order Now" & "View Menu"), trust metrics (4.9 rating, 2.4k+ guests, prep telemetry).
- **Floating 3D Coffee Hero**: Interactive cursor 3D parallax tracking, gentle idle levitation (`animate-soft-float`), animated rising steam wisps, orbiting coffee beans, leaves, and bakery chips at staggered depth planes.
- **Fulfilment Strip**: Interactive 3D tilt cards matching SRS fulfilment modes: Dine-In Table Dock, Express Steam Pickup, and Eco Thermal Delivery.
- **Chef's Favorites**: 4-column responsive grid with floating cards, live badges (-15% discount, Chef Signature), and instant order tray integration.
- **Order Journey Timeline**: 4-step progressive timeline (`Select` → `Pay` → `Prepare` → `Savor`).
- **"Order with AI" Showcase**: Forest gradient section featuring interactive conversational demo ("Two cappuccinos with oat milk and one warm cardamom croissant...") with auto-building order summary.
- **Features Bento Grid**: 5 asymmetric cards with tinted shadows detailing direct trade sourcing, kitchen pacing, regular credits, and multi-channel ordering.
- **Testimonials Carousel**: Amber rating stars, reviewer avatars, and interactive pagination.
- **CTA Banner & Footer**: Forest gradient footer with brand blurb, quick links, opening hours, bole boulevard location, and newsletter dispatch.

### 3.2 Menu (`/menu`)
- **Header Band**: Title, subtitle, and debounced instant search input.
- **Sticky Category Tabs**: Pill tabs with smooth sliding indicator via Framer Motion's `layoutId`.
- **Filtering & Sorting Controls**:
  - Available-only toggle switch (SRS BR-002)
  - Dietary chips (All, 100% Plant-Based, Vegetarian, Gluten-Free, Organic)
  - Sorting dropdown (Featured, Top Rated, Price: Low to High, Price: High to Low)
- **Product Grid**: Smooth layout repositioning animations, floating tilted product images, live quantity steppers, and unavailable items overlay (grayed out with "Currently Unavailable" badge and disabled button per BR-002).
- **Product Detail Modal**: Large 3D image preview, option selectors (Size, Milk swap, Spices/Extras), special kitchen instructions textarea (SRS FR-ORD-006), and real-time line total estimate with server-authoritative notice.

### 3.3 Login (`/login`)
- **Split Layout**: Left brand panel with animated steam wisps, highland coffee quote, and security badge; right form on clean cream background.
- **Form Controls**: Email/phone input, password input with show/hide toggle, remember me checkbox, and forgot password trigger.
- **Validation & Security**: Built with `react-hook-form` + `zod`. Follows **SRS FR-AUTH-001**: failed submissions display a generic error message and never reveal whether the account exists.
- **Demo Quick Fill**: One-tap demo accounts for Guest Customer, Barista Staff, and Admin.

### 3.4 Sign Up (`/signup`)
- **2-Step Progressive Onboarding**:
  - **Step 1: Account**: Full name, email, optional phone, terms acceptance, and password with a live animated 4-segment strength meter (meadow/amber/rose).
  - **Step 2: Taste Profile (SRS FR-AI-002)**: Interactive preference chips (Ceremonial Jebena, Yirgacheffe Pour-Over, Doro Wot, Beyaynetu, etc.) saved to user profile for future AI recommendations.
- **Celebration Feedback**: Confetti-style success screen with automatic redirection to catalog.

### 3.5 Global Components
- **Navbar**: Sticky navbar transitioning from transparent over hero to white glass with soft forest shadow on scroll. Features live amber cart counter and mobile slide-in drawer.
- **Cart Drawer**: Slide-in tray with 3-way fulfilment mode selector (`dine-in`, `pickup`, `delivery`), item quantity steppers, notes, subtotal, and checkout flow with server-authoritative price confirmation disclaimer (BR-001).
- **Floating AI Assistant**: Bottom-right meadow button with soft pulse opening an interactive conversational ordering shell.
- **Toasts**: Lightweight animated notification system for cart events and account actions.

---

## 4. Mock Data Layer & Connecting the Real NestJS API

All customer-facing catalog and authentication data is abstracted through typed async functions in `src/data/`:
- `src/data/types.ts`: TypeScript contracts for `MenuItem`, `MenuCategory`, `FulfilmentType`, `CartItem`, etc.
- `src/data/mock-cafe.ts`: Async data getters (`getMenu()`, `getCategories()`, `getFeaturedItems()`, `getMenuItemById()`, etc.)
- `src/data/auth-service.ts`: Auth endpoints (`authenticateUser()`, `registerNewUser()`)

### Where to Plug in the Real NestJS API
To replace mock data with live NestJS backend endpoints:

1. **Menu & Catalog Endpoints (`src/data/mock-cafe.ts`)**:
   ```ts
   // Replace simulated Promise with NestJS API fetch:
   export async function getMenu(): Promise<MenuItem[]> {
     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/items`, {
       next: { revalidate: 60 },
     });
     return res.json();
   }
   ```

2. **Order Placement (`src/components/cart/cart-drawer.tsx`)**:
   - The form submit handler `handlePlaceOrder` currently generates a client tracking code `SBL-XXXXXX`.
   - Wire this to `POST /orders` sending the payload `{ items, fulfilmentType, tableNumber, notes }`.
   - The backend validates prices and stock authoritatively (SRS BR-001 / BR-002).

3. **Authentication (`src/data/auth-service.ts`)**:
   - Update `authenticateUser()` to call `POST /auth/login` and store the JWT access token in secure cookies or `apiClient`.
   - Update `registerNewUser()` to call `POST /auth/register` including the selected taste preference chips (`favoriteDrinkPreferences`).

---

## 5. Implementation Inventory: Final vs. Placeholder

| Feature / Element | Status | Notes |
|---|---|---|
| Design Tokens & Theme | **Final** | Exact hex codes, CSS variables, organic gradients, tinted shadows |
| Home Page Layout & Sections | **Final** | 8 sections including 3D hero parallax, fulfilment strip, timeline, bento, testimonials |
| Menu Page & Filtering | **Final** | Debounced search, sticky pill tabs with layoutId, dietary chips, sorting, modal detail |
| Cart Drawer & Fulfilment | **Final** | Dine-in, pickup, and delivery modes, item steppers, notes |
| Login & Sign Up Pages | **Final** | Split layout, Zod validation, generic FR-AUTH-001 errors, 2-step taste profile, strength meter |
| Menu Data Layer | **Typed Mock** | Implemented as async service in `src/data/mock-cafe.ts` ready to swap for NestJS `fetch` |
| Auth Service | **Typed Mock** | Stubbed in `src/data/auth-service.ts` with simulated latency and session persistence |
| AI Chat Ordering Shell | **UI Placeholder** | Fully interactive modal with natural language order builder (SRS FR-AI-001 is post-MVP) |
| Payment Gateway | **Placeholder** | Dispatches to confirmed order state with disclaimer (BR-001) |
