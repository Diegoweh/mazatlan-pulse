import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Captioned image.
 *
 * `sizes` is required rather than optional: getting it wrong is the most common
 * way next/image quietly ships a 2x-too-large file, and the correct value
 * depends on the layout the caller puts this in.
 */
export function Figure({
  src,
  alt,
  caption,
  sizes,
  className,
  imageClassName,
  priority = false,
}: {
  src: string;
  alt: string;
  caption?: string;
  sizes: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}) {
  return (
    <figure className={cn("group", className)}>
      <div className={cn("relative overflow-hidden rounded-[14px] bg-teal-wash", imageClassName)}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
          priority={priority}
        />
      </div>
      {caption ? <figcaption className="mt-2 text-xs text-muted">{caption}</figcaption> : null}
    </figure>
  );
}
