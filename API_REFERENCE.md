# API Query Examples & Reference

## Scryfall API Documentation

**Official Docs:** https://scryfall.com/docs/api
**Base URL:** https://api.scryfall.com

---

## Basic Endpoints

### Search Cards
```
GET /cards/search?q={query}&order={order}&dir={dir}&page={page}

Examples:
- https://api.scryfall.com/cards/search?q=name:avada
- https://api.scryfall.com/cards/search?q=game:paper&order=released&dir=desc
- https://api.scryfall.com/cards/search?q=t:creature%20c:r&page=2
```

### Get Single Card
```
GET /cards/{id}
GET /cards/named?exact={name}
GET /cards/multiverse/{multiverse_id}

Examples:
- https://api.scryfall.com/cards/550b48f1-37c5-4e64-9b91-db2f0c44e83c
- https://api.scryfall.com/cards/named?exact=Lightning%20Bolt
```

### Random Card
```
GET /cards/random?q={query}

Examples:
- https://api.scryfall.com/cards/random?q=game:paper
- https://api.scryfall.com/cards/random?q=t:creature%20c:w
```

### Get All Sets
```
GET /sets

Example:
- https://api.scryfall.com/sets
```

---

## Query Operators

### Exact Match
```
name:"Lightning Bolt"
```

### Partial Match
```
name:lightning
```

### Equality
```
rarity:common
cmc:5
```

### Comparison
```
cmc>=3
cmc<=5
power>=2
toughness<=3
```

### Alternatives (OR)
```
(c:w OR c:u)
(set:neo OR set:ncc OR set:sld)
```

### Set
```
set:neo          (New Capenna)
set:ncc          (New Capenna Commander)
set:sld          (Secret Lair Drop Series)
```

### Mana Color
```
c:w              (White)
c:u              (Blue)
c:b              (Black)
c:r              (Red)
c:g              (Green)
c:m              (Multicolor)
(c:w OR c:u)     (White or Blue)
```

### Card Type
```
t:creature
t:instant
t:sorcery
t:enchantment
t:artifact
t:land
t:planeswalker
t:battle
(t:creature OR t:artifact)
```

### Rarity
```
r:common
r:uncommon
r:rare
r:mythic
```

### Game
```
game:paper       (Paper Magic only)
game:arena       (Magic Arena only)
-game:paper      (Not paper)
```

### Keywords
```
keyword:flying
keyword:haste
keyword:lifelink
```

### Other Properties
```
is:foil          (Foil only)
-is:foil         (Not foil)
is:nonfoil       (Nonfoil only)
reserved:true    (Reserved list)
has:art_crop     (Has art crop image)
```

---

## Query Examples Used in This App

### Default: All Paper Cards, Newest First
```
game:paper order=released&dir=desc&page=1
```

### Search by Name
```
game:paper name:"Avada Kedavra" order=released&dir=desc&page=1
```

### Filter by Set(s)
```
game:paper (set:neo OR set:ncc) order=released&dir=desc&page=1
```

### Filter by Mana Color(s)
```
game:paper (c:w OR c:u) order=released&dir=desc&page=1
```

### Filter by Card Type(s)
```
game:paper (t:creature OR t:instant) order=released&dir=desc&page=1
```

### Filter by Rarity
```
game:paper (r:rare OR r:mythic) order=released&dir=desc&page=1
```

### Filter by Mana Value (Exact)
```
game:paper cmc:5 order=released&dir=desc&page=1
```

### Filter by Mana Value (Range)
```
game:paper cmc>=3 cmc<=5 order=released&dir=desc&page=1
```

### Complex Filter Combining Everything
```
game:paper 
name:"Creature" 
(set:neo OR set:ncc) 
(c:w OR c:u OR c:r) 
(t:creature) 
(r:rare OR r:mythic) 
cmc>=3 cmc<=7
order=released&dir=desc&page=1
```

---

## Response Format

### Search Response
```json
{
  "object": "list",
  "total_cards": 123,
  "has_more": true,
  "next_page": "https://api.scryfall.com/cards/search?q=...",
  "data": [
    {
      "object": "card",
      "id": "550b48f1-37c5-4e64-9b91-db2f0c44e83c",
      "name": "Avada Kedavra",
      "mana_cost": "{2}{B}",
      "cmc": 3,
      "type_line": "Sorcery",
      "oracle_text": "Destroy target creature or planeswalker.",
      "rarity": "common",
      "set": "neo",
      "set_name": "New Capenna",
      "released_at": "2023-02-03",
      "scryfall_uri": "https://scryfall.com/card/neo/123/avada-kedavra",
      "image_uris": {
        "small": "https://cards.scryfall.io/small/front/...",
        "normal": "https://cards.scryfall.io/normal/front/...",
        "large": "https://cards.scryfall.io/large/front/...",
        "png": "https://cards.scryfall.io/png/front/...",
        "art_crop": "https://cards.scryfall.io/art_crop/front/...",
        "border_crop": "https://cards.scryfall.io/border_crop/front/..."
      }
    }
  ]
}
```

### Single Card Response
```json
{
  "object": "card",
  "id": "550b48f1-37c5-4e64-9b91-db2f0c44e83c",
  "name": "Avada Kedavra",
  "layout": "normal",
  "mana_cost": "{2}{B}",
  "cmc": 3,
  "type_line": "Sorcery",
  "oracle_text": "Destroy target creature.",
  "rarity": "common",
  "set": "neo",
  "set_name": "New Capenna",
  "released_at": "2023-02-03",
  "scryfall_uri": "https://scryfall.com/card/neo/123/avada-kedavra",
  "image_uris": { ... },
  "card_faces": null,
  "keywords": ["destroy"],
  "color_identity": ["B"],
  "games": ["paper", "arena"],
  "foil": true,
  "nonfoil": true,
  "oversized": false,
  "reserved": false
}
```

### Double-Sided Card (Transform)
```json
{
  "object": "card",
  "id": "...",
  "name": "Werewolf // Human",
  "layout": "transform",
  "card_faces": [
    {
      "object": "card_face",
      "name": "Creature A",
      "mana_cost": "{2}{G}",
      "type_line": "Creature — Werewolf",
      "oracle_text": "...",
      "image_uris": { ... }
    },
    {
      "object": "card_face",
      "name": "Creature B",
      "type_line": "Creature — Human",
      "oracle_text": "...",
      "image_uris": { ... }
    }
  ]
}
```

---

## Pagination

### How It Works
- Each search returns up to 175 cards per page
- Use `page=2`, `page=3`, etc. for more results
- `has_more` indicates if more pages exist
- `next_page` contains the URL for next page

### Example
```
Page 1: /cards/search?q=game:paper&page=1
Page 2: /cards/search?q=game:paper&page=2
Page 3: /cards/search?q=game:paper&page=3
```

---

## URL Encoding

Special characters must be URL encoded:

```
Space: %20 or +
": %22
(): %28 %29
|: %7C
```

Examples:
```
name:"Lightning Bolt"     → name:%22Lightning%20Bolt%22
(c:w OR c:u)             → %28c:w%20OR%20c:u%29
```

---

## Error Responses

### 404 - Not Found
```json
{
  "object": "error",
  "code": "not_found",
  "status": 404,
  "warnings": ["No cards matched your search."]
}
```

### 400 - Bad Request
```json
{
  "object": "error",
  "code": "invalid_request",
  "status": 400,
  "details": "Invalid query syntax"
}
```

### 429 - Too Many Requests
Rate limited (exceeds 60 req/sec)

---

## Rate Limits

- **Limit:** 60 requests per second
- **No API key required**
- **No authentication needed**
- **Recommended:** Add delays between requests

---

## Image URL Format

Card images available at multiple sizes:

```
// Standard sizes
https://cards.scryfall.io/normal/front/{id}.jpg      (488x680)
https://cards.scryfall.io/large/front/{id}.jpg       (672x936)
https://cards.scryfall.io/small/front/{id}.jpg       (204x283)

// Special crops
https://cards.scryfall.io/art_crop/front/{id}.jpg    (480x360)
https://cards.scryfall.io/border_crop/front/{id}.jpg (600x671)

// For double-sided, use "back" instead of "front"
https://cards.scryfall.io/normal/back/{id}.jpg
```

---

## Useful Queries for Testing

### Basic Test
```
https://api.scryfall.com/cards/random?q=game:paper
```

### Lightning Bolt Search
```
https://api.scryfall.com/cards/named?exact=Lightning%20Bolt
```

### All Red Creatures
```
https://api.scryfall.com/cards/search?q=game:paper%20c:r%20t:creature&order=released&dir=desc
```

### Expensive Cards (CMC >= 7)
```
https://api.scryfall.com/cards/search?q=game:paper%20cmc>=7&order=released&dir=desc
```

### Mythic Rare Creatures
```
https://api.scryfall.com/cards/search?q=game:paper%20r:mythic%20t:creature&order=released&dir=desc
```

### Latest Set Cards
```
https://api.scryfall.com/cards/search?q=set:neo&order=released&dir=desc
```

---

## Debugging Tips

1. **Test in Browser:** Paste URL directly in browser
2. **Check Response:** Use browser DevTools Network tab
3. **Format Query:** Use online URL encoder for special characters
4. **Simplify:** Start with basic query, add filters one at a time
5. **Check Syntax:** Ensure balanced parentheses and quotes

---

## Integration Code Example

```typescript
// From lib/api.ts
async function searchCards(filters: FilterOptions, page: number = 1) {
  let queryParts: string[] = [];
  
  // Build query from filters
  if (filters.search) {
    queryParts.push(`name:"${filters.search}"`);
  }
  if (filters.sets.length > 0) {
    queryParts.push(`(${filters.sets.map(s => `set:${s}`).join(' OR ')})`);
  }
  
  const query = `game:paper ${queryParts.join(' ')}`;
  const url = `${SCRYFALL_API_BASE}/cards/search?q=${encodeURIComponent(query)}&order=released&dir=desc&page=${page}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  return { cards: data.data, total: data.total_cards };
}
```

---

**Happy Filtering!** 🃏✨
