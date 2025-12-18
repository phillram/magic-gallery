# Project File Structure & Description

## Complete File Tree

```
magic-card-browser/
│
├── 📦 Configuration & Build
│   ├── package.json                    Dependencies & npm scripts
│   ├── tsconfig.json                   TypeScript configuration
│   ├── next.config.js                  Next.js configuration
│   ├── tailwind.config.ts              Tailwind CSS theme configuration
│   ├── postcss.config.js               PostCSS plugins (Tailwind)
│   ├── .env.local                      Environment variables
│   ├── .gitignore                      Git ignore rules
│   └── README.md                       Project overview
│
├── 📂 app/ (Next.js App Directory)
│   │
│   ├── layout.tsx                      Root layout template
│   │   └── Wraps all pages in dark mode
│   │       Includes <html>, <body> structure
│   │       Loads globals.css
│   │       Sets metadata
│   │
│   ├── page.tsx                        🏠 Home page (/)
│   │   ├── Main card browser interface
│   │   ├── Manages filter state
│   │   ├── Fetches and displays cards
│   │   ├── Handles pagination with "Load More"
│   │   └── Side-by-side grid + sidebar layout
│   │
│   ├── globals.css                     Global styles
│   │   ├── Tailwind directives
│   │   ├── Custom scrollbar styles
│   │   ├── Dark mode base styles
│   │   └── System-wide defaults
│   │
│   └── 📂 card/[id]/
│       ├── page.tsx                    📖 Card detail page (/card/[id])
│       │   ├── Server component
│       │   ├── Fetches single card by ID
│       │   ├── Displays CardDetail component
│       │   ├── Includes back button
│       │   └── Handles 404 for missing cards
│       │
│       └── not-found.tsx               404 page
│           ├── Custom not found page
│           ├── Shows when card ID invalid
│           └── Provides back button
│
├── 📂 components/ (React Components)
│   │
│   ├── Header.tsx                      🎨 Navigation header
│   │   ├── Sticky top navigation
│   │   ├── Logo / title
│   │   ├── Subtitle
│   │   └── Click to return home
│   │
│   ├── FilterSidebar.tsx               🔍 All filters
│   │   ├── Manages all filter state
│   │   ├── Search by card name
│   │   │   └── Real-time input
│   │   ├── Set dropdown
│   │   │   └── Multiple selection
│   │   ├── Mana color buttons
│   │   │   └── 5 color buttons (W/U/B/R/G)
│   │   ├── Card type checkboxes
│   │   │   └── 7 types
│   │   ├── Rarity checkboxes
│   │   │   └── 4 rarities
│   │   ├── Mana value toggle
│   │   │   ├── Exact mode: single input
│   │   │   └── Range mode: min/max inputs
│   │   └── Clear All button (red)
│   │       └── Resets all filters
│   │
│   ├── CardGrid.tsx                    🃏 Card display grid
│   │   ├── Responsive grid layout
│   │   │   ├── 1 column (mobile)
│   │   │   ├── 2 columns (tablet)
│   │   │   └── 3-4 columns (desktop)
│   │   ├── Card cards with:
│   │   │   ├── Lazy-loaded images
│   │   │   ├── Card name
│   │   │   ├── Set name
│   │   │   ├── Rarity display
│   │   │   └── Hover effects
│   │   ├── "No cards found" message
│   │   ├── Loading spinner
│   │   │   └── Animated with text
│   │   └── "Load More" button
│   │       └── Pagination trigger
│   │
│   ├── CardDetail.tsx                  📋 Card information display
│   │   ├── Two-column layout
│   │   ├── Left: Card image
│   │   │   ├── High-res image from Scryfall
│   │   │   ├── Lazy loading
│   │   │   └── For double-sided: toggle buttons
│   │   └── Right: Card info
│   │       ├── Card name & type
│   │       ├── Mana cost & CMC
│   │       ├── Power/Toughness (if applicable)
│   │       ├── Set & release date
│   │       ├── Rarity
│   │       ├── Full card text
│   │       └── External links (5 websites)
│   │
│   └── RandomCardButton.tsx            🎲 Random card finder
│       ├── Purple button with dice
│       ├── Fetches random card
│       ├── Navigates to card detail page
│       └── Shows loading state
│
├── 📂 lib/ (Utilities & Types)
│   │
│   ├── api.ts                          🔌 Scryfall API integration
│   │   ├── SCRYFALL_API_BASE constant
│   │   │
│   │   ├── fetchSets()
│   │   │   └── Returns all Magic sets sorted by date
│   │   │
│   │   ├── searchCards(filters, page)
│   │   │   ├── Builds dynamic search query
│   │   │   ├── Applies all filter types
│   │   │   ├── Handles pagination
│   │   │   └── Returns cards + total count
│   │   │
│   │   ├── fetchCardById(id)
│   │   │   └── Returns single card by ID
│   │   │
│   │   ├── fetchRandomCard()
│   │   │   └── Returns random paper Magic card
│   │   │
│   │   ├── getManaSymbol(mana)
│   │   │   └── Converts mana to emoji symbols
│   │   │
│   │   └── getExternalLinks(card)
│   │       └── Generates links to 5 external websites
│   │
│   ├── types.ts                        📝 TypeScript type definitions
│   │   ├── CardFace
│   │   │   ├── For double-sided cards
│   │   │   └── Contains face-specific info
│   │   │
│   │   ├── Card
│   │   │   ├── Complete card data structure
│   │   │   ├── Includes all properties from Scryfall
│   │   │   └── Supports normal & double-sided cards
│   │   │
│   │   ├── Set
│   │   │   └── Magic set information
│   │   │
│   │   └── FilterOptions
│   │       ├── Search string
│   │       ├── Selected sets
│   │       ├── Selected colors
│   │       ├── Selected types
│   │       ├── Selected rarities
│   │       ├── Min/Max mana
│   │       └── Exact mana
│   │
│   └── utils.ts                        🛠️ Helper functions
│       ├── cn()
│       │   └── Class name merger (like clsx)
│       │
│       └── debounce()
│           └── Debounced function wrapper
│
├── 📄 Documentation Files
│   │
│   ├── README.md                       📖 Main documentation
│   │   ├── Features overview
│   │   ├── Getting started
│   │   ├── Technology stack
│   │   ├── How to use
│   │   ├── Features breakdown
│   │   ├── Performance notes
│   │   └── Customization guide
│   │
│   ├── SETUP.md                        🚀 Detailed setup guide
│   │   ├── Quick start instructions
│   │   ├── Installation steps
│   │   ├── Project structure explanation
│   │   ├── File descriptions
│   │   ├── Styling information
│   │   ├── API details
│   │   ├── Customization examples
│   │   ├── Troubleshooting guide
│   │   └── Deployment options
│   │
│   ├── QUICKSTART.md                   ⚡ Quick reference
│   │   ├── Installation commands
│   │   ├── Features overview
│   │   ├── Filter explanations
│   │   ├── Color scheme reference
│   │   ├── Troubleshooting quick tips
│   │   └── File editing guidelines
│   │
│   ├── IMPLEMENTATION.md               ✨ Complete implementation details
│   │   ├── Project overview
│   │   ├── Feature checklist (all ✅)
│   │   ├── Project structure explanation
│   │   ├── Component descriptions
│   │   ├── Design system details
│   │   ├── API integration guide
│   │   ├── User workflows
│   │   ├── Development tips
│   │   ├── Performance metrics
│   │   ├── Known limitations
│   │   ├── Future enhancement ideas
│   │   └── Testing checklist
│   │
│   └── API_REFERENCE.md                📚 Scryfall API reference
│       ├── All API endpoints
│       ├── Query operator guide
│       ├── Query examples
│       ├── Response format examples
│       ├── Pagination explanation
│       ├── URL encoding info
│       ├── Error response formats
│       ├── Rate limit info
│       ├── Image URL formats
│       ├── Testing queries
│       └── Integration code examples
│
├── 🚀 Setup Scripts
│   │
│   ├── start.bat                       🪟 Windows quick start
│   │   ├── Checks Node.js installation
│   │   ├── Installs dependencies
│   │   └── Starts dev server
│   │
│   └── start.sh                        🐧 macOS/Linux quick start
│       ├── Checks Node.js installation
│       ├── Installs dependencies
│       └── Starts dev server
│
└── 📁 Generated Folders (ignored)
    ├── node_modules/                   Installed dependencies
    └── .next/                          Built Next.js files
```

---

## Quick File Reference

### Essential Files to Edit

**Change Colors:**
- `tailwind.config.ts` - Modify color palette

**Change Filters:**
- `components/FilterSidebar.tsx` - Edit filter options
- `lib/api.ts` - Modify search query building

**Change Layout:**
- `components/CardGrid.tsx` - Modify grid columns
- `app/page.tsx` - Change sidebar/grid layout

**Change Card Display:**
- `components/CardDetail.tsx` - Modify card info display
- `lib/api.ts` - Add/remove external links

**Change Styles:**
- `app/globals.css` - Global styles
- Component files - Component-specific styles

### Files NOT to Edit

- `node_modules/` - Installed packages
- `.next/` - Built Next.js output
- `package-lock.json` - Dependency lock file
- `.gitignore` - Git configuration

### Generated Files (Don't commit)

```
.next/
node_modules/
*.log
```

---

## File Statistics

| Category | Count | Files |
|----------|-------|-------|
| React Components | 5 | CardGrid, CardDetail, FilterSidebar, Header, RandomCardButton |
| Next.js Pages | 3 | home, card/[id], card/not-found |
| TypeScript/API | 3 | api, types, utils |
| Config Files | 7 | package.json, tsconfig, next.config, tailwind, postcss, .env, .gitignore |
| Documentation | 5 | README, SETUP, QUICKSTART, IMPLEMENTATION, API_REFERENCE |
| Setup Scripts | 2 | start.bat, start.sh |
| Styles | 1 | globals.css |
| **TOTAL** | **26** | **Complete application** |

---

## Development Workflow

### Adding a New Filter

1. **Define Type**: Add to `FilterOptions` in `lib/types.ts`
2. **Create UI**: Add control to `components/FilterSidebar.tsx`
3. **Build Query**: Update `searchCards()` in `lib/api.ts`
4. **Test**: Reload browser and verify filter works

### Adding a New Component

1. **Create File**: `components/MyComponent.tsx`
2. **Add Imports**: Required React/Next.js modules
3. **Export**: Default export component
4. **Use**: Import in pages/components that need it

### Modifying Card Display

1. **Edit**: `components/CardDetail.tsx` or `components/CardGrid.tsx`
2. **Update**: Styling in Tailwind classes
3. **Test**: View in browser to verify layout

### Deploying to Production

1. **Build**: `npm run build`
2. **Test**: `npm start` (runs production build)
3. **Deploy**: Use Vercel, Docker, or your hosting provider

---

## Import Paths

The project uses TypeScript path aliasing:

```typescript
// Instead of:
import { Card } from '../../../lib/types';

// Use:
import { Card } from '@/lib/types';
```

`@/` automatically maps to the project root.

---

**All files are ready to use. No additional setup needed!** 🎉
