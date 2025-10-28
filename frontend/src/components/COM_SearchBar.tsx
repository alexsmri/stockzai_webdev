import type { ChangeEvent, FormEvent } from 'react';
import ICON_Search from '@/assets/media/ICON_Search.svg?react';
import { scale } from '../utils/functions';

interface ITF_SearchBarProps {
  input: string;
  submit?: boolean;
  handleSubmit?: (e: FormEvent) => void | null;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const ICON_WIDTH = scale(1.5);
export default function COM_SearchBar({
  input,
  submit = true,
  handleSubmit,
  handleChange,
}: ITF_SearchBarProps) {
  const onSubmitForm = (event: FormEvent) => {
    if (!submit) {
      event.preventDefault();
      return;
    }

    if (handleSubmit) {
      handleSubmit(event);
    } else {
      event.preventDefault();
    }
  };

  return (
    <>
      <form onSubmit={onSubmitForm} className="area-searchbar">
        <input
          name="searchbar"
          type="text"
          value={input}
          onChange={handleChange}
          placeholder="Search for a ticker..."
          className="look-input-primary"
        />
        {submit && (
          <button type="submit" className="look-button-tertiary" aria-label="Search">
            <ICON_Search
              aria-hidden="true"
              focusable="false"
              style={{ width: ICON_WIDTH, height: 'auto' }}
            />
          </button>
        )}
      </form>
    </>
  );
}
