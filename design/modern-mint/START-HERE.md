# Tip or Skip — Modern Mint developer handoff

Selected visual direction: Modern Mint (Option B). Asset release 1.0, October 16, 2026.

Apply this identity to the existing app. Start with `Modern-Mint-Asset-Overview.png`, then `DEVELOPER-HANDOFF.md` and `tokens/modern-mint.json`.

## Files to use

| Folder | Contents | Use |
| --- | --- | --- |
| `app-icons/` | App, adaptive foreground/background, themed monochrome, splash, Play icon | Import the PNGs at supplied sizes; SVGs are editable masters |
| `logos/` | Horizontal and stacked wordmarks, four symbol versions | Outlined SVGs are the stable production assets; transparent PNGs are supplied |
| `ui-icons/` | 17 single-color SVGs | Includes all 5 original navigation icons and all 6 service category icons |
| `tokens/` | JSON, TypeScript, CSS | Light/dark roles, verdict colors, spacing, type sizes and radii |
| `fonts/` | Static Inter TTFs and OFL license | Read `fonts/README.md` for exact family names and tabular numbers |
| `components/` | Both themes: verdicts, tip states, Pro tag/header, empty states | Reference visuals; recreate interactive elements using native components |
| `screens/` | Calculator and services in both themes, SVG + PNG | Illustrative 390 × 844 layout references |
| `store/` | Feature graphic and four screenshot frame SVGs | Screenshot frames require real app captures before upload |
| `reference/` | Original approved concept image | Visual inspiration; production values are defined in tokens and SVGs |
| `qa/` | Export checks, contrast results, asset manifest | Scope and verification evidence |

## Implementation brief for Claude

Apply the supplied Modern Mint identity to the existing Tip or Skip app. Use the mint-on-charcoal split-percent mark, pill-shaped “or” wordmark, Inter typography and light/dark theme tokens. Keep dollar amounts visible on tip choices and retain the existing Calculator, Services, History, Holidays and About destinations. The four-tab arrangement in the original concept was illustrative.

Keep the existing service data, recommendations, calculation and rounding rules, sources, navigation behavior, saved data, purchase logic and feature gates. Match the supplied component proportions while allowing dynamic text and narrow screens to reflow. Give every verdict its word as well as color; “Skip it” is neutral slate. Build real native UI, using the component exports as references. Use the supplied PNG launcher/splash files and the editable SVG wordmarks/icons where supported. After integration, return real Android screenshots in both themes, confirm increased text sizes and keyboard behavior, and provide an updated tester build.

## Scope

This package supplies design assets and implementation references. It does not contain an updated APK or a tested application build. The original AI concept has been reconstructed as clean vector artwork with a defined font, so small geometry/type differences are intentional. Screens and service examples are illustrative; the app's validated data remains authoritative. Final store screenshots are outstanding until the updated app is captured.
