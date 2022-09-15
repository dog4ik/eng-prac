/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["www.fillmurray.com"],
  },
};

module.exports = nextConfig;
