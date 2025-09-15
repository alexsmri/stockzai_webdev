import { useRef, useState } from 'react';
import { useUserStore } from '../context/CTX_UserStore';

const CODE_LENGTH = 6;

export default function COM_FormCode() {
  const utStore = useUserStore();
  const [stCode, setStCode] = useState<Record<number, string>>({});
  const [stSelectIdx, setStSelectIdx] = useState(0);
  const utNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, prPosition: number) => {
    const utLetter = e.target.value;
    if (utNumbers.includes(utLetter) && utLetter.length <= 1) {
      let utCode = stCode;
      utCode[prPosition] = utLetter;
      setStCode(utCode);
      handleRefChange(prPosition);
    }
  };

  const handleRefChange = (prPosition: number) => {
    let utSelectIdx = prPosition + 1;
    setStSelectIdx(utSelectIdx);
    console.log(`Selected, Position ${stSelectIdx} ${prPosition}`);
    if (prPosition != CODE_LENGTH - 1) {
      const utRef = inputRefs[prPosition];
      utRef.current?.focus();
    } else {
      console.log(stCode);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(stCode).length === CODE_LENGTH) {
      let utCode = Object.values(stCode).join('');
      console.log(utCode);
      //utStore.post('ActionVerification', { code: utCode });
    }
  };

  let inputFields: any[] = [];
  let inputRefs: any[] = [];
  for (let i = 0; i <= CODE_LENGTH - 1; i++) {
    const inputRef = useRef<HTMLInputElement>(null);
    const inputField = (
      <input
        type="text"
        ref={inputRef}
        className="look-input-secondary"
        value={stCode[i]}
        aria-selected={stSelectIdx === i}
        onChange={(e) => handleChange(e, i)}
      />
    );
    inputFields.push(inputField);
    inputRefs.push(inputRef);
  }

  return (
    <form className="area-flex-col" onSubmit={handleSubmit}>
      <div className="area-flex-row mod-gap-s">{inputFields.map((inputField) => [inputField])}</div>
      <button className="look-button-secondary">Verify</button>
    </form>
  );
}
