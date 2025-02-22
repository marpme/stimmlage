export const randomizeLogoBars = () => {
  const blackBarWidth = Math.floor(Math.random() * 32) + 16; // Random width between 16px and 48px
  const redBarWidth = Math.floor(Math.random() * 32) + 16;
  const goldBarWidth = Math.floor(Math.random() * 32) + 16;

  document.documentElement.style.setProperty(
    "--black-bar-width",
    `${blackBarWidth}px`,
  );
  document.documentElement.style.setProperty(
    "--red-bar-width",
    `${redBarWidth}px`,
  );
  document.documentElement.style.setProperty(
    "--gold-bar-width",
    `${goldBarWidth}px`,
  );
};
