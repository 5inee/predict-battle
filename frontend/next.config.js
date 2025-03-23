/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    i18n: {
      // دعم اللغة العربية كلغة افتراضية
      locales: ['ar'],
      defaultLocale: 'ar',
    }
  }
  
  module.exports = nextConfig