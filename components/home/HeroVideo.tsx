"use client";

import { useEffect, useRef } from "react";

/**
 * Background video for the hero.
 *
 * The video is an enhancement, never the content: the gradient behind it always
 * paints, so the headline is legible from the first frame and nothing shifts if
 * the file is missing or blocked.
 *
 * `src` is attached imperatively rather than rendered, so a visitor who
 * shouldn't get the video downloads nothing at all — `preload="none"` alone
 * still lets some browsers fetch metadata. It also keeps the decision out of
 * React state, which would cost a re-render to reach the same DOM.
 */
export function HeroVideo({ src, className }: { src: string; className?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Honour the OS setting: a looping background is exactly the kind of motion
    // people switch this on to avoid.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Don't spend someone's metered data on decoration.
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
    ).connection;
    if (connection?.saveData) return;
    if (connection?.effectiveType && /^(slow-)?2g$/.test(connection.effectiveType)) return;

    const reveal = () => video.classList.remove("opacity-0");
    video.addEventListener("loadeddata", reveal, { once: true });

    video.src = src;
    // Autoplay can still be refused even when muted; the gradient is already
    // behind it, so a refusal needs no handling beyond not crashing.
    void video.play().catch(() => {});

    return () => {
      video.removeEventListener("loadeddata", reveal);
      video.removeAttribute("src");
      video.load();
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      // Fades in only once real frames exist, so the gradient is never
      // interrupted by a flash of empty element.
      className={`${className ?? ""} opacity-0 transition-opacity duration-700`}
      muted
      loop
      playsInline
      preload="none"
      // Decorative: it carries nothing the headline doesn't already say.
      aria-hidden
      tabIndex={-1}
    />
  );
}
