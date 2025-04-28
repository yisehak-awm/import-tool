export default {
  plugins:
    process.env.NODE_ENV === "publish"
      ? {
          "@tailwindcss/postcss": {},
          cssnano: {},
        }
      : {
          "@tailwindcss/postcss": {},
        },
};
