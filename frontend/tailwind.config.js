/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
	theme: {
		extend: {
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			colors: {},
			keyframes: {
				ripple: {
				  '0%': { transform: 'scale(0)', opacity: '0.5' },
				  '100%': { transform: 'scale(4)', opacity: '0' },
				},
			},
			animation: {
				ripple: 'ripple 0.6s linear',
			},
			progress: {
				'0%': { width: '25%', marginLeft: '0%' },
				'50%': { width: '25%', marginLeft: '75%' },
				'100%': { width: '25%', marginLeft: '0%' }
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
}

