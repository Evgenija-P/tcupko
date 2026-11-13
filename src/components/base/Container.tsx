import type { ComponentProps } from "react";

/** Content width 1280px (80px side margins at 1440), 16px gutters on mobile. */
export function Container({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`mx-auto w-full max-w-[1312px] px-4 ${className}`} {...props} />;
}
