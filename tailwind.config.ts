import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}','./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A5F',
        accent: '#F59E0B',
        'accent-dark': '#D97706',
        'bg-soft': '#F8FAFC',
        muted: '#64748B',
      },
    },
  },
  plugins: [],
}
export default config
