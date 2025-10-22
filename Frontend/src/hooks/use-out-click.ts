import React from 'react';

type UseOutClickOptions = {
  /** Whether clicking outside should close the container (default: true) */
  shouldClose?: boolean;
};

/**
 * A hook to detect outside clicks from a container and optional button.
 * Commonly used for dropdowns, modals, and popovers.
 *
 * @template Container HTMLElement type of the container.
 * @template Button HTMLElement type of the trigger button (optional).
 *
 * @param options - Optional config to control behavior.
 * @returns Object with `ref`, `buttonRef`, `visible`, and `setVisible`.
 */
const useOutClick = <Container extends HTMLElement, Button extends HTMLElement = HTMLDivElement>(
  options?: UseOutClickOptions
) => {
  const [visible, setVisible] = React.useState<boolean>(false);
  const ref = React.useRef<Container>(null);
  const buttonRef = React.useRef<Button>(null);

  const { shouldClose = true } = options || {};

  const handleMouseClick = React.useCallback(
    ({ target }: Event): void => {
      if (typeof document !== 'undefined' && typeof window !== 'undefined' && shouldClose) {
        const container = ref.current;
        const button = buttonRef.current;

        const clickedOutsideContainer =
          container && typeof container.contains === 'function' && !container.contains(target as Element);

        const clickedOutsideButton =
          button && typeof button.contains === 'function' && !button.contains(target as Element);

        if (clickedOutsideContainer && (!button || clickedOutsideButton)) {
          setVisible(false);
        }
      }
    },
    [shouldClose]
  );

  React.useEffect(() => {
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      window.document.addEventListener('click', handleMouseClick, true);
    }

    return () => {
      if (typeof document !== 'undefined' && typeof window !== 'undefined') {
        window.document.removeEventListener('click', handleMouseClick, true);
      }
    };
  }, [handleMouseClick]);

  return {
    ref,
    buttonRef,
    visible,
    setVisible,
  };
};

export default useOutClick;
