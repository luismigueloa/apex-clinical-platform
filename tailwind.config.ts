import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#F8F9FA',
        'bg-card': '#FFFFFF',
        border: '#E5E7EB',
        navy: '#1B3A5C',
        'risk-high': '#DC2626',
        'risk-medium': '#D97706',
        'risk-low': '#16A34A',
        'data-blue': '#2563EB',
        'text-primary': '#111827',
        'text-muted': '#6B7280',
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        mono: ['var(--font-jetbrains-mono)'],
      },
    },
  },
  plugins: [],
};
export default config;
