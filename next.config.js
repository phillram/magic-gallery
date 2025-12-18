/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cards.scryfall.io'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.scryfall.io',
      },
    ],
  },
};

export default nextConfig;
