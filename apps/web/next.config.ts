// apps/web/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ❌ Do NOT set `output: 'export'` if you use NextAuth/middleware/API routes.
  // output: 'standalone' is OK, 'export' is NOT.
};

module.exports = nextConfig;
