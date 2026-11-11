'use client';
import { CURRENCY_SYMBOL } from '@/lib/brand';
import { userLoggedOut } from '@/redux/features/auth/authSlice';
import { notifySuccess } from '@/utils/toast';
import dayjs from 'dayjs';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// Removed CSS module import; Tailwind-only styling

export default function NavProfileTab({ orderData }) {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  // Calculate user stats
  const userStats = useMemo(() => {
    if (!orderData?.orders) {
      return {
        totalSpent: 0,
        orderCounts: {
          totalDoc: 0,
          pending: 0,
          processing: 0,
          delivered: 0,
          shipped: 0,
          cancelled: 0,
        },
        latestOrder: null,
        memberSince: user?.createdAt || new Date(),
      };
    }

    const orders = orderData.orders;
    const totalSpent = orders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    // Get latest order
    const latestOrder = orders.length > 0 ? orders[0] : null;

    return {
      totalSpent,
      orderCounts: {
        totalDoc: orderData.totalDoc || 0,
        pending: orderData.pending || 0,
        processing: orderData.processing || 0,
        delivered: orderData.delivered || 0,
        shipped: orderData.shipped || 0,
        cancelled: orderData.cancelled || 0,
      },
      latestOrder,
      memberSince: user?.createdAt || new Date(),
    };
  }, [orderData, user]);

  const handleLogout = () => {
    dispatch(userLoggedOut());
    Cookies.remove('userInfo');
    notifySuccess('Logout successfully');
    router.push('/');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    const name = user?.name || user?.firstName || 'User';
    return name.charAt(0).toUpperCase();
  };

  // SVG Icons as components
  const CalendarIcon = () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 2V5M16 2V5M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const LogoutIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H9M16 17L21 12L16 7M21 12H9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const ShoppingBagIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19 7H5L3 19H21L19 7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const ClockIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <polyline
        points="12,6 12,12 16,14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const TruckIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="1"
        y="3"
        width="15"
        height="13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points="16,8 20,8 23,11 23,16 16,16 16,8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="5.5"
        cy="18.5"
        r="2.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="18.5"
        cy="18.5"
        r="2.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const CheckCircleIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4905 2.02168 11.3363C2.16356 9.18218 2.99721 7.13677 4.39828 5.49707C5.79935 3.85738 7.69279 2.71144 9.79619 2.24402C11.8996 1.77661 14.1003 1.10793 16.07 2.32"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="22,4 12,14.01 9,11.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const ShippedTruckIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 9h4l2 3v6a2 2 0 0 1-2 2h-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="6"
        cy="19"
        r="1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="18"
        cy="19"
        r="1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const XCircleIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="15"
        y1="9"
        x2="9"
        y2="15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="9"
        y1="9"
        x2="15"
        y2="15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div className="profile__tab-content">
      {/* Enhanced Profile Header */}
      <div className="">
        <div className="">
          <div className="">
            <div className="">{getUserInitials()}</div>
            <div className=" "></div>
          </div>

          <div className="">
            <h3>{user?.name || user?.firstName || 'Guest User'}</h3>
            <p className="">{user?.email || 'No email'}</p>
            <div className="">
              <CalendarIcon />
              <span>
                Member since {dayjs(userStats.memberSince).format('MMM YYYY')}
              </span>
            </div>
          </div>

          <div className="">
            <button onClick={handleLogout} className="">
              <LogoutIcon />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="">
        <div className=" ">
          <div className="">
            <ShoppingBagIcon />
            <span className="">{userStats.orderCounts.totalDoc}</span>
          </div>
          <div className="">
            <h4>Total Orders</h4>
            <p className="">All time purchases</p>
          </div>
        </div>

        <div className=" ">
          <div className="">
            <ClockIcon />
            <span className="">{userStats.orderCounts.pending}</span>
          </div>
          <div className="">
            <h4>Pending Orders</h4>
            <p className="">Awaiting processing</p>
          </div>
        </div>

        <div className=" ">
          <div className="">
            <TruckIcon />
            <span className="">{userStats.orderCounts.processing}</span>
          </div>
          <div className="">
            <h4>Processing</h4>
            <p className="">Being prepared</p>
          </div>
        </div>

        <div className=" ">
          <div className="">
            <CheckCircleIcon />
            <span className="">{userStats.orderCounts.delivered}</span>
          </div>
          <div className="">
            <h4>Delivered</h4>
            <p className="">Successfully completed</p>
          </div>
        </div>

        <div className=" ">
          <div className="">
            <ShippedTruckIcon />
            <span className="">{userStats.orderCounts.shipped}</span>
          </div>
          <div className="">
            <h4>Shipped</h4>
            <p className="">On the way</p>
          </div>
        </div>

        <div className=" ">
          <div className="">
            <XCircleIcon />
            <span className="">{userStats.orderCounts.cancelled}</span>
          </div>
          <div className="">
            <h4>Cancelled</h4>
            <p className="">Order cancelled</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="">
        <div className="">
          <div className="">
            <h4>Total Spending</h4>
            <span className="">Lifetime</span>
          </div>
          <div className="">{CURRENCY_SYMBOL}{userStats.totalSpent.toFixed(2)}</div>
          <p className="">
            Average: {CURRENCY_SYMBOL}
            {userStats.orderCounts.totalDoc > 0
              ? (userStats.totalSpent / userStats.orderCounts.totalDoc).toFixed(
                  2
                )
              : '0.00'}{' '}
            per order
          </p>
        </div>

        <div className="">
          <div className="">
            <h4>Latest Order</h4>
            {userStats.latestOrder && (
              <span className="">{userStats.latestOrder.status}</span>
            )}
          </div>
          {userStats.latestOrder ? (
            <div className="">
              <p className="">#{userStats.latestOrder.invoice}</p>
              <p className="">
                {dayjs(userStats.latestOrder.createdAt).format('MMM D, YYYY')}
              </p>
              <p className="">
                {CURRENCY_SYMBOL}{userStats.latestOrder.totalAmount?.toFixed(2)}
              </p>
            </div>
          ) : (
            <div className="">
              <p className="">No orders yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
