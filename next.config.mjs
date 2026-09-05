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
  },
};

export default nextConfig;
