interface SearchBarProps {
    input: string;
    handleSubmit: (e: React.FormEvent) => void;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SearchBar({ input, handleSubmit, handleChange }: SearchBarProps) {

    return (
    <>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={handleChange}
            placeholder="Search for a ticker..."
          />
          <button type="submit">Submit</button>
        </form>

        {/* Completions shown while typing */}
    </>
  );
}