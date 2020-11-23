const colors = require('tailwindcss/colors')

module.exports = {
  theme: {
    colors: {
      transparent: 'transparent',
      gray: colors.blueGray,
      red: colors.red,
      blue: colors.lightBlue,
      orange: colors.amber,
      yellow: colors.yellow,
      pink: colors.pink,
      teal: colors.teal,
      green: colors.green,
    },
    screens: {
      sm: '640px',
      md: '768px',
    },
    container: {
      center: true,
      padding: '1.5rem',
    },
  },
  variants: {
    backgroundColor: ['hover', 'focus', 'active'],
  },
}
