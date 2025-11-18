/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brandYellow: "#c7c744",
        brandDark: "#000000",
        brandGrey: "#1a1a1a",
        brandGrey2: "#333333"
      },
      transitionProperty: {
        position: "left, right, top"
      },
      boxShadow: {
        'card': '0 6px 18px rgba(0,0,0,0.6)'
      },
        keyframes: {
    fade: {
      "0%": { opacity: "0" },
      "100%": { opacity: "1" },
    },
    scaleIn: {
      "0%": { opacity: "0", transform: "scale(0.8)" },
      "100%": { opacity: "1", transform: "scale(1)" },
    },
  },
  animation: {
    fade: "fade 0.25s ease-out forwards",
    scaleIn: "scaleIn 0.25s ease-out forwards",
  }
    },
  },
  plugins: [],
}
