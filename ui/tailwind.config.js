const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: ["class", '[data-mode="dark"]'],
  theme: {
    extend: {
      colors: {
        red: {
          50: '#FEF2F2',
          100: '#FDE4E3',
          200: '#FDCDCB',
          300: '#FAAAA7',
          400: '#F47A75',
          500: '#EA4F49',
          600: '#D83731',
          700: '#B52520',
          800: '#95231F',
          900: '#7C2320',
          950: '#430E0C',
        },
        green: {
          50: '#F3FAF4',
          100: '#E4F4E7',
          200: '#CAE8CF',
          300: '#A0D5AB',
          400: '#6FB97F',
          500: '#4A9D5C',
          600: '#3F8E50',
          700: '#2F663C',
          800: '#2A5133',
          900: '#24432B',
          950: '#0F2415',
        },
      },
    },
  },
  plugins: [
    require('./plugins/layouts/topbar.js'),
    require('./plugins/layouts/sidebar.js'),
    require('./plugins/layouts/others.js'),
    require('./plugins/layouts/footer.js'),
    require('./plugins/layouts/page-heading.js'),
    require('./plugins/layouts/boxed.js'),
    require('./plugins/layouts/horizontal.js'),
    require('./plugins/layouts/semibox.js'),
    require('./plugins/pixeleyezui/accordion.js'),
    require('./plugins/pixeleyezui/alerts.js'),
    require('./plugins/pixeleyezui/badge.js'),
    require('./plugins/pixeleyezui/breadcrumb.js'),
    require('./plugins/pixeleyezui/btn-group.js'),
    require('./plugins/pixeleyezui/btn-navigation.js'),
    require('./plugins/pixeleyezui/buttons.js'),
    require('./plugins/pixeleyezui/cards.js'),
    require('./plugins/pixeleyezui/drawer.js'),
    require('./plugins/pixeleyezui/dropdown.js'),
    require('./plugins/pixeleyezui/forms.js'),
    require('./plugins/pixeleyezui/links.js'),
    require('./plugins/pixeleyezui/spin-loader.js'),
    require('./plugins/pixeleyezui/timeline.js'),
  ],
} 