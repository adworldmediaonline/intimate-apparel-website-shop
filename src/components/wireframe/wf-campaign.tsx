import Link from 'next/link';

import { cloudinarySrcSet, cloudinaryVariant } from '@/lib/product-image';

export function WfCampaign({
  eyebrow,
  title,
  body,
  cta,
  image,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  cta?: { label: string; href: string };
  image?: string;
}) {
  return (
    <section className="wf-campaign">
      {image && (
        <div className="bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cloudinaryVariant(image, 1280)}
            srcSet={cloudinarySrcSet(image, 1280)}
            sizes="100vw"
            alt=""
            loading="lazy"
            decoding="async"
          />
        </div>
      )}
      <div className="inner">
        {eyebrow && <span className="wf-eyebrow" style={{ color: 'var(--wf-accent)' }}>{eyebrow}</span>}
        <h2>{title}</h2>
        {body && <p>{body}</p>}
        {cta && (
          <Link href={cta.href} className="wf-btn wf-btn-light">
            {cta.label}
          </Link>
        )}
      </div>
    </section>
  );
}

export default WfCampaign;
