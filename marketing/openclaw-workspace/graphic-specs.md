# Culinary JEMs — Graphic Specs for Template Rendering

## Brand Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Gold | `#FFC559` | Primary — headers, CTAs on dark bg, badges |
| Gold Dark | `#E5A830` | Hover/pressed states |
| Pink | `#F00075` | Accent — catering CTA, special promo buttons |
| Pink Dark | `#CC0063` | Hover/pressed states |
| Dark | `#111111` | Body backgrounds, text on light |
| Light | `#FAFAFA` | Card backgrounds, text on dark |
| White | `#FFFFFF` | Pure white for max contrast |

## Typography

| Element | Font | Weight | Size (1080px canvas) |
|---------|------|--------|---------------------|
| H1 (headline) | Manrope | 800 | 56-72px |
| H2 (subhead) | Manrope | 700 | 36-46px |
| Body | Manrope | 400-600 | 24-30px |
| Caption/small | Manrope | 400 | 18-22px |
| Badge | Manrope | 700 | 18px, uppercase, 0.08em tracking |
| CTA button | Manrope | 700 | 22px, uppercase, 0.04em tracking |

**Google Fonts import**: `https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap`

## Template Dimensions

| Template | Width | Height | Aspect | Platform |
|----------|-------|--------|--------|----------|
| schedule-card | 1080 | 1080 | 1:1 | IG feed, FB |
| menu-spotlight | 1080 | 1080 | 1:1 | IG feed, FB |
| story-event | 1080 | 1920 | 9:16 | IG story, FB story |
| event-recap | 1080 | 1080 | 1:1 | IG feed, FB |
| catering-promo | 1080 | 1080 | 1:1 | IG feed, FB |

## Logo Usage

- **File**: `logo.png` (circular, gold bg, burger icon, "CULINARY JEMS / GOURMET SLIDERS")
- **Watermark size**: 56-70px diameter
- **Placement**: Top-right corner (32px padding) for feed posts
- **Opacity**: 0.85-0.9 with subtle drop shadow

## Template Specifications

### schedule-card (1080x1080)
- **Header bar**: Gold (`#FFC559`) background, full width, ~160px tall
  - "Come Find Us!" in dark text, 36px extrabold
  - Logo circle, 80px, right-aligned
- **Body**: Dark (`#111111`) background, center-aligned content
  - Venue name: 64px extrabold, white
  - Detail rows with gold SVG icons (calendar, clock, map pin): 30px semibold, light text
  - Subtle gold divider line between venue and details
- **Footer bar**: Subtle gold tint bg, "Get Directions" in gold text with map pin icon

### menu-spotlight (1080x1080)
- **Background**: Full-bleed food photo, `object-fit: cover`
- **Overlay**: Bottom gradient (transparent → 97% dark), covers bottom 55%
- **Logo watermark**: Top-right, 70px, with box shadow
- **Content** (positioned absolute, bottom 60px):
  - Protein badge: Gold bg, dark text, pill shape, uppercase
  - Slider name: 56px extrabold, white
  - Gold divider: 80px × 4px
  - Description: 26px regular, light text (85% opacity)
  - Menu CTA: 20px gold text, uppercase

### story-event (1080x1920)
- **Background**: Photo at 25% opacity with dark overlay gradient
- **Top section** (centered, 60px from top):
  - Headline badge: Gold bg, dark text, 52px extrabold, rounded corners
  - Logo: 120px circle
- **Center section** (vertically centered):
  - Venue name: 72px extrabold, white
  - Gold divider: 120px × 4px
  - Time: 42px bold, gold text
  - Address: 28px regular, light text (70% opacity)
- **Bottom**: 3-photo strip (equal width, 280px tall, 12px gap, rounded corners)
- **Footer**: Animated swipe-up arrow with "Swipe up for menu" text

### event-recap (1080x1080)
- **Header** (centered, top area):
  - "Thanks, [Venue]!" — 52px extrabold, white with gold venue name
  - Date: 22px regular, light text (60% opacity)
  - Gold divider below
- **Photo grid**: 2×2 grid, 12px gap, rounded corners, fills middle area
- **Footer** (centered, bottom):
  - "See you next time!" — 28px semibold, light text
  - Brand bar: Logo (48px) + "@CulinaryJEMs" in gold

### catering-promo (1080x1080)
- **Layout**: Horizontal split — photo left (45%), text right (55%)
- **Photo side**: Full-height event photo with right-edge gradient fade to dark
- **Text side** (dark bg, vertically centered, 52px padding):
  - Logo row: 56px logo + "CULINARY JEMS" in gold
  - Headline: 46px extrabold, "Book Us for Your Event" — "Event" in gold
  - Gold divider: 64px × 4px
  - Bullet list (3 items): Gold circle checkmark icons + white text (24px semibold)
    - Corporate Events / Private Parties / Weddings & Festivals
  - CTA button: Pink bg, white text, pill shape, "Get a Free Quote"
  - URL text: `culinaryjems.com/catering` in subtle gray

## Photo Library

Available photos for template use (in `public/assets/imported/`):

| File | Best for | Notes |
|------|----------|-------|
| ig-sliders-rack.jpg | Menu spotlight (Irwin M. Classic) | Multiple sliders on rack |
| ig-goldwater.jpg | Menu spotlight (The Fat Sam), venue | Goldwater Brewing setting |
| ig-food-kitsune.jpg | Menu spotlight (Arnold Babar) | Food close-up |
| ig-food-carousel.jpg | Menu spotlight (Dr. Rosenrose) | Carousel-style food shot |
| ig-sliders-brewery.jpg | Event backgrounds, catering | Sliders at brewery |
| slider-closeup.jpg | Generic slider feature | Macro close-up |
| hero.jpg | Story backgrounds | Hero banner image |
| ig-logo-circle.jpg | Alternative logo | Circular IG-formatted logo |
| logo.png | Watermark, brand elements | Main brand logo |

## Rendering Notes

- All templates use `styles.css` for shared utilities
- Variables are injected via `{{variableName}}` placeholder syntax
- Local file paths are auto-resolved to `file://` URLs by render-template.js
- Default logo path is auto-injected if not provided
- Puppeteer renders with `--no-sandbox` and `--allow-file-access-from-files`
- Font loading: Wait for `document.fonts.ready` before screenshot
- Output format: PNG at native resolution (no upscaling)
