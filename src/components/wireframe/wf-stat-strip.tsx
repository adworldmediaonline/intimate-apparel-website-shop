export function WfStatStrip({ stats }: { stats: { num: string; label: string }[] }) {
  if (!stats.length) return null;
  return (
    <div className="wf-stat-strip">
      {stats.map(s => (
        <div className="wf-stat" key={s.label}>
          <div className="num">{s.num}</div>
          <div className="lab">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

export default WfStatStrip;
