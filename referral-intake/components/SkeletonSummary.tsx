import type { CSSProperties } from "react";

const ROWS = 6;

export function SkeletonSummary() {
  return (
    <div className="skeleton-summary" aria-hidden="true">
      {Array.from({ length: ROWS }).map((_, i) => {
        const style = { animationDelay: `${i * 60}ms` } as CSSProperties;
        return (
          <div className="skeleton-row" style={style} key={i}>
            <div className="skeleton-bar label" />
            <div>
              <div className="skeleton-bar wide" />
              <div className="skeleton-bar medium" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
