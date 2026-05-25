import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "selector",
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        minsi: {
          ink: "#0E1138",
          primary: "#8074FD",
          muted: "#5D669C",
          line: "#E6E4FF",
          lavender: "#E5DCF9",
          bubble: "#EBE3FB"
        }
      },
      fontFamily: {
        sans: [
          "Microsoft YaHei",
          "Source Han Sans CN",
          "PingFang SC",
          "Hiragino Sans GB",
          "Arial",
          "sans-serif"
        ],
        kai: ["KaiTi", "STKaiti", "serif"]
      },
      boxShadow: {
        glass: "0 8px 30px rgba(128, 116, 253, 0.12)",
        bubble: "0 8px 15px rgba(183, 128, 201, 0.1), inset -6px -6px 8px #FEFEFD, inset 6px 6px 8px #FEFEFD",
        glow: "0 0 0 14px rgba(255,255,255,0.86), 0 0 34px rgba(128,116,253,0.34)"
      }
    }
  },
  plugins: []
};

export default config;
