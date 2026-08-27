/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Nunito", "Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        telugu: ["'Noto Sans Telugu'", "sans-serif"],
        deva: ["'Noto Sans Devanagari'", "sans-serif"]
      },
      colors: {
        // Duolingo-inspired palette (renamed to our penguin theme).
        duo: {
          green: "#58CC02",
          greenDark: "#4CA700",
          blue: "#4C6EF5",
          blueDark: "#3B5BDB",
          red: "#FF4B4B",
          redDark: "#EA2B2B",
          yellow: "#FFC800",
          yellowDark: "#E6A600",
          orange: "#FF9600",
          purple: "#CE82FF",
          purpleDark: "#B368E0",
          // Neutrals (Duolingo names): eel=ink, wolf/hare=grays, swan=border, polar=bg.
          eel: "#4B4B4B",
          wolf: "#777777",
          hare: "#AFAFAF",
          swan: "#E5E5E5",
          polar: "#F7F7F7",
          // Feedback fills.
          correctBg: "#D7FFB8",
          correctInk: "#58A700",
          wrongBg: "#FFDFE0",
          wrongInk: "#EA2B2B"
        }
      }
    }
  },
  plugins: []
};
