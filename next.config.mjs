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
    // Next's own image optimizer asks Scryfall for the file with the User-Agent that
    // Node sends by default, and Scryfall answers 400, so a local run shows card
    // frames with no art in them. Vercel optimizes with its own fetcher, which
    // Scryfall accepts, so only the runs off Vercel take the images straight from
    // the Scryfall CDN.
    unoptimized: process.env.VERCEL !== '1',
  },
};

export default nextConfig;
