import { getFeaturedReviews } from '@/server/reviews';
import ReviewsShowcaseMarquee from './reviews-showcase-marquee';

const HEADING = 'What Our Customers Say';
const REVIEW_LIMIT = 50;

/**
 * Static home-page customer-reviews section (Design 3 — auto-scroll marquee).
 * Always rendered; not CMS-managed. Pulls the latest 50 five-star (5★) reviews
 * from the public featured-reviews endpoint. Renders nothing if there are none yet.
 */
export default async function HomeReviewsSection() {
  const reviews = await getFeaturedReviews(REVIEW_LIMIT);

  if (!reviews.length) return null;

  return (
    <section
      aria-labelledby="home-reviews-heading"
      className="w-full border-b py-8 md:py-10"
    >
      <div className="container mx-auto px-3 md:px-6">
        <div className="mb-5 text-center md:mb-7">
          <h2
            id="home-reviews-heading"
            className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl"
          >
            {HEADING}
          </h2>
        </div>
      </div>
      <ReviewsShowcaseMarquee reviews={reviews} />
    </section>
  );
}
