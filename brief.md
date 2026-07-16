# AzCuts Landing Page Redesign — Design Brief

## Objective
Redesign the AzCuts landing page to feel modern, premium, and visually striking. The key upgrade is a services section that uses a large, cinematic slideshow/carousel instead of a small card grid. The page should feel like a high-end barbershop brand — confident, clean, luxurious.

## Target Audience
Young professionals and style-conscious customers looking for a premium barber/salon experience.

## Aesthetic Direction
**Dark luxury meets clean minimalism.** Think premium barbershop branding — deep dark backgrounds with warm gold/amber accents, large typography, cinematic imagery, smooth animations. The hero should feel like a fashion brand landing page, not a generic SaaS template.

Key aesthetic traits:
- Dark-dominant with warm accent tones (gold/amber `#D4A853`)
- Large, bold typography with generous whitespace
- Smooth, subtle animations (fade-in on scroll, slide transitions)
- Glass-morphism effects on cards and overlays
- Premium feel through restraint — fewer elements, more impact

## Content Structure

### 1. Hero Section (full viewport)
- Full-height hero with a cinematic dark gradient background
- Large headline: "Sharp Looks, Effortless Booking"
- Subtle animated geometric accent shapes (CSS only, no JS)
- Badge: "Barber Shop & Salon" with scissors icon
- Tagline/description text
- Two CTAs: "Book Now" (primary, gold accent) and "Login" (ghost/outline)
- Stats row at bottom: Services count, Online Booking, Fast & Easy
- Smooth scroll indicator arrow at bottom

### 2. Services Slideshow (the star of the redesign)
- **Full-width, large-format carousel/slideshow** — each service takes up ~70-80% of the viewport height
- Each slide shows: large service image (left or background), service name (large), description, price, duration, and a "Book Now" button
- Navigation: left/right arrows + dot indicators
- Category filter tabs above the slideshow (All / Haircuts / Salon)
- Auto-advances every 5 seconds with pause on hover
- Smooth slide transitions (CSS transform/opacity)
- On mobile: full-width stacked layout with swipe support

### 3. About Section
- Clean two-column layout: text left, team cards right
- Glass-morphism team cards with avatar circles
- Warm accent highlights

### 4. Contact Section
- Three contact cards in a row (Phone, Email, Socials)
- Glass-morphism card style with icon + text

### 5. Location Section
- Map left, store hours right
- Clean bordered cards

### 6. Footer
- Minimal: brand, copyright, clean separator

## Typography
- **Font**: Keep Inter (already loaded)
- **Headings**: Extra bold (800), large sizes, tight letter-spacing (-0.02em)
- **Body**: Regular (400), good line-height (1.6-1.7)
- **Accent text**: Semi-bold (600), slightly smaller

## Color Direction
Building on the existing theme tokens but adding premium warmth:
- **Hero/Services background**: Deep dark `#0A0B0F` with subtle gradient overlays
- **Gold/Amber accent**: `#D4A853` for primary CTAs and highlights on the landing page
- **Surface cards**: Glass-morphism with `backdrop-filter: blur(16px)` + semi-transparent backgrounds
- **Text**: White `#F8F8F8` on dark sections, existing `--text` on light sections
- **Borders**: Subtle `rgba(255,255,255,0.08)` on dark sections
- Keep existing light/dark theme for dashboard pages — the landing page gets its own premium dark treatment

## Image Needs
- Service images are already loaded from the API (`/uploads/...`) — use them as-is
- No additional images needed — the design relies on gradients, CSS shapes, and the existing service images

## What Makes It Memorable
The **cinematic services slideshow** — large, immersive slides that showcase each service like a portfolio piece. Combined with the dark luxury aesthetic and smooth animations, it transforms the landing from a template feel to a premium brand experience.

## Output Path
This is an application page — modify the existing files:
- `D:\Others\Azeu Codes\CommandCode\AzCuts\client\src\pages\public\Landing.jsx`
- `D:\Others\Azeu Codes\CommandCode\AzCuts\client\src\pages\public\Landing.css`

## Constraints
- Must work with both light and dark themes (though landing page defaults to dark premium feel)
- Must be responsive (mobile-first)
- Use existing project dependencies only (React, lucide-react icons, CSS)
- Keep the existing data fetching logic (useQuery for publicSettings)
- Service images come from the API — use `service.image` directly as the src
- Do NOT add new npm dependencies — implement the slideshow with React state + CSS transitions
