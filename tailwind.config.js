/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Poppins', 'sans-serif']
    },
    colors: {
      primary: '#fffefd',
      'primary-content': '#474746',
      secondary: '#FFD0B7',
      'secondary-content': '#332924',
      accent: '#FFB2A9',
      'accent-content': '#1E1815',
      neutral: '#DDFFFF',
      'neutral-content': '#393B60',
      'neutral-gradient': '#A1BAD7',
      error: '#DE1441',
      success: '#60ED38',
      info: '#3860ED',
      warning: '#ED6A38'
    }
  },
  plugins: []
}
