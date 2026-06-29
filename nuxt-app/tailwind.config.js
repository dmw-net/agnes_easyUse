// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './components/**/*.{js,ts,jsx,tsx,vue}',
    './layouts/**/*.{js,ts,jsx,tsx,vue}',
    './pages/**/*.{js,ts,jsx,tsx,vue}',
    './app.vue'
  ],
  theme: {
    extend: {
      // 设计稿配色方案
      colors: {
        'bg-primary': '#030014',
        'bg-card': 'rgba(255, 255, 255, 0.02)',
        'text-primary': '#FFFFFF',
        'text-secondary': '#A0A0B0',
        'text-muted': 'rgba(255, 255, 255, 0.65)'
      },
      // 字体族
      fontFamily: {
        'heading': ['Inter Tight', 'sans-serif'],
        'body': ['Inter', 'sans-serif']
      },
      // 圆角
      borderRadius: {
        'btn': '99px',
        'card': '20px',
        'placeholder': '12px'
      },
      // 间距 (设计稿规范)
      spacing: {
        'section-y': '120px',
        'section-x': '80px'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms')
  ]
}
