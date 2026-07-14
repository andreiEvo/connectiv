type LogoProps = {
  className?: string;
  size?: number;
};

/**
 * Connectiv bolt mark — outlined stroke, sharp classic angles.
 * Path is authored on a 32x32 grid so it stays legible down to app-icon size.
 */
export function Logo({ className, size = 28 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="connectiv"
    >
      <path
        d="M18.5 2L7 18H14.5L13 30L25 13H17.5L18.5 2Z"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinejoin="miter"
        strokeLinecap="square"
        fill="none"
      />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`font-display font-semibold tracking-tight ${className ?? ""}`}>
      connect<span className="text-accent">iv</span>
    </span>
  );
}
