import { useCallback, useEffect, useMemo, useState } from 'react';
import type { RefObject } from 'react';
import { useUserStore } from '../context/CTX_UserStore';
import { useUserStoreSync } from '../hooks/hooks';

type UserStatusRecord = { completed_onboarding?: boolean } | null | undefined;

interface Step {
  ref: RefObject<HTMLElement | null>;
  title: string;
  body: string;
  continueClickObject?: RefObject<HTMLElement | null>;
  onContinue?: () => void;
}

interface PI_TutorialOverlay {
  prSteps: Step[];
  prIsActive?: boolean;
  onFinish?: () => void;
}

export default function COM_TutorialOverlay({
  prSteps,
  prIsActive = true,
  onFinish,
}: PI_TutorialOverlay) {
  const userStore = useUserStore();
  const [statusState, setStatusState] = useState<UserStatusRecord>(
    userStore.read('PropertyStatus') as UserStatusRecord
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);

  useUserStoreSync(userStore, 'PropertyStatus', setStatusState, { autoFetch: true });

  const isCompleted = useMemo(() => {
    if (statusState && typeof statusState === 'object') {
      return Boolean((statusState as { completed_onboarding?: boolean }).completed_onboarding);
    }
    return false;
  }, [statusState]);

  const shouldRun = prIsActive && !isCompleted && prSteps.length > 0;
  const activeStep = shouldRun && !showCompletion ? prSteps[stepIndex] ?? null : null;
  const shouldRender = (shouldRun || showCompletion) && prSteps.length > 0;

  useEffect(() => {
    if (shouldRun) {
      setStepIndex(0);
      setShowCompletion(false);
    } else {
      setRect(null);
    }
  }, [shouldRun]);

  useEffect(() => {
    setStepIndex((current) => Math.min(current, Math.max(prSteps.length - 1, 0)));
  }, [prSteps.length]);

  const updateRect = useCallback(() => {
    if (!activeStep || !activeStep.ref?.current || showCompletion) {
      setRect(null);
      return;
    }
    const elementRect = activeStep.ref.current.getBoundingClientRect();
    setRect(elementRect);
  }, [activeStep, showCompletion]);

  useEffect(() => {
    if (!activeStep || showCompletion) {
      return undefined;
    }

    updateRect();

    const handleWindowUpdate = () => updateRect();

    window.addEventListener('scroll', handleWindowUpdate, true);
    window.addEventListener('resize', handleWindowUpdate);

    let resizeObserver: ResizeObserver | null = null;
    if (activeStep.ref.current) {
      resizeObserver = new ResizeObserver(() => updateRect());
      resizeObserver.observe(activeStep.ref.current);
    }

    const raf = window.requestAnimationFrame(updateRect);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('scroll', handleWindowUpdate, true);
      window.removeEventListener('resize', handleWindowUpdate);
      resizeObserver?.disconnect();
    };
  }, [activeStep, showCompletion, updateRect]);

  useEffect(() => {
    if (!activeStep || activeStep.ref.current) {
      return undefined;
    }
    const timer = window.setTimeout(() => updateRect(), 200);
    return () => window.clearTimeout(timer);
  }, [activeStep, updateRect]);

  const handleNext = useCallback(() => {
    if (activeStep?.onContinue) {
      activeStep.onContinue();
    }
    setStepIndex((current) => {
      if (current < prSteps.length - 1) {
        return current + 1;
      }
      setShowCompletion(true);
      setRect(null);
      return current;
    });
  }, [activeStep, prSteps.length]);

  useEffect(() => {
    if (!activeStep?.continueClickObject || showCompletion) {
      return undefined;
    }

    const handleContinueClick = () => {
      handleNext();
    };

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    const attachListener = (element: HTMLElement | null) => {
      if (!element || cancelled) {
        return;
      }
      element.addEventListener('click', handleContinueClick, { once: true });
      cleanup = () => {
        element.removeEventListener('click', handleContinueClick);
      };
    };

    const initialTarget = activeStep.continueClickObject.current;
    if (initialTarget) {
      attachListener(initialTarget);
      return () => {
        cancelled = true;
        cleanup?.();
      };
    }

    const observer = new MutationObserver(() => {
      const element = activeStep.continueClickObject?.current;
      if (element) {
        attachListener(element);
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelled = true;
      observer.disconnect();
      cleanup?.();
    };
  }, [activeStep, handleNext, showCompletion]);

  useEffect(() => {
    if (!activeStep || showCompletion) {
      return undefined;
    }
    const target = activeStep.ref.current;
    if (!target) {
      return undefined;
    }
    const raf = window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    });
    return () => window.cancelAnimationFrame(raf);
  }, [activeStep, showCompletion]);

  const handleClose = () => {
    const utPayload = { onboarding_completed: true };
    userStore.set('PropertyStatus', utPayload);
    userStore.post('PropertyStatus', utPayload);
    setShowCompletion(false);
    setRect(null);
    onFinish?.();
  };

  if (!shouldRender) {
    return null;
  }

  const padding = 8;
  const x = rect ? rect.x - padding : 0;
  const y = rect ? rect.y - padding : 0;
  const w = rect ? rect.width + padding * 2 : 0;
  const h = rect ? rect.height + padding * 2 : 0;

  const tooltipStyle =
    rect && !showCompletion
      ? {
          top: Math.max(Math.min(y + h + 16, window.innerHeight - 240), 16),
          left: Math.max(Math.min(x, window.innerWidth - 320), 16),
        }
      : {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };

  const needsExternalClick = Boolean(activeStep?.continueClickObject && !activeStep?.onContinue);
  const nextLabel = needsExternalClick
    ? 'Click highlighted area'
    : stepIndex === prSteps.length - 1
    ? 'Finish'
    : 'Next';

  return (
    <>
      <svg
        width={document.documentElement.scrollWidth}
        height={document.documentElement.scrollHeight}
        style={{ position: 'fixed', zIndex: 5, pointerEvents: 'none', top: 0, left: 0 }}
      >
        <mask id="hole-mask">
          <rect width="100%" height="100%" fill="white" />
          <rect x={x} y={y} width={w} height={h} fill="black" />
        </mask>
        <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.6)" mask="url(#hole-mask)" />
      </svg>
      <div className="area-tutorial-overlay mod-z-5">
        <div className="tooltip" style={tooltipStyle}>
          {!showCompletion && activeStep ? (
            <div className="look-div-solid area-flex-col mod-align-stretch">
              <p className="look-text-x2">{activeStep.title}</p>
              <p className="look-text-x1">{activeStep.body}</p>
              <button
                className="look-button-secondary"
                onClick={handleNext}
                disabled={needsExternalClick}
              >
                {nextLabel}
              </button>
            </div>
          ) : (
            <div className="look-div-solid area-flex-col mod-align-stretch">
              <p className="look-text-x2">You&apos;re all set!</p>
              <p className="look-text-x1">You now know where to find the key company insights.</p>
              <button className="look-button-secondary" onClick={handleClose}>
                Got It!
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
