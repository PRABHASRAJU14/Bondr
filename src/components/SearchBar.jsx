import { Search, X } from 'lucide-react';

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search by name, department, or hobby...',
  label = 'Search students',
  id = 'discover-search',
}) {
  return (
    <div className="search-bar-field">
      <label htmlFor={id} className="control-label">
        {label}
      </label>
      <div className="search-input-wrap">
        <Search size={18} className="search-input-icon" aria-hidden="true" />
        <input
          id={id}
          type="search"
          className="search-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            className="search-clear-btn"
            aria-label="Clear search query"
            onClick={() => onChange('')}
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
