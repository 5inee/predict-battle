/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ['ar'],
    defaultLocale: 'ar',
  },
  eslint: {
    // تخطي فحص ESLint أثناء بناء المشروع
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig