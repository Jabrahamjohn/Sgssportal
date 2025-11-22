/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  corePlugins: {
    preflight: false, // you already rely on your own base CSS
  },
  mode: 'jit',
  theme: {
    screens: {
      xs: '400px',
      sm: '580px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        sgss: {
          navy: '#03045f',
          gold: '#caa631',
        },
      },
    },
  },
  plugins: [],
};
