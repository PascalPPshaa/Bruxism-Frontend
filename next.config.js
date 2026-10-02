// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
// }

// module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!backendUrl) {
      console.warn('NEXT_PUBLIC_API_URL is not defined — API rewrites will be skipped.');
      return [];
    }

    return [
      {
        // Jika frontend memanggil URL yang diawali /api-backend/
        source: '/api-backend/:path*',
        // Maka Next.js akan meneruskannya ke backend API
        destination: `${backendUrl}/:path*`,
      },
    ]
  },
}

module.exports = nextConfig