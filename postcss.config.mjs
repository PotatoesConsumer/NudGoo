/**
 * Tailwind CSS v4 is configured CSS-first via `@import "tailwindcss"` and
 * an `@theme` block in src/app/globals.css. PostCSS only needs the plugin.
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
