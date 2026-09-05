/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Covers cards.scryfall.io for card art and svgs.scryfall.io for set icons.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.scryfall.io',
      },
    ],
    // Card art comes straight from the Scryfall CDN, on every host.
    //
    // There is little for an optimizer to do here. Scryfall publishes each card at the
    // three sizes this app asks for, already compressed, and serves them from its own
    // CDN. Optimizing them re-encodes a file that is already the right size, and puts
    // a hop between the visitor and a CDN that was already close to them.
    //
    // It also does not hold up. An optimizer counts each new source image against a
    // quota, and this app browses every paper card ever printed, so that count has no
    // ceiling to grow toward. When the quota runs out, every card the optimizer has
    // not already seen answers 402 and the page shows an empty frame.
    //
    // The local runs already took the images straight from Scryfall, for a reason that
    // still holds: Node sends its own User-Agent, and Scryfall answers 400 to it.
    unoptimized: true,
  },
};

export default nextConfig;
