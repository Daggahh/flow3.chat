import useSWR from "swr";
import { useRef, useEffect, useCallback, useState } from "react";

type ScrollFlag = ScrollBehavior | false;

export function useScrollToBottom() {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const { data: isAtBottom = false, mutate: setIsAtBottom } = useSWR(
    "messages:is-at-bottom",
    null,
    { fallbackData: false }
  );

  const { data: scrollBehavior = false, mutate: setScrollBehavior } =
    useSWR<ScrollFlag>("messages:should-scroll", null, { fallbackData: false });

  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const checkScrollable = () => {
      const el = containerRef.current;
      if (!el) return;
      setIsScrollable(el.scrollHeight > el.clientHeight + 2); // allow for rounding
    };
    checkScrollable();
    const resizeObserver = new window.ResizeObserver(checkScrollable);
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (scrollBehavior) {
      endRef.current?.scrollIntoView({ behavior: scrollBehavior });
      setScrollBehavior(false);
    }
  }, [setScrollBehavior, scrollBehavior]);

  const scrollToBottom = useCallback(
    (scrollBehavior: ScrollBehavior = "smooth") => {
      setScrollBehavior(scrollBehavior);
    },
    [setScrollBehavior]
  );

  function onViewportEnter() {
    setIsAtBottom(true);
  }

  function onViewportLeave() {
    setIsAtBottom(false);
  }

  return {
    containerRef,
    endRef,
    isAtBottom,
    isScrollable,
    scrollToBottom,
    onViewportEnter,
    onViewportLeave,
  };
}
