import React, { useEffect, useRef } from 'react';

/**
 * useInfiniteScroll - A custom hook to implement infinite scrolling using IntersectionObserver.
 *
 * This hook observes a target DOM element and triggers the provided `fetchNextPage` callback
 * when the element becomes visible in the viewport (or a custom scroll container).
 *
 * ✅ Automatically reattaches the observer on dependency changes.
 * ✅ Works with any scrollable container using `rootRef`.
 * ✅ Cleans up properly to avoid stale or duplicate observers.
 *
 * ⚠️ WARNING:
 * This hook **does not work reliably** with elements rendered using `ReactDOM.createPortal`,
 * especially if the portalled element is:
 *   - outside the scrollable root,
 *   - inside a `position: fixed` container,
 *   - or not part of the visible scroll hierarchy.
 *
 * If you're using portals (e.g., modals or drawers), consider:
 *   - explicitly passing a `rootRef` pointing to the scroll container,
 *   - or falling back to `scroll`/`resize` event listeners in extreme cases.
 *
 * @param {Object} params
 * @param {React.RefObject<HTMLElement | null>} params.targetRef - Ref of the element to observe
 * @param {boolean} params.hasNextPage - If more pages are available
 * @param {boolean} params.isFetchingNextPage - If a fetch is in progress
 * @param {() => void} params.fetchNextPage - Callback to fetch the next page
 * @param {number} [params.threshold=0.1] - Portion of the element that must be visible
 * @param {React.RefObject<HTMLElement | null>} [params.rootRef] - Optional scroll container for observation
 */
export default function useInfiniteScroll({
  targetRef,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  threshold = 0.1,
  rootRef,
}: {
  targetRef: React.RefObject<HTMLElement | null>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  threshold?: number;
  rootRef?: React.RefObject<HTMLElement | null>;
}) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: rootRef?.current || undefined,
        threshold,
      }
    );

    const el = targetRef.current;
    if (el) {
      observerRef.current.observe(el);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, threshold, rootRef, targetRef]);
}
