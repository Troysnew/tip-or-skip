# Modern Mint implementation specification

## Identity

Use the split-percent symbol: upper filled circle, rounded diagonal stroke, lower open ring. The canonical launcher is mint `#ACF4CE` on ink `#182322`, in both app themes. The wordmark makes “or” a mint capsule. Do not substitute the ordinary percent glyph for the symbol or use a screenshot crop as the logo.

`logos/*-light.svg` is for light surfaces; `*-dark.svg` is for dark surfaces. Main SVGs contain vector paths, so they need no installed font. `*-live-text.svg` versions retain text for wording edits and require Inter Black/ExtraBold weights; see the font mapping below. The geometry masters and `tokens/modern-mint.json` take precedence over the generated concept's slight gradients and rendered type.

Maintain clear space of at least one lower-circle diameter around standalone marks where possible. Minimum practical standalone symbol size is 24 logical units; use the plain symbol at this size, not the wordmark. Keep the wordmark comfortably readable; a 160-unit horizontal width is a useful lower starting point. Never distort aspect ratio.

## Asset dimensions

| File in `app-icons/` | Size | Pixel format / use |
| --- | --- | --- |
| `app-icon.png` | 1024 × 1024 | Opaque RGB, square with no baked-in corner mask |
| `adaptive-foreground.png` | 1024 × 1024 | Mint symbol, transparent RGBA; preserve padding |
| `adaptive-background.png` | 1024 × 1024 | Opaque RGB ink; `#182322` can be used as background color |
| `monochrome.png` | 1024 × 1024 | White symbol with alpha, same adaptive padding; OS supplies tint |
| `splash.png` | 1024 × 1024 | Transparent mint symbol; place on ink |
| `play-store-icon.png` | 512 × 512 | RGBA with opaque pixels; under 1024 KB |

The adaptive artwork fits inside a central 66/108 safe circle on the 1024-pixel canvas (about 626 pixels diameter). Keep the whole transparent canvas. Full app and splash art have different visual scale and must not be substituted for the adaptive layer. Use the platform/framework's existing icon pipeline; this package does not assume the current native configuration or Expo SDK.

`store/feature-graphic.png` is a 1024 × 500 RGB PNG. Four SVG screenshot templates are 1080 × 1920; insert an actual 9:16 capture into x=90, y=306, width=900, height=1600. Remove placeholder text and the TEMPLATE notice; export RGB PNGs at the original dimensions. Frames are not completed store screenshots. The feature graphic's mint background is intentional. Suggested alt text: “Tip or Skip. Know when to tip. Know how much. Mint split-percent symbol.”

## Color and typography

| Role | Light | Dark |
| --- | --- | --- |
| Background | `#F6F8F6` | `#101A18` |
| Surface | `#FFFFFF` | `#1B2B27` |
| Main text | `#182322` | `#F4F8F5` |
| Secondary text | `#53625D` | `#B5C8BE` |
| Accent / focus | `#12745F` | `#ACF4CE` |
| Selected fill / text | `#182322` / `#ACF4CE` | `#ACF4CE` / `#182322` |
| Result fill / text | `#ACF4CE` / `#182322` | `#ACF4CE` / `#182322` |

Use the full token file for error, disabled, border, suggested and verdict roles. Mint is a surface or a dark-mode foreground; use teal for light-mode links and small text. Decorative separators may use the divider token; use the stronger border token wherever a control boundary is needed for identification. Error colors are for validation, never the “Skip it” verdict.

Modern Mint uses one coordinated type family across the three type roles, replacing the first direction's Bricolage/Inter/JetBrains mix: Inter ExtraBold for titles, Inter Regular/Semibold for reading and labels, and Inter Semibold with tabular numerals for amounts. The wordmark uses Black. This formalizes the approved concept's typography while keeping the brief's aligned-number requirement.

Amounts must enable `tnum`/tabular numerals in the actual rendering stack. Font sizes are logical units: titles 28/34 line height, body 16/24, labels 14/20, primary amount 48/56, supplementary captions 12/16. Native font aliases and filenames are listed in `fonts/README.md`; avoid synthetic bolding. Static SVG text is outlined; editable text variants depend on the installed font mappings.

## Layout and component rules

Use 20-unit screen padding, 12-unit control radii, 20-unit result/card radii, and 8/12/16/24 spacing. These are starting values, not fixed screen coordinates. Controls need at least 48 × 48 logical-unit targets. A 24-unit icon or small verdict pill is not by itself a sufficient interactive target.

- **Calculator:** Bill input first, tip choice row next, then result and split controls. Keep the tip amount on each percent choice. The reference uses three percent cards and a second row for Custom tip / No tip so small screens remain readable. Preserve whichever rates and no-tip behavior the app actually supports.
- **Selected versus suggested:** Selection uses a filled treatment, check and explicit selected label/state. Suggestion uses its own subtle yellow label and must not silently select an amount. Do not invent the old brief's example “37% pick this” statistic; show social-proof data only if real and supported.
- **Results:** Give tip the strongest numeric emphasis, then total and split amount. Example: $80 × 18% = $14.40; total $94.40; two-way split $47.20. Existing taxes, rounding, currency and split rules remain authoritative.
- **Verdicts:** Yes, tip = mint; Your call = soft yellow; Skip it = slate; Included = soft blue. Always retain a written label. Use “Already included” when space permits. A service charge alone does not establish that gratuity is included; follow validated app content.
- **Navigation:** All five existing tabs are included. The generated concept's four-tab arrangement is not an approved information-architecture change. For large text, allow the app's established adaptive navigation to handle labels rather than shrinking text or removing destinations.
- **Services:** Use app data and existing search/category logic. The reference entries demonstrate visual treatment, not new tipping policy. Keep all six categories and a clear route to explanation/source content.
- **Pro and empty states:** Assets carry no price or invented feature promises. Keep the current free/Pro split and purchase information. Empty-state copy is deliberately general and should match actual screen behavior.
- **Accessibility:** Permit dynamic type and wrapping, use appropriate input labels, selected state semantics and meaningful icon labels. Avoid icon-only color cues. The reference screens can scroll above a safe-area-aware tab bar. At large text, cards may grow or wrap into rows.

## What to verify in the app

1. Installed launcher under several masks and themed-icon settings, plus splash in a preview/release build.
2. Light/dark themes, keyboard-open calculator, narrow screen, and increased system text size with no inaccessible controls.
3. Selected/suggested/custom/no-tip states and existing calculations, rounding and split behavior.
4. All five destinations, service filters, history/holiday behavior, sources and Pro gates.
5. Real screenshots for store artwork; mockups are not app screenshots.

Asset-level checks are recorded in `qa/QA-Report.json`. They are not an accessibility certification or a device test.

## Source specifications

Sizes follow the supplied brand brief and official documentation reviewed October 16, 2026:

- Android adaptive icon layers and safe area: https://developer.android.com/develop/ui/compose/system/icon_design_adaptive
- Google Play graphic and screenshot requirements: https://support.google.com/googleplay/android-developer/answer/9866151?hl=en
- Google Play icon specifications: https://developer.android.com/distribute/google-play/resources/icon-design-specifications

The name remains the current project name; this design handoff makes no new determination about name availability.
