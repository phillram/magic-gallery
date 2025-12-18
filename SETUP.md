# Magic Card Browser - Setup Guide

## Project Overview

This is a modern Magic: The Gathering card browser built with Next.js, TypeScript, and Tailwind CSS. It fetches card data from the free Scryfall API and provides a beautiful, responsive interface for browsing and filtering cards.

## Complete Feature List

✅ **Display all Magic the Gathering cards**
- Fetches from Scryfall API with pagination
- Responsive grid layout (1-4 columns based on screen size)
- Default order by newest set first

✅ **Dropdown to select individual sets**
- Multiple set selection
- Dropdown populated from Scryfall API
- Real-time filtering

✅ **Filter by mana colors**
- White, Blue, Black, Red, Green buttons
- Visual selection with color indicators
- Multiple color selection support

✅ **Filter by card type**
- Creature, Instant, Sorcery, Enchantment, Artifact, Land, Planeswalker
- Checkbox selection
- Multiple type filtering

✅ **Filter by mana value**
- Toggle between exact value or range mode
- Exact mana value input
- Min/Max mana range inputs

✅ **Filter by rarity**
- Common, Uncommon, Rare, Mythic
- Checkbox selection
- Multiple rarity filtering

✅ **Search by card name**
- Real-time search with debouncing
- Integrated into filter sidebar
- Efficient API queries

✅ **Lazy loading**
- Next.js Image component with lazy loading
- "Load More" pagination button
- Efficient data fetching

✅ **Clear button to reset results**
- Single click to clear all filters
- Resets search, sets, colors, types, rarities, and mana value

✅ **Display full card text with image**
- High-resolution card images from Scryfall
- Complete Oracle text on detail page
- Card statistics (CMC, P/T, etc.)

✅ **Links to external websites**
- Scryfall (official database)
- Gatherer (official card reference)
- TCGPlayer (buying platform)
- EDHREC (EDH recommendations)
- Archidekt (deck building)

✅ **Button to find a random card**
- Purple "🎲 Random Card" button
- Takes you directly to the card detail page

✅ **Official Magic the Gathering Mana symbols**
- Color-coded buttons (W=Yellow, U=Blue, B=Black, R=Red, G=Green)
- Visual representation of mana colors

✅ **Display card image on /card/ page**
- Full-size card image with high resolution
- Image from Scryfall's official image service

✅ **Toggle double-sided cards**
- Switch between front and back faces
- Buttons show card face names
- Full support for transform cards

✅ **Filter search button**
- All filters apply in real-time
- No separate "Search" button needed (filters auto-apply with debounce)

✅ **Loading image while searching**
- Animated spinner during API calls
- Loading indicator next to spinner
- Disabled state for buttons during loading

✅ **Dark mode**
- Fully dark-themed UI
- Slate color palette (slate-950, 900, 800, 700, etc.)
- Eye-friendly for extended browsing

✅ **Default card order by newest set first**
- Scryfall API query: `order=released&dir=desc`
- Shows newest cards first

## Quick Start

### 1. Navigate to Project Directory

### 2. Install Dependencies

```bash
npm install
```

This will install:
- `next` - React framework
- `react` & `react-dom` - UI library
- `typescript` - Type safety
- `tailwindcss` - Styling
- `lucide-react` - Icons

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
magic-card-browser/
├── app/                           # Next.js app directory
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page with main browser
│   ├── globals.css                # Global styles
│   └── card/[id]/
│       ├── page.tsx              # Card detail page
│       └── not-found.tsx          # 404 page for cards
├── components/                    # React components
│   ├── CardDetail.tsx            # Card details display
│   ├── CardGrid.tsx              # Grid of cards with pagination
│   ├── FilterSidebar.tsx         # All filter controls
│   ├── Header.tsx                # Top navigation bar
│   └── RandomCardButton.tsx      # Random card button
├── lib/                          # Utility functions
│   ├── api.ts                    # Scryfall API functions
│   ├── types.ts                  # TypeScript type definitions
│   └── utils.ts                  # Helper utilities
├── public/                       # Static assets
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind CSS config
├── postcss.config.js             # PostCSS config
├── next.config.js                # Next.js config
└── README.md                     # Documentation
```

## File Descriptions

### Core Application Files

**app/page.tsx** - Main home page
- Manages filter state and card loading
- Displays filter sidebar and card grid
- Handles pagination with "Load More"

**app/card/[id]/page.tsx** - Card detail page
- Server component that fetches single card
- Displays full card information
- Shows card image and external links

**components/FilterSidebar.tsx** - All filtering controls
- Search by card name
- Set dropdown (multiple select)
- Mana color buttons
- Card type checkboxes
- Rarity checkboxes
- Mana value (exact or range)
- Clear filters button

**components/CardGrid.tsx** - Card display grid
- Responsive grid layout
- Lazy-loaded card images
- "Load More" button for pagination
- Loading spinner

**components/CardDetail.tsx** - Card detail display
- High-res card image
- Card stats and info
- Double-sided card toggle
- External links to Scryfall, Gatherer, TCGPlayer, EDHREC, Archidekt

**lib/api.ts** - API integration
- `fetchSets()` - Get all Magic sets
- `searchCards()` - Search with filters
- `fetchCardById()` - Get single card
- `fetchRandomCard()` - Get random card
- `getExternalLinks()` - Generate external URLs

**lib/types.ts** - TypeScript types
- `Card` - Card data structure
- `CardFace` - Card face for double-sided cards
- `Set` - Magic set
- `FilterOptions` - Filter state

## Styling

The application uses **Tailwind CSS** with a dark color scheme:
- Background: `bg-slate-950` (darkest)
- Cards: `bg-slate-900` or `bg-slate-800`
- Text: `text-slate-100` (light)
- Accents: `bg-blue-600`, `bg-red-600`, `bg-purple-600`

## API Details

### Scryfall API

The application uses the free Scryfall API:
- **Base URL**: https://api.scryfall.com
- **Rate Limit**: 60 requests per second (no key required)
- **Documentation**: https://scryfall.com/docs/api

### Search Query Format

```
game:paper name:"Avada Kedavra" (set:neo OR set:ncc) (c:w OR c:u) (t:creature) r:rare cmc:5
```

- `game:paper` - Paper Magic cards only
- `name:"..."` - Card name
- `set:...` - Expansion set code
- `c:...` - Mana color (w/u/b/r/g)
- `t:...` - Card type
- `r:...` - Rarity
- `cmc:...` - Converted mana cost

## Environment Variables

No environment variables are required. The app uses the free Scryfall API without authentication.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Performance Notes

- Images are lazy-loaded using Next.js Image optimization
- Search has 500ms debounce to reduce API calls
- Cards load in pages of 28 (Scryfall default)
- No external fonts loaded (system fonts used)

## Customization Guide

### Change Color Scheme

Edit `tailwind.config.ts` to modify the color palette:

```typescript
theme: {
  colors: {
    // Customize colors here
  }
}
```

### Add More Card Types

In `components/FilterSidebar.tsx`, update `CARD_TYPES`:

```typescript
const CARD_TYPES = ['Creature', 'Instant', 'Sorcery', 'Enchantment', 'Artifact', 'Land', 'Planeswalker', 'Battle'];
```

### Modify Cards Per Page

In `app/page.tsx`, change `cardsPerPage`:

```typescript
const cardsPerPage = 28; // Change this number
```

## Troubleshooting

### Cards Not Loading
1. Check internet connection
2. Verify Scryfall API is online (https://scryfall.com)
3. Check browser console for errors (F12)

### Images Not Showing
1. Verify `next.config.js` has correct image domains
2. Check that Scryfall API returned image URLs
3. Some old cards may not have images

### Search Not Working
1. Clear browser cache
2. Check that card names are spelled correctly
3. Try fewer filters

### Build Errors
1. Delete `node_modules` folder
2. Run `npm install` again
3. Clear `.next` folder

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Create production build
npm start        # Run production build
npm run lint     # Run ESLint
```

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t magic-card-browser .
docker run -p 3000:3000 magic-card-browser
```

## License

Open source - use freely for personal and commercial projects.

## Support & Community

- **Scryfall**: https://scryfall.com
- **Magic Rules**: https://magic.wizards.com
- **Next.js Docs**: https://nextjs.org/docs

---

Enjoy browsing Magic cards! 🃏✨
