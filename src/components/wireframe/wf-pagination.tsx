import Link from 'next/link';

export function WfPagination({
  page = 1,
  pages = 1,
  hrefFor = (p: number) => `?page=${p}`,
}: {
  page?: number;
  pages?: number;
  hrefFor?: (p: number) => string;
}) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).slice(0, 6);

  return (
    <nav className="wf-pagination" aria-label="Pagination">
      {page > 1 && <Link href={hrefFor(page - 1)}>‹</Link>}
      {nums.map(n =>
        n === page ? (
          <span className="on" key={n} aria-current="page">
            {n}
          </span>
        ) : (
          <Link href={hrefFor(n)} key={n}>
            {n}
          </Link>
        )
      )}
      {page < pages && <Link href={hrefFor(page + 1)}>›</Link>}
    </nav>
  );
}

export default WfPagination;
