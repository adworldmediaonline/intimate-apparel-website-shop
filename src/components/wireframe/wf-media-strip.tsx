export function WfMediaStrip({ names }: { names: string[] }) {
  if (!names.length) return null;
  return (
    <div className="wf-media-strip">
      {names.map(n => (
        <span key={n}>{n}</span>
      ))}
    </div>
  );
}

export default WfMediaStrip;
