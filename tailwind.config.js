/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Agregamos tu color de marca aquí
       vidiooh: {
          DEFAULT: '#F04E30', // Tu Naranja Oficial
          hover: '#d63f25',   // Esto genera la clase con sufijo (ej: bg-vidiooh-hover)
          dark: '#d63f25',    // Un tono más oscuro para efectos hover
          light: '#ff6b4f',   // Un tono más claro (opcional)
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      // --- NUEVA ANIMACIÓN PARA EL SLIDER ---
      animation: {
        scroll: 'scroll 40s linear infinite',
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      },
      // --------------------------------------
    },
  },
  plugins: [],
};