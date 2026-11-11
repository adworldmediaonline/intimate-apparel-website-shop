export function WfCategoryBanner({
  eyebrow = 'Collection',
  title,
  body,
  image,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  image?: string;
}) {
  return (
    <section className="wf-cat-banner">
      {image && (
        <div className="bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" />
        </div>
      )}
      <div className="wf-wrap">
        <span className="wf-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {body && <p>{body}</p>}
      </div>
    </section>
  );
}

export default WfCategoryBanner;
