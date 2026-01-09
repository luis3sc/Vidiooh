/** @type {import('next').NextConfig} */
const nextConfig = {
  // Solución para que funcionen FFmpeg + Clarity + Imágenes externas
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless', // <--- CAMBIO CLAVE AQUÍ (Antes era 'require-corp')
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