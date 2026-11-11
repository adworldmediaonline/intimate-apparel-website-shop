'use client';

// SVG Icon Components
const DashboardIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
      fill="currentColor"
    />
  </svg>
);

const UserIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      fill="currentColor"
    />
  </svg>
);

const ShoppingBagIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 15a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v12z"
      fill="currentColor"
    />
  </svg>
);

const SecurityIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"
      fill="currentColor"
    />
  </svg>
);

const ChevronRightIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"
      fill="currentColor"
    />
  </svg>
);

const SupportIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"
      fill="currentColor"
    />
  </svg>
);

function SingleNav({
  active = false,
  id,
  title,
  icon: IconComponent,
  description,
  badge,
  onClick,
}) {
  return (
    <button
      className=" ${active ? styles.active : ''}"
      onClick={onClick}
      type="button"
    >
      <div className="">
        <div className="">
          <IconComponent className="" />
          {badge && <span className="">{badge}</span>}
        </div>
        <div className="">
          <h4 className="">{title}</h4>
          <p className="">{description}</p>
        </div>
        <ChevronRightIcon className="" />
      </div>
    </button>
  );
}

export default function ProfileNavTab({ activeTab, setActiveTab }) {
  return (
    <div className="">
      <div className="">
        <h3 className="">Account Settings</h3>
        <p className="">Manage your profile and preferences</p>
      </div>

      <nav className="">
        <div
          className="nav nav-tabs tp-tab-menu flex-column"
          id="profile-tab"
          role="tablist"
        >
          <SingleNav
            active={activeTab === 'profile'}
            id="profile"
            title="Dashboard"
            icon={DashboardIcon}
            description="Overview and statistics"
            onClick={() => setActiveTab('profile')}
          />
          <SingleNav
            active={activeTab === 'information'}
            id="information"
            title="Personal Information"
            icon={UserIcon}
            description="Update your details"
            onClick={() => setActiveTab('information')}
          />
          <SingleNav
            active={activeTab === 'order'}
            id="order"
            title="My Orders"
            icon={ShoppingBagIcon}
            description="Track your purchases"
            onClick={() => setActiveTab('order')}
          />
          <SingleNav
            active={activeTab === 'password'}
            id="password"
            title="Security"
            icon={SecurityIcon}
            description="Password and security"
            onClick={() => setActiveTab('password')}
          />
        </div>
      </nav>

      {/* TODO: Uncomment when contact form feature is added */}
      {/* <div className="">
        <div className="">
          <h4 className="">
            <SupportIcon className="" />
            Need Help?
          </h4>
          <p className="">
            Contact our support team for assistance
          </p>
          <a href="/contact" className="">
            <SupportIcon className="" />
            Get Support
          </a>
        </div>
      </div> */}
    </div>
  );
}
