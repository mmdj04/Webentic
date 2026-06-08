import { withContentlayer } from 'next-contentlayer2'

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  transpilePackages: ['ui', 'common', 'shared-data', 'icons', 'tsconfig'],
  basePath: '',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
    ],
  },
  turbopack: {
    rules: {
      '*.md': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },
  async redirects() {
    return [
      // Add a redirect to make the custom block for tanstack-db
      {
        source: '/r/tanstack-db-nextjs.json',
        destination: '/api/registry/tanstack-db',
        permanent: true,
      },
    ]
  },
}

export default withContentlayer(nextConfig)
