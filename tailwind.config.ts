import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs pour "je paie"
        paie: {
          light: "#FFA07A",
          DEFAULT: "#FF6347",
          dark: "#DC143C",
        },
        // Couleurs pour "je reçois"
        recu: {
          light: "#90EE90",
          DEFAULT: "#32CD32",
          dark: "#228B22",
        },
        // Couleurs neutres
        fiscal: {
          50: "#f8f9fa",
          100: "#e9ecef",
          200: "#dee2e6",
          300: "#ced4da",
          400: "#adb5bd",
          500: "#6c757d",
          600: "#495057",
          700: "#343a40",
          800: "#212529",
          900: "#181c1f",
        },
      },
    },
  },
  plugins: [],
};

export default config;
