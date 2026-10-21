---
version: alpha
name: Evergreen Editorial
description: "Confident and editorial: huge tight-tracked grotesk headlines on white, one deep evergreen teal, a coral spark, and quiet hairlines everywhere else."
colors:
  primary: "#0E5E59"
  primary-strong: "#0A4A46"
  primary-tint: "#D5ECE8"
  primary-tint-strong: "#BFE2DC"
  on-primary-tint: "#0A4A46"
  wash: "#E9F3F1"
  wash-line: "#CFE3DF"
  accent: "#F06B4F"
  background: "#FFFFFF"
  surface: "#F9FAFB"
  surface-sunken: "#F2F4F7"
  ink: "#101828"
  ink-body: "#475467"
  ink-label: "#344054"
  ink-muted: "#5D6B7E"
  ink-placeholder: "#98A2B3"
  line: "#EAECF0"
  line-strong: "#D0D5DD"
  inverse: "#0D2624"
  inverse-raised: "#143533"
  inverse-outline: "#3B5F5C"
  on-inverse: "#F2F7F6"
  on-inverse-muted: "#A3BAB7"
  on-inverse-accent: "#8FD3CA"
  success: "#067647"
  success-bg: "#ECFDF3"
  warning: "#B54708"
  warning-bg: "#FFFAEB"
  error: "#B42318"
  error-bg: "#FEF3F2"
  error-bar: "#F04438"
typography:
  hero:
    fontFamily: "'Schibsted Grotesk', system-ui, sans-serif"
    fontSize: "clamp(48px, 7vw, 96px)"
    fontWeight: 800
    lineHeight: 0.94
    letterSpacing: "-0.055em"
  page-h1:
    fontFamily: "'Schibsted Grotesk', system-ui, sans-serif"
    fontSize: "clamp(44px, 6vw, 80px)"
    fontWeight: 800
    lineHeight: 0.96
    letterSpacing: "-0.055em"
  heading:
    fontFamily: "'Schibsted Grotesk', system-ui, sans-serif"
    fontSize: "clamp(36px, 4.6vw, 60px)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.048em"
  heading-md:
    fontFamily: "'Schibsted Grotesk', system-ui, sans-serif"
    fontSize: "clamp(32px, 3.6vw, 46px)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.045em"
  card-title:
    fontFamily: "'Schibsted Grotesk', system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  figure:
    fontFamily: "'Schibsted Grotesk', system-ui, sans-serif"
    fontSize: "clamp(48px, 5vw, 68px)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.055em"
  lead:
    fontFamily: "'Schibsted Grotesk', system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "'Schibsted Grotesk', system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "'Schibsted Grotesk', system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.2
  small:
    fontFamily: "'Schibsted Grotesk', system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.45
rounded:
  xs: "5px"
  sm: "6px"
  default: "8px"
  md: "10px"
  lg: "12px"
  xl: "14px"
  2xl: "16px"
  frame: "18px"
  3xl: "20px"
  full: "999px"
spacing:
  unit: "4px"
  container: "1240px"
  container-narrow: "900px"
  gutter: "32px"
  gutter-mobile: "16px"
  section: "112px"
  section-secondary: "96px"
  card-padding: "24px"
  card-padding-lg: "32px"
  control-sm: "34px"
  control: "40px"
  control-lg: "48px"
  input: "42px"
  input-lg: "46px"
---

# Evergreen Editorial

One family (Schibsted Grotesk, on Google Fonts, weights 400-800) does everything; headings are the
same face at 800 with very tight tracking. There is no separate display font.

## Look and feel

1. **White page, grey bands.** The page background is `background` #FFFFFF. Alternate sections sit on `surface` #F9FAFB with a 1px `line` #EAECF0 hairline top and bottom (`border-y`). No gradients behind content.
2. **Headlines are the hero.** Hero headings run `clamp(48px,7vw,96px)` / 0.94 / -0.055em / 800, capped at about 13 characters per line (`max-width: 13ch`, `text-wrap: balance`). Section H2s cap at 16-18ch. Big, black (`ink` #101828), tight.
3. **One teal, one coral.** `primary` #0E5E59 is the only colour for buttons, links, active states and focus. `accent` coral #F06B4F is a spark only: a logo dot, the "most popular" plan badge, a timeline dot. Never a coral button for a normal action, never a coral background block.
4. **Body copy is soft slate.** Paragraphs use `ink-body` #475467; the lead under a hero is 19px / 1.5, max width 32rem.
5. **One dark band per page.** A closing call-to-action or the featured plan sits on `inverse` #0D2624 (deep green-black), text `on-inverse` #F2F7F6, secondary text `on-inverse-muted` #A3BAB7, ticks in `on-inverse-accent` #8FD3CA.
6. **Hairlines, not boxes.** Feature lists are columns separated by a 2px `ink` top rule (`border-top: 2px solid #101828; padding-top: 20px`) or a 1px `ink` rule over a grid, rather than shadowed cards.
7. **Flat at rest.** Shadows are soft and cool (from #101828 at low alpha), used for lifted images and floating panels only. Focus is a 4px teal halo `0 0 0 4px rgba(14,94,89,.18)`, keyboard (`:focus-visible`) only.
8. **Logical CSS.** Use `start`/`end` and `ms-/me-/ps-/pe-` so the site mirrors for right-to-left languages.

## Components

**Buttons** - base: inline-flex, centred, gap 8px, `rounded.md` 10px, 1px border, weight 600, line-height 1, transition 150ms ease.
- Sizes: compact 34px / 0 12px / 14px; default 40px / 0 16px / 14px; large 48px / 0 22px / 16px with 12px radius. The header CTA is 40px, 0 18px, 15px/600.
- Primary: bg #0E5E59, text #FFFFFF, transparent border, shadow `0 1px 2px rgba(16,24,40,.08)`; hover #0A4A46.
- Secondary: bg #FFFFFF, border #D0D5DD, text #101828, shadow `0 1px 2px rgba(16,24,40,.05)`; hover bg #F9FAFB.
- Ghost: transparent, text #344054; hover bg #F2F4F7, text #101828.
- On dark band: bg #FFFFFF, text #0E5E59; hover bg #E9F3F1, text #0A4A46. Outline on dark: border #3B5F5C, text #F2F7F6.
- Disabled: bg #F2F4F7, text #98A2B3, border #EAECF0, no shadow.
- At most one primary button per section; pair it with a secondary.

**Cards** - `rounded.xl` 14px, padding 24px, 1px #EAECF0 border, bg #FFFFFF, no shadow at rest. Website info and pricing cards are larger: `rounded.3xl` 20px, padding 32px. Card title 22px / 800 / -0.025em. Featured pricing card: bg #0D2624, text #F2F7F6, shadow `0 24px 48px -16px rgba(13,38,36,.45)`, a coral #F06B4F pill badge. Hover lift for clickable cards: `0 12px 32px -8px rgba(16,24,40,.12), 0 4px 8px -4px rgba(16,24,40,.06)`.

**Big figures** (stats, prices) - `figure` style `clamp(48px,5vw,68px)` / 0.95 / -0.055em / 800 in `ink`, label underneath 14px `ink-muted`.

**Inputs** (contact and newsletter forms) - full width, height 42px (46px on wide forms, 16px text), padding 0 14px, `rounded.md` 10px, bg #FFFFFF, 1px border #D0D5DD, text 15px #101828, placeholder #98A2B3, shadow `0 1px 2px rgba(16,24,40,.05)`. Focus: border #0E5E59 + `0 0 0 4px rgba(14,94,89,.14)`. Invalid: border #F04438 + `0 0 0 4px rgba(240,68,56,.12)`, error text #B42318 with an icon. Label 14px/600 #344054 with 8px gap; hint 13px #5D6B7E. Textarea and native select share the look (chevron icon at the end edge).

**Badges** - height 24px, pill radius 999px, padding 0 10px, 12px / 600, optional 7px dot.
- Tint: bg #E9F3F1, text #0E5E59. Neutral: bg #FFFFFF, border #EAECF0, text #344054. Grey: bg #F2F4F7, text #344054.
- Success #067647 on #ECFDF3; warning #B54708 on #FFFAEB; error #B42318 on #FEF3F2.
- Colour never carries meaning alone; the word does.

**Chips / filter tabs** (blog categories, program filters) - 34px tall, radius 8px, padding 0 12px, 13px/600. Off: border #D0D5DD, bg #FFFFFF, text #344054, hover bg #F9FAFB. On: border and bg #0E5E59, text #FFFFFF.

**Nav (header)** - sticky top, bg #FFFFFF, 1px #EAECF0 bottom border. Inner row: max width 1240px, padding 14px 32px, gap 32px. Wordmark: 21px / 800 / -0.035em, lowercase, with a small coral #F06B4F dot. Links: 15px/600 #344054, padding 8px 12px, radius 8px, hover #101828. A 40px primary CTA at the end. On phones collapse links into a menu button (ghost style).

**Footer** - 1px #EAECF0 top border, white. Inner row max 1240px, padding 40px 32px, wrapping flex, gap 16px 32px, text 14px #5D6B7E. Wordmark 17px / 800 / -0.03em #101828. Links 500 weight #344054, hover #101828, no underline.

**FAQ (pricing/contact)** - narrow 900px column, padding 96px 32px. Each row is a full-width button: padding 22px 0, 18px / 700 #101828, hairline between rows; answer 16px / 1.6 #475467.

**Avatars** (testimonials, team) - round, bg #D5ECE8, initial in #0A4A46 600; or a real headshot cropped round.

## Layout & spacing

- 4px base scale. Content max width 1240px with a 32px side gutter (16px on phones). Narrow reading column (blog article, FAQ, about story) 900px.
- Sections: 112px top and bottom; secondary sections 96px; on phones about 64px.
- Hero: two columns that wrap - text column `flex: 1 1 520px`, gap 18px; image column `flex: 1 1 400px`. Column gap 64px, row gap 48px.
- Card grids: `repeat(auto-fit, minmax(240px, 1fr))`, gap 32px (stat strips: minmax(200px,1fr), gap 16px).
- Stack inside a text block: heading, 18-20px gap, lead, 24px, button row (gap 12px).
- No horizontal scroll at 360px width; headings use `clamp()` so they shrink naturally.

## Photography & imagery

- Use real photographs of real people and places: the owner, members, sessions, the space. Never cartoons, 3D blobs, stock vector illustrations or grey placeholders.
- Feature images sit in a frame: radius 16-18px, 1px #EAECF0 border, bg #F9FAFB, shadow `0 40px 80px -40px rgba(16,24,40,.35)`. Keep a fixed aspect ratio (for example 1440/860 or 4/3) and `object-fit: cover`.
- Natural, daylight colour grading with cool greens and neutrals sits best next to the teal; avoid heavy filters and saturated orange casts that fight the coral.
- Portraits for testimonials and team: square or round crops, consistent lighting.
- Every image has meaningful `alt` text.

## Do / Don't

**Do**
- Do make the headline the loudest thing on the page: 800 weight, tight negative tracking, balanced wrapping.
- Do use teal #0E5E59 for every primary action and link, and #0A4A46 for hover.
- Do separate sections with #F9FAFB bands and #EAECF0 hairlines.
- Do end key pages with one dark #0D2624 band carrying a white "on dark" button.
- Do show focus with the teal 4px halo on `:focus-visible`.

**Don't**
- Don't introduce other brand colours, gradients, or Tailwind's default palette.
- Don't use coral for buttons, large fills or body text.
- Don't add drop shadows to every card; cards are bordered and flat.
- Don't use a second display font, italics for headings, or weights below 700 for headings.
- Don't use cartoon illustrations, emoji as icons, or placeholder images; icons are thin line icons (Lucide style, 2px stroke).
- Don't write "Loading..." text; use skeleton shapes on #F2F4F7.
