// Framework-neutral design values. Map into the existing app theme.
export const modernMint = {
  "name": "Tip or Skip / Modern Mint",
  "version": "1.0.0",
  "palette": {
    "ink": "#182322",
    "mint": "#ACF4CE",
    "teal": "#12745F",
    "cloud": "#F6F8F6"
  },
  "themes": {
    "light": {
      "background": "#F6F8F6",
      "surface": "#FFFFFF",
      "surfaceAlt": "#E9EEEB",
      "text": "#182322",
      "textSecondary": "#53625D",
      "border": "#7E8E86",
      "divider": "#DAE2DD",
      "accent": "#12745F",
      "onAccent": "#FFFFFF",
      "selected": "#182322",
      "onSelected": "#ACF4CE",
      "result": "#ACF4CE",
      "onResult": "#182322",
      "focus": "#12745F",
      "disabledBackground": "#E3E8E5",
      "disabledText": "#5B6963",
      "error": "#A32C33",
      "onError": "#FFFFFF",
      "suggestedBackground": "#FFF0BF",
      "suggestedText": "#6D4C00",
      "verdicts": {
        "yes": {
          "background": "#ACF4CE",
          "text": "#182322"
        },
        "optional": {
          "background": "#FFE4A0",
          "text": "#543C00"
        },
        "skip": {
          "background": "#DFE6E9",
          "text": "#293E47"
        },
        "included": {
          "background": "#DDEBFF",
          "text": "#244A78"
        }
      }
    },
    "dark": {
      "background": "#101A18",
      "surface": "#1B2B27",
      "surfaceAlt": "#253A33",
      "text": "#F4F8F5",
      "textSecondary": "#B5C8BE",
      "border": "#708E80",
      "divider": "#3B5248",
      "accent": "#ACF4CE",
      "onAccent": "#182322",
      "selected": "#ACF4CE",
      "onSelected": "#182322",
      "result": "#ACF4CE",
      "onResult": "#182322",
      "focus": "#ACF4CE",
      "disabledBackground": "#2B3E35",
      "disabledText": "#B5C8BE",
      "error": "#FFC2C4",
      "onError": "#4E0D16",
      "suggestedBackground": "#493B15",
      "suggestedText": "#FFE4A0",
      "verdicts": {
        "yes": {
          "background": "#ACF4CE",
          "text": "#182322"
        },
        "optional": {
          "background": "#FFE4A0",
          "text": "#543C00"
        },
        "skip": {
          "background": "#DFE6E9",
          "text": "#293E47"
        },
        "included": {
          "background": "#DDEBFF",
          "text": "#244A78"
        }
      }
    }
  },
  "typography": {
    "family": "Inter",
    "roles": {
      "wordmark": {
        "asset": "Inter-logo.ttf",
        "weight": 900
      },
      "title": {
        "asset": "Inter-display.ttf",
        "weight": 800,
        "size": 28,
        "lineHeight": 34
      },
      "body": {
        "asset": "Inter-body.ttf",
        "weight": 400,
        "size": 16,
        "lineHeight": 24
      },
      "label": {
        "asset": "Inter-medium.ttf",
        "weight": 600,
        "size": 14,
        "lineHeight": 20
      },
      "amount": {
        "asset": "Inter-amount.ttf",
        "weight": 600,
        "size": 48,
        "lineHeight": 56,
        "features": [
          "tnum"
        ]
      },
      "caption": {
        "size": 12,
        "lineHeight": 16
      }
    }
  },
  "spacing": [
    4,
    8,
    12,
    16,
    20,
    24,
    32,
    48
  ],
  "radius": {
    "control": 12,
    "card": 20,
    "pill": 999
  },
  "layout": {
    "screenPadding": 20,
    "controlMinHeight": 48,
    "iconSize": 24,
    "iconStroke": 1.8
  }
} as const;
export type ModernMintMode = keyof typeof modernMint.themes;
