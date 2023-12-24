/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Poppins', 'sans-serif']
    },
    colors: {
      primary: '#82d1cc',
      secondary: '#2d2d47',
      accent: '#da6a47',
      error: '#d18287',
      success: '#afd182',
      info: '#82afd1',
      warning: '#d1cc82'
    }
  },
  plugins: []
}
