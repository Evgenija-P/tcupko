"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
};

/** Native <dialog>: focus trap, Escape and backdrop come from the browser. */
export function Modal({ open, onClose, title, children, className = "max-w-md" }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  // sync the prop with the DOM dialog state (imperative API, not data)
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-labelledby="modal-title"
      className={`m-auto w-[calc(100%-32px)] rounded-xl bg-page p-0 text-ink backdrop:bg-inverse/50 ${className}`}
    >
      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-center gap-4">
          <h2 id="modal-title" className="flex-1 text-xl font-semibold">
            {title}
          </h2>
          <button type="button" aria-label="Закрити" onClick={onClose} className="-m-2 p-2">
            <X className="size-6" aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
