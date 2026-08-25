import { flushSync } from "react-dom";

export function withViewTransition(update: () => void): void {
  const supportsViewTransitions = typeof document !== "undefined" && "startViewTransition" in document;
  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!supportsViewTransitions || prefersReducedMotion) {
    update();
    return;
  }

  const transition = document.startViewTransition(() => {
    flushSync(update);
  });

  // The transition itself is a progressive enhancement — if the browser
  // skips or aborts it (e.g. a second transition superseding this one),
  // the state update above has already applied. Never let that surface
  // as an unhandled rejection.
  transition.ready.catch(() => {});
  transition.finished.catch(() => {});
}
