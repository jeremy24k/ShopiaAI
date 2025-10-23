function LoadingNotes({ numberOfNotes = 4 }) {
  return (
    <div className="loading-notes">
      {Array.from({ length: numberOfNotes }, (_, index) => (
        <div key={index} className="skeleton-card">
          <div className="skeleton-avatar" />
          <div className="skeleton-content">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default LoadingNotes;
