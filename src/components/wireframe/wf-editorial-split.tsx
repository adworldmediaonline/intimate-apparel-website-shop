import Link from 'next/link';

import { cloudinarySrcSet, cloudinaryVariant } from '@/lib/product-image';

export function WfEditorialSplit({
  eyebrow,
  title,
  paragraphs = [],
  image,
  link,
  id,
}: {
  eyebrow?: string;
  title: string;
  paragraphs?: string[];
  image?: string;
  link?: { label: string; href: string };
  id?: string;
}) {
  return (
    <section id={id}>
      <div className="wf-editorial">
        <div className="img">
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cloudinaryVariant(image, 800)}
              srcSet={cloudinarySrcSet(image, 800)}
              sizes="(max-width: 900px) 100vw, 50vw"
              alt=""
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
        <div className="txt">
          {eyebrow && <span className="wf-eyebrow">{eyebrow}</span>}
          <h2 dangerouslySetInnerHTML={{ __html: title }} />
          {paragraphs.map(p => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
          {link && (
            <Link href={link.href} className="wf-link-arrow">
              {link.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export default WfEditorialSplit;
