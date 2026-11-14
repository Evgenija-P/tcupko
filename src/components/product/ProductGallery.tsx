"use client";

import Image from "next/image";
import { useState } from "react";
import { Package } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

type Img = { src: string; alt: string };

/** Thumbnails + main photo; click opens full screen (Figma "Галерея", "Повноекранна галерея"). */
export function ProductGallery({ images, name }: { images: Img[]; name: string }) {
  const [index, setIndex] = useState(0);
  const [full, setFull] = useState(false);
  const current = images[index];

  if (!current) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-surface text-ink-muted lg:w-[512px]">
        <Package className="size-16" aria-hidden />
        <span className="sr-only">Фото товару незабаром</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row lg:gap-4">
      {images.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto lg:w-24 lg:flex-col">
          {images.map((img, i) => (
            <li key={img.src}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Фото ${i + 1}`}
                aria-current={i === index || undefined}
                className={`relative block size-20 overflow-hidden rounded-lg border bg-surface lg:h-[88px] lg:w-24 ${
                  i === index ? "border-accent" : "border-line"
                }`}
              >
                <Image src={img.src} alt="" fill sizes="96px" className="object-contain" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-3 lg:w-[512px]">
        <button
          type="button"
          onClick={() => setFull(true)}
          className="relative aspect-square w-full overflow-hidden rounded-lg bg-surface"
          aria-label="Відкрити фото на весь екран"
        >
          <Image
            src={current.src}
            alt={current.alt || name}
            fill
            priority
            sizes="(min-width: 1024px) 512px, 100vw"
            className="object-contain"
          />
        </button>
        <p className="hidden text-sm text-ink-muted lg:block">
          Натисніть на фото, щоб відкрити на весь екран
        </p>
      </div>

      <Modal open={full} onClose={() => setFull(false)} title={name} className="max-w-5xl">
        <div className="relative aspect-square max-h-[75vh] w-full">
          <Image
            src={current.src}
            alt={current.alt || name}
            fill
            sizes="90vw"
            className="object-contain"
          />
        </div>
      </Modal>
    </div>
  );
}
