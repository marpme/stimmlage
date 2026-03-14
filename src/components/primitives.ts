type TitleOptions = {
  color?:
    | "accent"
    | "muted"
    | "violet"
    | "yellow"
    | "blue"
    | "cyan"
    | "green"
    | "pink"
    | "foreground";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
};

export const title = (options: TitleOptions = {}) => {
  const { color, size = "md", fullWidth } = options;

  const sizeClass = {
    sm: "text-2xl lg:text-3xl",
    md: "text-3xl lg:text-4xl leading-tight",
    lg: "text-4xl lg:text-5xl",
  }[size];

  const colorClass =
    color === "accent"
      ? "text-accent"
      : color === "muted"
        ? "text-ink-secondary"
        : "text-ink";

  return [
    "tracking-tight inline font-bold",
    sizeClass,
    colorClass,
    fullWidth ? "w-full block" : "",
  ]
    .filter(Boolean)
    .join(" ");
};

type SubtitleOptions = {
  class?: string;
  fullWidth?: boolean;
};

export const subtitle = (options: SubtitleOptions = {}) => {
  return [
    "w-full md:w-1/2 my-2 text-base lg:text-lg text-ink-secondary block max-w-full",
    options.fullWidth === false ? "" : "!w-full",
    options.class ?? "",
  ]
    .filter(Boolean)
    .join(" ");
};
