/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta basada en tu logo (Tronco Marrón, Hojas Verdes)
        'robles-green': {
          light: '#E8F5E9',
          DEFAULT: '#4CAF50', // Verde hoja vibrante
          dark: '#2E7D32',
        },
        'robles-brown': {
          light: '#D7CCC8',
          DEFAULT: '#795548', // Marrón tronco
          dark: '#4E342E',
        },
        'robles-accent': '#FFC107', // Amarillo sol para destacar
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'], // Fuente redondeada y amigable
      },
      borderRadius: {
        '4xl': '2rem', // Bordes más suaves
      }
    },
  },
  plugins: [],
}