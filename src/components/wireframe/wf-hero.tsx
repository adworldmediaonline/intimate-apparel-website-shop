import Link from 'next/link';

import { cloudinarySrcSet, cloudinaryVariant } from '@/lib/product-image';

export interface WfHeroProps {
  eyebrow?: string;
  title: string;
  body?: string;
  image?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  proof?: { stars?: number; text: string };
}

export function WfHero({
  eyebrow,
  title,
  body,
  image,
  primaryCta,
  secondaryCta,
  proof,
}: WfHeroProps) {
  return (
    <section className="wf-hero">
      {image && (
        <div className="wf-hero-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            // The hero fills the viewport width, so it is sized against a
            // large slot; c_limit still refuses to upscale a smaller source.
            src={cloudinaryVariant(image, 1280)}
            srcSet={cloudinarySrcSet(image, 1280)}
            sizes="100vw"
            alt=""
            fetchPriority="high"
            decoding="async"
          />
        </div>
      )}
      <div className="wf-wrap">
        <div className="wf-hero-content">
          {eyebrow && <span className="wf-eyebrow">{eyebrow}</span>}
          <h1 dangerouslySetInnerHTML={{ __html: title }} />
          {body && <p>{body}</p>}
          <div className="wf-hero-actions">
            {primaryCta && (
              <Link href={primaryCta.href} className="wf-btn wf-btn-light">
                {primaryCta.label}
              </Link>
            )}
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="wf-btn wf-btn-outline"
                style={{ color: '#fff', borderColor: 'rgba(255,255,255,.7)' }}
              >
                {secondaryCta.label}
              </Link>
            )}
          </div>
        </div>
      </div>
      {proof && (
        <div className="wf-hero-side">
          <span className="wf-stars">{'★'.repeat(proof.stars ?? 5)}</span>
          <small>{proof.text}</small>
        </div>
      )}
    </section>
  );
}

export default WfHero;
