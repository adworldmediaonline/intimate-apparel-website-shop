import WfProductCard, { type WfProduct } from './wf-product-card';

/**
 * Replaces the wireframe's "Frequently Bought Together" block.
 * The client asked for "Other Products You Can Choose" instead — see
 * wireframe/final.md.
 */
export function WfOtherProducts({
  products,
  title = 'Other Products You Can Choose',
}: {
  products: WfProduct[];
  title?: string;
}) {
  if (!products.length) return null;
  return (
    <section className="wf-section" style={{ paddingTop: 0 }}>
      <div className="wf-wrap">
        <div className="wf-section-head">
          <div className="htext">
            <span className="wf-eyebrow">You may also like</span>
            <h2>{title}</h2>
          </div>
        </div>
        <div className="wf-product-scroller">
          {products.map(p => (
            <WfProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default WfOtherProducts;
