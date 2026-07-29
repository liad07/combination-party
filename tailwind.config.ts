import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#070b16",
        panel: "#10182a",
        cyan: "#36d9ff",
        violet: "#9b7bff",
        success: "#49e5a5",
      },
      boxShadow: {
        glow: "0 0 30px rgba(54, 217, 255, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
