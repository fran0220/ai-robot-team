import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Empty turbopack config to enable Turbopack (Next.js 16 default)
  turbopack: {},
  
  // External packages for server components
  serverExternalPackages: ['pg'],
};

export default withNextIntl(nextConfig);
