/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    "text-blue-400",
    "border-blue-400",
    "bg-blue-600",
    "hover:bg-blue-700",
    "hover:bg-blue-400",
    "hover:text-white",
    "bg-gradient-to-r",
    "from-gray-900",
    "via-gray-800",
    "to-gray-900",
    "text-white",
    "dark:bg-gradient-to-r",
    "dark:from-gray-900",
    "dark:via-gray-800",
    "dark:to-gray-900",
    "text-gray-900",
    "from-blue-100",
    "via-blue-50",
    "to-blue-100",
    "from-blue-500",
    "from-blue-300",
  ],
 // darkMode: "class", // Use the 'dark' class to toggle dark mode
  theme: {
    extend: {
      fontFamily: {
      limelight: ['var(--font-limelight)'],
       goldman: ['var(--font-goldman)'],
       jaini: ['var(--font-jaini-purva)'],
        jersey: ['var(--font-jersey-10)'],
         fira: ['var(--font-fira-code)'],
         outfit: ['var(--font-outfit)'],
    },
    
    },
  },
  plugins: [],
};