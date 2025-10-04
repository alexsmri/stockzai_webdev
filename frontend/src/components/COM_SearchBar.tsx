import type { ChangeEvent, FormEvent } from 'react';
import ICON_Search from '@/assets/media/ICON_Search.svg?react';

interface SearchBarProps {
  input: string;
  submit?: boolean;
  handleSubmit?: (e: FormEvent) => void | null;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function COM_SearchBar({
  input,
  submit = true,
  handleSubmit,
  handleChange,
}: SearchBarProps) {
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
          type="text"
          value={input}
          onChange={handleChange}
          placeholder="Search for a ticker..."
          className="look-input-primary"
        />
        {submit && (
          <button type="submit" className="look-button-tertiary" aria-label="Search">
            <ICON_Search aria-hidden="true" focusable="false" />
          </button>
        )}
      </form>
    </>
  );
}
