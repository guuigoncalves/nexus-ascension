# Card Layout & Rarity Reference

This file documents the official visual system used for Card Frames, Borders, and Glows in the application.

## Source of Truth
The "old style" layout is defined in:
- **Component**: `src/components/CardVisual.tsx`
- **Colors**: `src/constants/rarityColors.ts`

## Rarity System (Colors & Glows)
The visual system uses exact HEX colors for borders and "neon" box-shadow auras.

| Rarity      | Hex Color | Visual Notes                 |
| :---        | :---      | :---                         |
| **Supremo** | `#FFFFFF` | Special Orange Aura (`#fb923c88`) |
| **Destruidor**| `#4c1d95` | Dark Purple                  |
| **Lendário**| `#dc2626` | Red                          |
| **Titã**    | `#eab308` | Gold                         |
| **Elite**   | `#1e3a8a` | Dark Blue                    |
| **Veterano**| `#16a34a` | Green                        |
| **Gladiador**| `#a16207` | Bronze                       |
| **Paladino**| `#94a3b8` | Silver/Grey                  |
| **Efeito**  | `#06b6d4` | Cyan                         |
| **Zeta**    | `#000000` | Black                        |
| **Fusão**   | `#FF00FF` | Magenta                      |

## Visual Structure (CardVisual.tsx)
1. **Border**: `1px solid ${auraColor}44` (Subtle transparency)
2. **Glow (Shadow)**: `0 0 20px ${auraColor}66` (Neon effect)
   - *Supremo Exception*: `0 0 25px` with specific orange glow.
3. **Background**: `bg-gray-950`
4. **Overlay**: Bottom gradient `from-black via-black/80` to transparent.

## Text Layout
- **Name**: Top, centered, small caps, drop shadow.
- **Rarity**: Bottom, centered, widely spaced.
- **Stats**: Row of two boxes (ATK/DEF) or Hidden for Effect cards.
- **Ability/Description**: Bottom-most, centered, bold, drop-shadowed white text.
