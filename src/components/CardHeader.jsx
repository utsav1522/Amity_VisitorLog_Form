export const CardHeader = ({ subtitle, status }) => {
  return (
    <header className="card-header">
      <div className="brand-row">
        <div className="brand-logo" aria-hidden="true">
          <span className="brand-logo-text">AMITY</span>
        </div>
        <div>
          <h1 className="brand-title">AMITY UNIVERSITY NOIDA</h1>
          <p className="brand-subtitle">{subtitle}</p>
        </div>
      </div>
      {status && <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>}
    </header>
  );
};
