module.exports = {
  purge: [
    './src/**/*.html',
    './src/**/*.js',
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
          },
        },
        dark: {
          css: {
            color: theme("colors.gray.300"),
            '[class~="lead"]': { color: theme("colors.gray.400") },
            a: { color: theme("colors.gray.300") },
            strong: { color: theme("colors.gray.300") },
            "ul > li::before": { backgroundColor: theme("colors.green.900") },
            "ol > li::before": { color: theme("colors.green.900") },
            hr: { borderColor: theme("colors.green.700") },
            blockquote: {
              color: theme("colors.gray.300"),
              borderLeftColor: theme("colors.green.700"),
            },
            h1: { color: theme("colors.gray.300") },
            h2: { color: theme("colors.gray.300") },
            h3: { color: theme("colors.gray.300") },
            h4: { color: theme("colors.gray.300") },
            code: { color: theme("colors.gray.300") },
            "a code": { color: theme("colors.gray.300") },
            pre: {
              color: theme("colors.gray.200"),
              backgroundColor: theme("colors.gray.800"),
            },
            "tbody tr": { borderBottomColor: theme("colors.green.900") },
          },
        },
      }),
    },
  },

  variants: {
    extend: { typography: ["dark"] }
  },

  plugins: [
    require("@tailwindcss/typography")
  ],
}
