/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        manrope: ["Manrope", "sans-serif"],
        lufga: ["Lufga", "sans-serif"], 
        geist: ["var(--font-geist-sans)", "sans-serif"],
        geistMono: ["var(--font-geist-mono)", "monospace"],
        outfit: ["var(--font-outfit)", "sans-serif"], // ✅ Added Outfit
      },
    },
  },
  plugins: [],
};
