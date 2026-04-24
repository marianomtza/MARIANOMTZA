import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Silence the multiple lockfiles warning when building inside a worktree
  outputFileTracingRoot: path.join(__dirname),
}

export default nextConfig
