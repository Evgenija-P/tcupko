"use client";

import type { ComponentProps } from "react";

/**
 * GET form that applies itself on change (checkbox, select). Text inputs (price) apply on
 * Enter or blur. Without JS it is a normal form with a submit button.
 */
export function AutoSubmitForm({ children, ...props }: ComponentProps<"form">) {
  return (
    <form
      method="get"
      {...props}
      onChange={(e) => {
        const t = e.target as unknown as HTMLInputElement;
        if (t.type === "checkbox" || t.tagName === "SELECT") e.currentTarget.requestSubmit();
      }}
      onBlur={(e) => {
        const t = e.target as unknown as HTMLInputElement;
        if (t.type === "number" && t.value !== t.defaultValue) e.currentTarget.requestSubmit();
      }}
    >
      {children}
    </form>
  );
}
