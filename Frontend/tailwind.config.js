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
          'navy-light': '#0a4ca2',
          gold: '#caa631',
          'gold-light': '#e9d750',
          bg: '#f7f7f7',
        },
      },
      backgroundImage: {
        'sgss-gradient': 'linear-gradient(90deg, #03045f 0%, #0a4ca2 40%, #caa631 100%)',
        'sgss-sidebar': 'linear-gradient(180deg, #03045f 0%, #000030 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'soft': '0 10px 40px -10px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
