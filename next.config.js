/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  // Performance optimizations
  compress: true,
  productionBrowserSourceMaps: false,
  optimizeFonts: true,
  poweredByHeader: false,
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js'],
  },
}

module.exports = nextConfig
