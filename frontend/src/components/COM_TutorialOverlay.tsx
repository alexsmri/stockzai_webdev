import { useEffect, useState } from 'react';

interface Step {
  ref: React.RefObject<HTMLElement>;
  title?: string;
  text?: string;
}

interface PI_TutorialOverlay {
  prSteps: Step[];
  onFinish?: () => void;
}

export default function COM_TutorialOverlay({ prSteps, onFinish }: PI_TutorialOverlay) {
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Highlight area of current step
  useEffect(() => {
    const el = prSteps[stepIndex].ref.current;
    if (el) setRect(el.getBoundingClientRect());
  }, [stepIndex]);

  const handleNext = () => {
    if (stepIndex < prSteps.length - 1) setStepIndex(stepIndex + 1);
    else onFinish?.();
  };

  if (!rect) return null;

  const padding = 8; // add small padding around highlight
  const x = rect.x - padding;
  const y = rect.y - padding;
  const w = rect.width + padding * 2;
  const h = rect.height + padding * 2;

  // CSS clip-path with "hole" effect
  const clipPath = `polygon(
    0 0, 100% 0, 100% 100%, 0 100%,
    0 0,
    ${x}px ${y}px,
    ${x + w}px ${y}px,
    ${x + w}px ${y + h}px,
    ${x}px ${y + h}px,
    ${x}px ${y}px
  )`;

  return (
    <div className="tutorial-overlay">
      <div className="overlay" style={{ clipPath }} />
      <div
        className="tooltip"
        style={{
          top: y + h + 12,
          left: x,
        }}
      >
        <p>{prSteps[stepIndex].title}</p>
        <p>{prSteps[stepIndex].text}</p>
        <button className="look-button-primary" onClick={handleNext}>
          {stepIndex === prSteps.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
}
