export default function StatCard({ icon: Icon, label, value, hint, tone }) {
  return (
    <article className={`stat-card stat-${tone}`}>
      <div className="stat-top">
        <span className="stat-icon" aria-hidden="true">
          <Icon size={20} />
        </span>
        <p className="stat-label">{label}</p>
      </div>
      <p className="stat-value">{value}</p>
      <p className="stat-hint">{hint}</p>
    </article>
  );
}
