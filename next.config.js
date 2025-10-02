/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    // Enable app directory
    appDir: true,
  },
};

module.exports = nextConfig;