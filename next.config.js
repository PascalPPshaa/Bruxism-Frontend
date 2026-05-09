// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
// }

// module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // Jika frontend memanggil URL yang diawali /api-backend/
        source: '/api-backend/:path*',
        // Maka Next.js akan meneruskannya ke ngrok
        destination: 'https://85a1-103-3-222-190.ngrok-free.app/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig