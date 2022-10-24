/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["www.placecage.com", "images.unsplash.com"],
  },
};

module.exports = nextConfig;
