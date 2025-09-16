import { createRef, useMemo, useRef, useState } from 'react';
import { useUserStore } from '../context/CTX_UserStore';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../context/CTX_Alert';

const CODE_LENGTH = 6;

export default function COM_FormCode(prUid: { prUid: string }) {
  const utStore = useUserStore();
  const [code, setCode] = useState<Record<number, string>>({});
  const [selectedIdx, setSelectedIdx] = useState(0);
  const navigate = useNavigate();
  const { handleAlertOpen } = useAlert();

  const inputRefs = useRef(
    Array.from({ length: CODE_LENGTH }, () => createRef<HTMLInputElement>())
  );

  const isComplete = useMemo(
    () =>
      Object.keys(code).length === CODE_LENGTH &&
      [...Array(CODE_LENGTH).keys()].every((i) => code[i]?.length === 1),
    [code]
  );

  const setDigit = (pos: number, val: string) => {
    setCode((prev) => ({ ...prev, [pos]: val }));
  };

  const focusIndex = (i: number) => {
    if (i >= 0 && i < CODE_LENGTH) {
      setSelectedIdx(i);
      inputRefs.current[i].current?.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, pos: number) => {
    const raw = e.target.value.slice(-1);
    if (/\d/.test(raw)) {
      setDigit(pos, raw);
      focusIndex(pos + 1);
    } else {
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
    for (const ch of text.slice(0, CODE_LENGTH - startPos)) {
      setDigit(i, ch);
      i++;
    }
    focusIndex(Math.min(startPos + text.length, CODE_LENGTH - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(code);
    if (!isComplete) return;
    const value = Array.from({ length: CODE_LENGTH }, (_, i) => code[i]).join('');
    console.log('Submitting code:', value);
    const utValid = await utStore.post('ActionVerification', { token: value, uid: prUid.prUid });
    if (utValid) {
      navigate('/users/login');
    } else {
      handleAlertOpen('Wrong code. Try again.', 'f');
    }
  };

  return (
    <form className="area-flex-col" onSubmit={handleSubmit}>
      <div className="area-flex-row mod-gap-s">
        {Array.from({ length: CODE_LENGTH }).map((_, i) => (
          <input
            key={i}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            ref={inputRefs.current[i]}
            className="look-input-secondary"
            value={code[i] ?? ''}
            aria-selected={selectedIdx === i}
            onFocus={() => setSelectedIdx(i)}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={(e) => handlePaste(e, i)}
            style={{ width: '2.5rem', textAlign: 'center' }}
          />
        ))}
      </div>

      <button className="look-button-secondary" disabled={!isComplete}>
        Verify
      </button>
    </form>
  );
}
