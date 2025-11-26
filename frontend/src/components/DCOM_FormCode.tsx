import { createRef, useEffect, useMemo, useRef, useState } from 'react';
import { REGISTRATION_RESEND_COOLDOWN_SECONDS } from '../constants';
import { scale } from '../utils/functions';

interface ITF_FormCodeProps {
  prHeading: string;
  prInstructions: string;
  prOnSubmit: (code: string) => Promise<void> | void;
  prOnResend?: () => Promise<boolean | void> | boolean | void;
  prSubmitLabel?: string;
  prResendLabel?: string;
  prCodeLength?: number;
  prCooldownSeconds?: number;
  prBusy?: boolean;
  prDisabled?: boolean;
}

const DEFAULT_CODE_LENGTH = 6;

export default function DCOM_FormCode({
  prHeading,
  prInstructions,
  prOnSubmit,
  prOnResend,
  prSubmitLabel = 'Verify',
  prResendLabel = 'Resend code',
  prCodeLength = DEFAULT_CODE_LENGTH,
  prCooldownSeconds = REGISTRATION_RESEND_COOLDOWN_SECONDS,
  prBusy = false,
  prDisabled = false,
}: ITF_FormCodeProps) {
  const [code, setCode] = useState<Record<number, string>>({});
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [cooldown, setCooldown] = useState(prCooldownSeconds);
  const [isResending, setIsResending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRefs = useRef(
    Array.from({ length: prCodeLength }, () => createRef<HTMLInputElement>())
  );

  const isComplete = useMemo(
    () =>
      Object.keys(code).length === prCodeLength &&
      [...Array(prCodeLength).keys()].every((i) => code[i]?.length === 1),
    [code, prCodeLength]
  );

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => {
      setCooldown((prev: number) => Math.max(prev - 1, 0));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const setDigit = (pos: number, val: string) => {
    setCode((prev) => ({ ...prev, [pos]: val }));
  };

  const focusIndex = (i: number) => {
    if (i >= 0 && i < prCodeLength) {
      setSelectedIdx(i);
      inputRefs.current[i].current?.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, pos: number) => {
    const raw = e.target.value.slice(-1);
    if (/\d/.test(raw)) {
      setDigit(pos, raw);
      focusIndex(pos + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, pos: number) => {
    if (e.key === 'Backspace') {
      if (code[pos]) {
        setDigit(pos, '');
      } else {
        focusIndex(pos - 1);
        setDigit(pos - 1, '');
      }
    }
    if (e.key === 'ArrowLeft') focusIndex(pos - 1);
    if (e.key === 'ArrowRight') focusIndex(pos + 1);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, startPos: number) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!text) return;
    let i = startPos;
    for (const ch of text.slice(0, prCodeLength - startPos)) {
      setDigit(i, ch);
      i++;
    }
    focusIndex(Math.min(startPos + text.length, prCodeLength - 1));
  };

  const handleResend = async () => {
    if (!prOnResend || cooldown > 0 || isResending) {
      return;
    }
    setIsResending(true);
    try {
      const result = await prOnResend();
      if (result !== false) {
        setCooldown(prCooldownSeconds);
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete || isSubmitting || prDisabled) return;

    const value = Array.from({ length: prCodeLength }, (_, i) => code[i]).join('');

    setIsSubmitting(true);
    try {
      await prOnSubmit(value);
    } finally {
      setIsSubmitting(false);
    }
  };

  const computedResendLabel = (() => {
    if (!prOnResend) return null;
    if (cooldown > 0) return `${prResendLabel} (${cooldown}s)`;
    if (isResending) return 'Resending...';
    return prResendLabel;
  })();

  return (
    <>
      <h1 className="look-text-x4">{prHeading}</h1>
      <div className="area-flex-col look-div-subtle mod-padding-xl">
        <form className="look-form-auth" onSubmit={handleSubmit}>
          <p className="look-text-subtle look-text-x0">{prInstructions}</p>
          <div className="area-flex-row mod-gap-s">
            {Array.from({ length: prCodeLength }).map((_, i) => (
              <input
                key={i}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={1}
                ref={inputRefs.current[i]}
                className="look-input-auth"
                value={code[i] ?? ''}
                aria-selected={selectedIdx === i}
                onFocus={() => setSelectedIdx(i)}
                onChange={(e) => handleChange(e, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                onPaste={(e) => handlePaste(e, i)}
                style={{
                  minWidth: 'unset',
                  maxWidth: `${scale(2.5)}`,
                  textAlign: 'center',
                  padding: `${scale(0.5)}`,
                }}
              />
            ))}
          </div>

          <div className="area-flex-col mod-gap-s mod-padding-none mod-align-stretch">
            <button
              className="look-button-secondary mod-button-auth"
              disabled={!isComplete || isSubmitting || prBusy || prDisabled}
            >
              {isSubmitting || prBusy ? 'Verifying...' : prSubmitLabel}
            </button>
            {computedResendLabel && (
              <button
                type="button"
                className="look-button-ghost mod-centersides"
                onClick={handleResend}
                disabled={cooldown > 0 || isResending || prBusy || prDisabled}
              >
                {computedResendLabel}
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
