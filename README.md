# Magic Card Browser

A comprehensive Next.js web application for browsing, searching, and filtering Magic: The Gathering cards.

## Features

- 🃏 **Full Card Browser** - Browse thousands of Magic: The Gathering cards
- 🔍 **Advanced Search** - Search cards by name with real-time results
- 🎨 **Mana Color Filters** - Filter by White, Blue, Black, Red, Green
- 📊 **Card Type Filters** - Filter by Creature, Instant, Sorcery, Enchantment, Artifact, Land, Planeswalker
- 💰 **Mana Value Filters** - Filter by exact mana value or mana range
- ⭐ **Rarity Filters** - Filter by Common, Uncommon, Rare, Mythic
- 🎯 **Set Selection** - Filter cards by expansion set
- 🎲 **Random Card** - Find a random card with one click
- 📱 **Lazy Loading** - Images load efficiently as you scroll
- 🔄 **Load More** - Pagination for browsing large sets
- 🌙 **Dark Mode** - Eye-friendly dark theme throughout
- 🖼️ **Card Images** - High-quality card images from Scryfall
- 🔀 **Double-Sided Cards** - Toggle between front and back of transform cards
- 🔗 **External Links** - Direct links to Scryfall, Gatherer, TCGPlayer, EDHREC, and Archidekt
- 📖 **Full Card Details** - Complete card text, mana cost, type, power/toughness, and more
- 🔄 **Clear Filters** - One-click button to reset all filters
- ⏳ **Loading Indicators** - Visual feedback while searching

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd magic-gallery
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Technology Stack

- **Next.js 14** - React framework for production
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Scryfall API** - Magic card data source
- **Lucide React** - Icon library

## How to Use

1. **Browse Cards**: The main page displays all available Magic cards
2. **Search**: Use the search box to find cards by name
3. **Filter by Set**: Select specific Magic sets from the dropdown
4. **Filter by Colors**: Click color buttons to filter by mana colors
5. **Filter by Type**: Check card types you want to see
6. **Filter by Rarity**: Select rarity levels
7. **Filter by Mana**: Choose exact mana value or a range
8. **Random Card**: Click the dice button to find a random card
9. **Clear Filters**: Click "Clear All" to reset all filters
10. **View Card Details**: Click any card to see full details
11. **External Links**: On the card detail page, access Scryfall, Gatherer, TCGPlayer, and more
12. **Double-Sided Cards**: Use the toggle buttons to switch between card faces

## API

This application uses the free Scryfall API:
- https://scryfall.com/docs/api

## Features Breakdown

### Filtering System
- **Set Filter**: Dropdown to select one or multiple sets
- **Mana Color Filter**: Button grid for easy color selection
- **Card Type Filter**: Checkboxes for multiple card types
- **Mana Value Filter**: Toggle between exact value or range selection
- **Rarity Filter**: Checkbox selection for rarity levels
- **Search**: Real-time search with debouncing

### Card Display
- **Grid Layout**: Responsive 1-4 column layout based on screen size
- **Lazy Loading**: Images load only when needed
- **Hover Effects**: Visual feedback on card hover
- **Card Info**: Card name, set, and rarity displayed below image

### Card Details Page
- **Card Image**: High-resolution card image
- **Card Stats**: Mana cost, CMC, power/toughness
- **Card Text**: Full Oracle text of the card
- **Set Info**: Set name and release date
- **Rarity**: Card rarity in the set
- **External Links**: Quick access to major Magic websites
- **Double-Sided Support**: Toggle between card faces

## Performance Optimizations

- Image lazy loading with Next.js Image component
- Debounced search to reduce API calls
- Pagination with "Load More" button
- Responsive images for different screen sizes
- CSS class optimization with Tailwind CSS

## Customization

You can customize colors, sizes, and behavior by:

1. **Dark Mode**: Modify Tailwind theme in `tailwind.config.ts`
2. **API Queries**: Adjust search logic in `lib/api.ts`
3. **Card Display**: Edit layouts in component files
4. **Filter Options**: Update filter choices in `components/FilterSidebar.tsx`

## License

This project is open source and available under the MIT License.

## Support

For issues or feature requests, please open an issue in the repository.

## Acknowledgments

- Card data provided by [Scryfall](https://scryfall.com)
- Magic: The Gathering is owned by Wizards of the Coast
