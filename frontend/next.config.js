/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env : {
    MORALIS_TESTNET_SERVER_URL : process.env.MORALIS_TESTNET_SERVER_URL,
    MORALIS_TESTNET_APP_ID : process.env.MORALIS_TESTNET_APP_ID,
    MORALIS_TESTNET_MASTER_KEY : process.env.MORALIS_TESTNET_MASTER_KEY,
    MORALIS_TESTNET_SERVER_URL : process.env.MORALIS_TESTNET_SERVER_URL,
    MORALIS_MAINNET_SERVER_URL : process.env.MORALIS_MAINNET_SERVER_URL,
    MORALIS_MAINNET_APP_ID : process.env.MORALIS_MAINNET_APP_ID,
    MORALIS_MAINNET_MASTER_KEY : process.env.MORALIS_MAINNET_MASTER_KEY,
    NFT_STORAGE_TOKEN : process.env.NFT_STORAGE_TOKEN,
    NETWORK : process.env.NETWORK
  },
  experimental: {
    images: {
      unoptimized: true,
    }
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
