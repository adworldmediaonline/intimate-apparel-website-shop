'use client';
import Link from 'next/link';

const CommonBreadcrumb = ({
  title = '',
  subtitle,
  center = false,
  bg_clr = false,
}) => {
  // Format text with title case (first letter of each word capitalized)
  const formatTitleCase = text => {
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formattedTitle = formatTitleCase(title);
  const formattedSubtitle = formatTitleCase(subtitle || title);

  return (
    <section
      className=""
      style={{ backgroundColor: bg_clr ? '#EFF1F5' : '#f8f9fa' }}
    >
      <div className="container">
        <div className="row">
          <div className="col-xxl-12">
            <nav
              aria-label="Breadcrumb"
              className={`${center ? 'text-center' : ''}`}
            >
              <ol className="">
                <li className="">
                  <Link href="/" className="">
                    <span className="">Home</span>
                  </Link>
                </li>
                <li
                  className="${styles['breadcrumb-item']} ${styles['breadcrumb-active']}"
                  aria-current="page"
                >
                  <svg
                    className=""
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                  <span className="">{formattedSubtitle}</span>
                </li>
              </ol>
            </nav>
            {title && <h3 className="">{formattedTitle}</h3>}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommonBreadcrumb;
