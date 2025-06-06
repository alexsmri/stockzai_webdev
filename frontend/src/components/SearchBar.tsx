interface SearchBarProps {
    input: string;
    submit?: boolean
    handleSubmit?: (e: React.FormEvent) => void | null;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SearchBar({ input, submit = true, handleSubmit, handleChange }: SearchBarProps) {

    return (
    <>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={handleChange}
            placeholder="Search for a ticker..."
          />
          {submit && <button type="submit">Submit</button>}
        </form>

        {/* Completions shown while typing */}
    </>
  );
}