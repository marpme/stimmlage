import { MutableRefObject, useEffect, useState } from "react";

export const useDimensions = (ref: MutableRefObject<Element | null>) => {
  const [dimensions, setDimensions] = useState<DOMRectReadOnly>(
    new DOMRectReadOnly(0, 0, 200, 200),
  );

  useEffect(() => {
    const observeTarget = ref.current;

    if (observeTarget === null || !(observeTarget instanceof Element)) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        setDimensions(entry.contentRect);
      });
    });

    resizeObserver.observe(observeTarget);

    return () => {
      resizeObserver.unobserve(observeTarget);
    };
  }, [ref]);

  return dimensions;
};
