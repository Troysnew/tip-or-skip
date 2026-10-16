# Tip or Skip developer handoff

Working direction A · October 16, 2026

The identity pairs a filled and an outlined circle in a percent symbol. Bottle green is the brand anchor; brass is a small accent. All four verdicts should feel legitimate. The app still owns the service logic, source evidence, prices, and feature gating.

## Asset map

| Asset | File | Specification / use |
| --- | --- | --- |
| Main app icon | `app-icons/app-icon.png` | 1024 × 1024, opaque RGB square; no baked-in corner mask |
| Adaptive foreground | `app-icons/adaptive-foreground.png` | 1024 × 1024 RGBA, white mark on transparent background |
| Adaptive background | `app-icons/adaptive-background.png` | 1024 × 1024 RGB, solid #1F6B4A; a matching background color can be used instead |
| Monochrome layer | `app-icons/monochrome.png` | 1024 × 1024 RGBA, one white color plus alpha; system supplies the tint |
| Splash image | `app-icons/splash.png` | 1024 × 1024 RGBA; use on #1F6B4A |
| Play Store icon | `app-icons/play-store-icon.png` | 512 × 512 RGBA, opaque pixels, below 1024 KB |
| Feature graphic | `store/feature-graphic.png` | 1024 × 500 RGB; working artwork pending final name decision |
| Screenshot frames | `store/templates/screenshot-01-TEMPLATE.svg` through `04` | 1080 × 1920 editable templates; never upload placeholders |
| Wordmarks | `wordmarks/horizontal-light.svg`, `horizontal-dark.svg`, `stacked-light.svg`, `stacked-dark.svg` | Transparent artwork. Suffix names the intended background. PNG equivalents included. |
| Interface icons | `ui-icons/*.svg` | 24 × 24 viewBox, 1.8 unit strokes, `currentColor`, round caps and joins |

The adaptive foreground and monochrome artwork fit inside a central circle approximately 626 px across, derived from 66/108 of the canvas. Keep that padding. The full app icon deliberately uses a larger symbol because it is a separate, flattened asset. Do not substitute it for the transparent adaptive foreground.

The static mask previews are visual checks, not screenshots from Android devices. Test the installed icon under available launcher masks and with themed icons enabled.

## Theme integration

Use `tokens/brand-tokens.json` as the reference for the app's existing theme. The CSS file is an equivalent web starting point. Keep the launch icon background #1F6B4A in both themes.

- Light primary action: #1F6B4A with white text.
- Dark primary action: #5FC495 with #0D1712 text.
- Light brass text: #855C0C. #C08A1E is a decorative accent, not small text on a light surface.
- Skip it uses slate, not warning red.
- Verdict pills always retain their text labels. Use the longer “Already included” label where space permits.
- The 34 tested pairings cover 26 text combinations and 8 border/focus combinations. This is color-pair validation, not a complete accessibility audit.

### Type

| Role | Family | Weight / suggested use |
| --- | --- | --- |
| Wordmark and headings | Bricolage Grotesque | 600–700; screen title 28, section title 20 |
| Reading and labels | Inter | 400–600; body 16, labels 14 |
| Amounts and percentages | JetBrains Mono | 500–600; size follows hierarchy |

Sizes are starting logical units, not a reason to disable system text scaling. Reserve 12 for supplementary captions, allow wrapping, and verify larger text settings. Maintain platform-appropriate touch targets independently of the visible icon or pill size.

The original variable fonts and their licenses are in `fonts`. Verify variable font support and family naming in the project's actual rendering stack. If static builds are required, obtain the appropriate official font distribution and retain its license. Do not ship this entire design kit inside the application bundle.

## Component behavior

Rebuild the reference components using the app's existing native components. Do not put the exported button pictures into interactive controls.

| State | Treatment | Behavior |
| --- | --- | --- |
| Default tip | Surface fill with visible border | Available choice |
| Selected tip | Brand fill, check, “Selected” label | Current user choice; expose selected state to assistive technology |
| Suggested tip | “Suggested” brass label | Guidance associated with the actual service; remains separate from selection |

The $80 bill and 15/18/20% examples only demonstrate styling. They are not new tipping policy. Preserve existing calculation, rounding, split-bill, and custom-tip behavior. Keep a clear no-tip choice where the product supports it. An “Already included” verdict must follow the service rules; a generic service charge does not automatically establish that a gratuity is included.

Empty-state copy proposals:

- History: “Your saved calculations will appear here.” Use only if the feature actually saves calculations.
- Holidays: “Add someone to start your holiday plan.” Use only if the existing feature supports this action.

The Pro tag and header are supplied without feature promises or price. Final paywall copy depends on confirmed free/Pro boundaries and purchase terms.

## Expo example, if this is an Expo project

After copying the PNGs to `assets/brand`, merge the relevant fields into the existing configuration. Preserve existing identifiers, plugins, and settings. Confirm behavior against the project's SDK and native setup.

```json
{
  "expo": {
    "icon": "./assets/brand/app-icon.png",
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/brand/adaptive-foreground.png",
        "backgroundColor": "#1F6B4A",
        "monochromeImage": "./assets/brand/monochrome.png"
      }
    },
    "plugins": [
      [
        "expo-splash-screen",
        {
          "image": "./assets/brand/splash.png",
          "imageWidth": 220,
          "backgroundColor": "#1F6B4A"
        }
      ]
    ]
  }
}
```

Check the splash in a preview or production build; Expo's documentation warns that Expo Go and development builds can show different splash behavior. Rebuild native assets after configuration changes. The `imageWidth` is a starting visual size to assess on devices.

## Store screenshot handoff

| Frame | Heading | Required actual screen |
| --- | --- | --- |
| 01 | Know what to tip. | Calculator with a realistic bill, tip, and total |
| 02 | Find the right call. | Service search or categories containing actual entries |
| 03 | Skip with confidence. | A real service whose documented verdict is Skip it |
| 04 | See why. | Explanation with source/context actually available to users |

Each frame reserves an 878 × 1560 area at x=101, y=328 for a 1080 × 1920 capture. Preserve its aspect ratio. Replace the placeholder with the capture, remove the template notice, and export RGB PNGs at 1080 × 1920. Inspect small-screen legibility and visible personal data before submission. Do not fabricate features or source links for the pictures.

## Implementation acceptance checks

1. Verify installed icon and splash appearance in a preview/production build, including themed launcher icons.
2. Verify light/dark screens and increased font scaling without clipping or hidden controls.
3. Confirm selected, suggested, custom, and no-tip choices remain distinct and accessible.
4. Verify calculations and saved-state behavior are unchanged by styling.
5. Capture real app screens; final store screenshots remain outstanding.

## References checked October 16, 2026

- [Android adaptive icon guidance](https://developer.android.com/develop/ui/compose/system/icon_design_adaptive)
- [Expo splash screen and app icon](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/)
- [Google Play preview assets](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en)
- Original fonts: [Bricolage Grotesque](https://github.com/google/fonts/tree/main/ofl/bricolagegrotesque), [Inter](https://github.com/google/fonts/tree/main/ofl/inter), [JetBrains Mono](https://github.com/google/fonts/tree/main/ofl/jetbrainsmono)
