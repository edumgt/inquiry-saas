export default function StatCard({ label, value, hint }) {
  return (
    <div className="g-card">
      <p className="text-xs font-medium text-g-muted">{label}</p>
      <p className="mt-2 text-2xl font-medium text-g-on-surface">{value}</p>
      <p className="mt-1 text-sm text-g-secondary">{hint}</p>
    </div>
  );
}
