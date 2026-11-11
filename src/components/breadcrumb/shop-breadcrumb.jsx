import Link from 'next/link';

const ShopBreadcrumb = ({ title = 'Shop', subtitle }) => {
  // Function to format text with title case (first letter of each word capitalized)
  const formatTitleCase = text => {
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formattedSubtitle = subtitle
    ? formatTitleCase(subtitle)
    : formatTitleCase(title);

  return (
    <div className="">
      <div className="">
        <nav aria-label="Breadcrumb">
          <ol className="">
            <li className="">
              <Link href="/" className="">
                <span className="">Home</span>
              </Link>
            </li>
            <li className=" " aria-current="page">
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
      </div>
    </div>
  );
};

export default ShopBreadcrumb;
