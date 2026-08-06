import { useEffect, useRef, useState, type ComponentType, type CSSProperties, type Ref } from 'react';
import clsx from 'clsx';

const layoutClassName = 'react-grid-layout';

type WidthProviderInputProps = {
  measureBeforeMount?: boolean;
  className?: string;
  style?: CSSProperties;
  innerRef?: Ref<HTMLElement>;
};

export type WidthProviderComponentProps = WidthProviderInputProps & {
  width: number;
};

/**
 * WidthProvider replacement that ignores sub-pixel resize noise.
 * Prevents react-grid-layout from entering a setState loop when layout
 * changes cause the container width to oscillate (e.g. scrollbar toggling).
 */
export function createStableWidthProvider(
  ComposedComponent: ComponentType<WidthProviderComponentProps & Record<string, unknown>>,
) {
  function StableWidthProvider(props: WidthProviderInputProps & Record<string, unknown>) {
    const { measureBeforeMount = false, className, style, innerRef, ...rest } = props;
    const [width, setWidth] = useState(1280);
    const [mounted, setMounted] = useState(false);
    const elementRef = useRef<HTMLElement | null>(null);
    const widthRef = useRef(1280);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      const node = elementRef.current;
      if (!(node instanceof HTMLElement)) return;

      let rafId: number | null = null;

      const commitWidth = (nextWidth: number) => {
        const roundedWidth = Math.round(nextWidth);
        if (roundedWidth <= 0 || roundedWidth === widthRef.current) return;
        widthRef.current = roundedWidth;
        setWidth(roundedWidth);
      };

      const observer = new ResizeObserver((entries) => {
        if (!entries[0]) return;
        const nextWidth = entries[0].contentRect.width;
        if (rafId !== null) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          commitWidth(nextWidth);
          rafId = null;
        });
      });

      observer.observe(node);
      commitWidth(node.getBoundingClientRect().width);

      return () => {
        if (rafId !== null) cancelAnimationFrame(rafId);
        observer.disconnect();
      };
    }, [mounted]);

    const setElementRef = (node: HTMLElement | null) => {
      elementRef.current = node;
      if (typeof innerRef === 'function') {
        innerRef(node);
      } else if (innerRef && typeof innerRef === 'object') {
        innerRef.current = node;
      }
    };

    if (measureBeforeMount && !mounted) {
      return (
        <div
          className={clsx(className, layoutClassName)}
          style={style}
          ref={setElementRef}
        />
      );
    }

    return (
      <ComposedComponent
        {...rest}
        innerRef={setElementRef}
        className={className}
        style={style}
        width={width}
      />
    );
  }

  StableWidthProvider.displayName = `StableWidthProvider(${ComposedComponent.displayName || ComposedComponent.name || 'Component'})`;
  return StableWidthProvider;
}
