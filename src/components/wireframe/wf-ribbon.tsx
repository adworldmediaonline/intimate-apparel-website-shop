/** Quiet full-width statement strip (the wireframe's Sanskrit ribbon slot). */
export function WfRibbon({ lead, sub }: { lead: string; sub?: string }) {
  return (
    <div className="wf-ribbon">
      <div className="lead">{lead}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}

export default WfRibbon;
