export default function FilterBar({
  hobbies,
  selectedHobby,
  onSelectHobby,
}) {
  return (
    <div className="filter-group">
      <span className="control-label">Filter by Hobby &amp; Interest</span>
      <div className="filter-pills-row" role="group" aria-label="Hobby filters">
        {hobbies.map((hobby) => {
          const isActive = selectedHobby === hobby;
          return (
            <button
              key={hobby}
              type="button"
              className={`filter-pill ${isActive ? 'active' : ''}`}
              aria-pressed={isActive}
              onClick={() => onSelectHobby(hobby)}
            >
              {hobby}
            </button>
          );
        })}
      </div>
    </div>
  );
}
