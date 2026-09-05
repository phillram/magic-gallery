<div align="center">

# ✨ Magic Card Browser

**Browse, search, and filter every paper Magic: The Gathering card.**
Card data comes from the [Scryfall API](https://scryfall.com/docs/api).

[**Live app**](https://magic-gallery.vercel.app/) · [Report a problem](https://github.com/phillram/magic-gallery/issues)

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Scryfall](https://img.shields.io/badge/data-Scryfall-FFB300)](https://scryfall.com)

<img src="docs/browse.jpg" alt="The card browser with the red, creature, and mythic filters on" width="900">

</div>

## Features

| | |
| --- | --- |
| 🔍 **Search** | Find cards by name. The app waits for a pause in your typing, then sends one query. |
| 🎛️ **Filters** | One bar above the results holds set, color, type, rarity, and mana value. Each menu shows how many choices are on. Mana value takes an exact number or a range. |
| 🏷️ **Filter chips** | Each active filter shows as a chip. Click a chip to remove that filter. |
| 🔗 **Shareable links** | The filters and the sort stay in the URL. Send the link, or use the back button. |
| ↩️ **A way back** | Open a card, and the link back returns you to the same results. |
| ↕️ **Sort** | Sort by release date, name, mana value, rarity, price, or Commander popularity. |
| 🃏 **Card page** | See the rules text, the flavor text, the artist, the prices, the formats the card is legal in, and links to Scryfall, Gatherer, TCGplayer, EDHREC, and Archidekt. |
| 🔀 **Two-sided cards** | Turn a transform card over with the face switch. |
| 🗂️ **All versions** | See every paper printing of a card, grouped by set, with variant and price details. |
| 🎨 **One per art** | The versions page opens with one printing for each piece of art. Switch to every printing to see the reprints as well. |
| 🎲 **Random card** | Open a random card from any page. |
| 🌙 **Dark theme** | A warm dark theme that fits narrow windows, with a visible focus ring on every control. |

<div align="center">
<img src="docs/card.jpg" alt="The card page for Lightning Bolt" width="900">
<img src="docs/versions.jpg" alt="All paper printings of Lightning Bolt, grouped by set" width="900">
</div>

## Quick start

You need Node.js 24. The repo holds that version in `.nvmrc`.

```bash
git clone https://github.com/phillram/magic-gallery.git
cd magic-gallery
npm install
npm run dev
```

Then open <http://localhost:3000>.

The app needs no API key and no configuration. It calls the public Scryfall API.

| Command | Action |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Make a production build. |
| `npm start` | Serve the production build. |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Run the TypeScript compiler. |

## Pages

| Route | Content |
| --- | --- |
| `/` | The card browser: filters, sort, and the results grid. |
| `/card/[id]` | One printing, with full details and external links. |
| `/card/[id]/versions` | All paper printings of that card, grouped by set. |

## Filter parameters

The browser writes the filters into the query string. You can also write the URL yourself.

| Parameter | Example | Meaning |
| --- | --- | --- |
| `q` | `q=bolt` | Card name contains this text. |
| `set` | `set=lea,2ed` | One or more set codes. |
| `color` | `color=R,U` | One or more of `W`, `U`, `B`, `R`, `G`, `C` (colorless). |
| `type` | `type=Creature` | One or more card types. |
| `rarity` | `rarity=rare,mythic` | One or more of `common`, `uncommon`, `rare`, `mythic`. |
| `cmc` | `cmc=3` | An exact mana value. |
| `cmcmin` / `cmcmax` | `cmcmin=1&cmcmax=3` | A mana value range. |
| `sort` | `sort=usd_desc` | The sort order. Left out when it is the default, newest first. |

Example: [`/?q=dragon&color=R&rarity=mythic&cmcmax=5`](https://magic-gallery.vercel.app/?q=dragon&color=R&rarity=mythic&cmcmax=5)

## Project layout

```text
app/          Routes: the browser, the card page, and the versions page
app/api/      The set icon route, which finds the icon file a set uses
components/   The UI: filters, grids, card details, and mana symbols
lib/          Scryfall calls, types, filter helpers, and print grouping
docs/         Screenshots for this file
```

## Tech stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, and the Scryfall API.

## Credits

- Card data and images: [Scryfall](https://scryfall.com).
- Magic: The Gathering is a trademark of Wizards of the Coast. This project is unofficial fan content.
- Code: MIT license.
