// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // app 디렉터리로 경로 변경
    "./components/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      fontFamily: {
        brygada: ['"Brygada"', 'serif'],
        roboto: ['"Roboto"', 'sans-serif'],
        inter: ['"Inter"','serif']
      },
      backgroundImage: {
        'profile': "url('/profile.jpg')",

      },
      fontWeight:{
        'mediumbold': "450"
      }
    },
  },
  plugins: [],
}
