/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true, // This will ignore ESLint errors during build
  },
  typescript: {
    ignoreBuildErrors: true, // This will ignore TypeScript errors during build
  },
  experimental: {
    serverActions: true,
  }
}

export default nextConfig
