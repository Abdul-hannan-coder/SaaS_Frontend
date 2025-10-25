/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // Reduce bundle size for icon libraries and other ESM packages
    optimizePackageImports: ["lucide-react"],
  },
}

export default nextConfig
