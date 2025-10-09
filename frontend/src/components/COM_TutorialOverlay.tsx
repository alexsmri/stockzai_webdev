import { useCallback, useEffect, useMemo, useState } from 'react';
import type { RefObject } from 'react';
import { useUserStore } from '../context/CTX_UserStore';
import { useUserStoreSync } from '../hooks/hooks';

type TutorialRecord = { completed?: boolean } | boolean | null | undefined;

interface Step {
  ref: RefObject<HTMLElement | null>;
  title: string;
  body: string;
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
  const [tutorialState, setTutorialState] = useState<TutorialRecord>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);

  useUserStoreSync(userStore, 'PropertyTutorialCompleted', setTutorialState);

  const isCompleted = useMemo(() => {
    if (tutorialState === true) return true;
    if (tutorialState && typeof tutorialState === 'object') {
      return Boolean((tutorialState as { completed?: boolean }).completed);
    }
    return false;
  }, [tutorialState]);

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

  useEffect(() => {
    console.log('Active step ref:', activeStep?.ref?.current);
    console.log('Rect:', rect);
  }, [activeStep, rect]);

  const handleNext = () => {
    if (stepIndex < prSteps.length - 1) {
      setStepIndex((current) => current + 1);
      return;
    }
    setShowCompletion(true);
    setRect(null);
  };

  const handleClose = () => {
    userStore.setTutorialCompleted(true);
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
          top: Math.min(y + h + 16, window.innerHeight - 240),
          left: Math.min(x, window.innerWidth - 320),
        }
      : {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };

  const nextLabel = stepIndex === prSteps.length - 1 ? 'Finish' : 'Next';

  return (
    <>
      <svg width="100vw" height="100vh" style={{ position: 'fixed' }}>
        <mask id="hole-mask">
          <rect width="100%" height="100%" fill="white" />
          <rect x={x} y={y} width={w} height={h} fill="black" />
        </mask>
      </svg>
      <div className="area-tutorial-overlay">
        <div className="overlay" />
        <div className="tooltip" style={tooltipStyle}>
          {!showCompletion && activeStep ? (
            <div className="look-div-solid area-flex-col mod-align-stretch">
              <p className="look-text-x2">{activeStep.title}</p>
              <p className="look-text-x1">{activeStep.body}</p>
              <button className="look-button-secondary" onClick={handleNext}>
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
