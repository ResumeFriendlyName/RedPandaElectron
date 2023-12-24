/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Poppins', 'sans-serif']
    },
    colors: {
      primary: '#fffefd',
      secondary: '#223854',
      accent: '#ed3860',
      error: '#DE1441',
      success: '#60ED38',
      info: '#3860ED',
      warning: '#ED6A38'
    }
  },
  plugins: []
}
