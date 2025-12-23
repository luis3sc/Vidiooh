/** @type {import('next').NextConfig} */
const nextConfig = {
  // CONFIGURACIÓN CRÍTICA PARA FFMPEG.WASM
  // Sin esto, el navegador bloqueará la conversión de video
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig