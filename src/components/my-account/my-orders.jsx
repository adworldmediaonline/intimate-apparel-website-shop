'use client';
import { CURRENCY_SYMBOL } from '@/lib/brand';
import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
const styles = new Proxy({}, { get: () => '' });

// SVG Icons for Order Status
const OrderStatusIcon = ({ status }) => {
  const normalizedStatus = status?.toLowerCase();

  switch (normalizedStatus) {
    case 'pending':
      return (
        <svg className="" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <polyline
            points="12,6 12,12 16,14"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case 'processing':
      return (
        <svg className="" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'shipped':
      return (
        <svg className="" viewBox="0 0 24 24" fill="none">
          <rect
            x="1"
            y="3"
            width="15"
            height="13"
            stroke="currentColor"
            strokeWidth="2"
          />
          <polygon
            points="16,8 20,8 23,11 23,16 16,16 16,8"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle
            cx="5.5"
            cy="18.5"
            r="2.5"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle
            cx="18.5"
            cy="18.5"
            r="2.5"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case 'delivered':
      return (
        <svg className="" viewBox="0 0 24 24" fill="none">
          <path
            d="M22 11.08V12a10 10 0 11-5.93-9.14"
            stroke="currentColor"
            strokeWidth="2"
          />
          <polyline
            points="22,4 12,14.01 9,11.01"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case 'cancel':
    case 'cancelled':
      return (
        <svg className="" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="15"
            y1="9"
            x2="9"
            y2="15"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="9"
            y1="9"
            x2="15"
            y2="15"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    default:
      return (
        <svg className="" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
  }
};

const OrderTimeline = ({ order }) => {
  const stages = [
    { key: 'pending', label: 'Order Placed', icon: OrderStatusIcon },
    { key: 'processing', label: 'Processing', icon: OrderStatusIcon },
    { key: 'shipped', label: 'Shipped', icon: OrderStatusIcon },
    { key: 'delivered', label: 'Delivered', icon: OrderStatusIcon },
  ];

  const normalizedStatus = order.status?.toLowerCase();
  const currentStageIndex = stages.findIndex(
    stage => stage.key === normalizedStatus
  );

  // Handle cancelled orders
  if (['cancel', 'cancelled'].includes(normalizedStatus)) {
    return (
      <div className="">
        <div className="">Order Status</div>
        <div className="">
          <div className=" ">
            <div className=" ">
              <OrderStatusIcon status="cancelled" />
            </div>
            <div className="">Order Cancelled</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="">Order Progress</div>
      <div className="">
        {stages.map((stage, index) => {
          const isCompleted = index <= currentStageIndex;
          const isCurrent = index === currentStageIndex;
          const IconComponent = stage.icon;

          return (
            <div
              key={stage.key}
              className={` ${isCompleted ? styles.completed : ''} ${
                isCurrent ? styles.current : ''
              }`}
            >
              <div
                className={` ${isCompleted ? styles.completed : ''} ${
                  isCurrent ? styles.current : ''
                }`}
              >
                <IconComponent status={stage.key} />
              </div>
              <div className="">{stage.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Expand/Collapse Icon
const ExpandIcon = ({ expanded }) => (
  <svg
    className=" ${expanded ? styles.expanded : ''}"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M6 9l6 6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function MyOrders({ orderData }) {
  const [filter, setFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const order_items = orderData?.orders || [];

  // Filter orders with proper status normalization
  const filteredOrders =
    filter === 'all'
      ? order_items
      : order_items.filter(order => {
          const normalizedStatus = order.status?.toLowerCase();
          if (filter === 'cancelled') {
            return ['cancel', 'cancelled'].includes(normalizedStatus);
          }
          return normalizedStatus === filter;
        });

  const filterCounts = {
    all: order_items.length,
    pending: order_items.filter(o => o.status?.toLowerCase() === 'pending')
      .length,
    processing: order_items.filter(
      o => o.status?.toLowerCase() === 'processing'
    ).length,
    shipped: order_items.filter(o => o.status?.toLowerCase() === 'shipped')
      .length,
    delivered: order_items.filter(o => o.status?.toLowerCase() === 'delivered')
      .length,
    cancelled: order_items.filter(o =>
      ['cancel', 'cancelled'].includes(o.status?.toLowerCase())
    ).length,
  };

  const toggleOrderExpansion = orderId => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusClass = status => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'pending':
        return 'pending';
      case 'processing':
        return 'processing';
      case 'shipped':
        return 'shipped';
      case 'delivered':
        return 'delivered';
      case 'cancel':
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  const formatStatusText = status => {
    const normalizedStatus = status?.toLowerCase();
    if (normalizedStatus === 'cancel') return 'Cancelled';
    return status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase();
  };

  if (!order_items || order_items.length === 0) {
    return (
      <div className="">
        <div className="">🛒</div>
        <h3 className="">No Orders Yet!</h3>
        <p className="">Start shopping to see your orders here</p>
        <Link href="/shop" className="">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="">
      {/* Order Filters */}
      <div className="">
        <div className="">
          {Object.entries(filterCounts).map(([key, count]) => (
            <button
              key={key}
              className={` ${filter === key ? styles.active : ''}`}
              onClick={() => setFilter(key)}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
              <span className="">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="">
        {filteredOrders.map(order => {
          const isExpanded = expandedOrder === order._id;

          return (
            <div key={order._id} className="">
              {/* Order Header */}
              <div className="" onClick={() => toggleOrderExpansion(order._id)}>
                <div className="">
                  <div className="">
                    <div className="">
                      <OrderStatusIcon status={order.status} />
                      <div>
                        <h4 className="">
                          #{order.invoice || order._id.substring(20, 25)}
                        </h4>
                        <p className="">
                          {dayjs(order.createdAt).format(
                            'MMM D, YYYY • h:mm A'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="">
                    <div className="">
                      <div className="">
                        <span className="">
                          {CURRENCY_SYMBOL}{order.totalAmount?.toFixed(2) || '0.00'}
                        </span>
                        <span className="">
                          {order.cart?.length || 0} items
                        </span>
                      </div>
                    </div>

                    <span
                      className={` ${styles[getStatusClass(order.status)]}`}
                    >
                      {formatStatusText(order.status)}
                    </span>

                    <ExpandIcon expanded={isExpanded} />
                  </div>
                </div>
              </div>

              {/* Expanded Order Details */}
              {isExpanded && (
                <div className=" ">
                  {/* Order Timeline */}
                  <OrderTimeline order={order} />

                  {/* Order Items */}
                  {order.cart && order.cart.length > 0 && (
                    <div className="">
                      <h5 className="">Order Items ({order.cart.length})</h5>
                      <div className="">
                        {order.cart.slice(0, 3).map((item, index) => (
                          <div key={index} className="">
                            <Image
                              src={
                                item.img ||
                                item.image?.url ||
                                '/placeholder.png'
                              }
                              alt={item.title}
                              width={50}
                              height={50}
                              className=""
                              onError={e => {
                                e.target.src = '/placeholder.png';
                              }}
                            />
                            <div className="">
                              <h6 className="">{item.title}</h6>
                              {item.selectedOption && (
                                <p className="text-xs text-muted-foreground">
                                  {item.selectedOption.title} (+{CURRENCY_SYMBOL}{Number(item.selectedOption.price).toFixed(2)})
                                </p>
                              )}
                              <p className="">{CURRENCY_SYMBOL}{Number(item.finalPriceDiscount || 0).toFixed(2)} each</p>
                            </div>
                            <div className="">{item.orderQuantity}</div>
                            <div className="">
                              {CURRENCY_SYMBOL}{(Number(item.finalPriceDiscount || 0) * item.orderQuantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                        {order.cart.length > 3 && (
                          <div className="">
                            <div className="">
                              <p className="">
                                +{order.cart.length - 3} more items
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order Pricing Breakdown */}
                  <div className="">
                    <h5 className="">Order Summary</h5>
                    <div className="">
                      <div className="">
                        <span className="">Subtotal:</span>
                        <span className="">
                          {CURRENCY_SYMBOL}{order.subTotal?.toFixed(2) || '0.00'}
                        </span>
                      </div>

                      {/* Shipping Cost */}
                      <div className="">
                        <span className="">Shipping:</span>
                        <span className="">
                          {CURRENCY_SYMBOL}{order.shippingCost?.toFixed(2) || '0.00'}
                        </span>
                      </div>

                      {/* First Time Discount */}
                      {order.firstTimeDiscount?.isApplied &&
                        order.firstTimeDiscount?.amount > 0 && (
                          <div className=" ">
                            <span className="">
                              🎉 First-time order discount (-
                              {order.firstTimeDiscount?.percentage || 10}%):
                            </span>
                            <span className=" ">
                              -{CURRENCY_SYMBOL}{order.firstTimeDiscount.amount.toFixed(2)}
                            </span>
                          </div>
                        )}

                      {/* Applied Coupons */}
                      {order.appliedCoupons &&
                        order.appliedCoupons.length > 0 && (
                          <>
                            {order.appliedCoupons.map((coupon, index) => (
                              <div key={index} className=" ">
                                <span className="">
                                  Coupon {coupon.couponCode} ({coupon.title}
                                  ):
                                </span>
                                <span className=" ">
                                  -{CURRENCY_SYMBOL}
                                  {(
                                    coupon.discountAmount ||
                                    coupon.discount ||
                                    0
                                  ).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </>
                        )}

                      {/* Legacy single coupon support */}
                      {!order.appliedCoupons?.length &&
                        order.appliedCoupon &&
                        order.appliedCoupon.discountAmount > 0 && (
                          <div className=" ">
                            <span className="">
                              Coupon {order.appliedCoupon.couponCode} (
                              {order.appliedCoupon.title}):
                            </span>
                            <span className=" ">
                              -{CURRENCY_SYMBOL}{order.appliedCoupon.discountAmount.toFixed(2)}
                            </span>
                          </div>
                        )}

                      {/* Legacy discount */}
                      {!order.appliedCoupons?.length &&
                        !order.appliedCoupon?.discountAmount &&
                        order.discount > 0 && (
                          <div className=" ">
                            <span className="">💰 Discount:</span>
                            <span className=" ">
                              -{CURRENCY_SYMBOL}{order.discount.toFixed(2)}
                            </span>
                          </div>
                        )}

                      {/* Total */}
                      <div className=" ">
                        <span className="">Total:</span>
                        <span className=" ">
                          {CURRENCY_SYMBOL}{order.totalAmount?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Information */}
                  {order.address && (
                    <div className="">
                      <h5 className="">Shipping Information</h5>
                      <div className="">
                        <div className="">
                          <span className="">Delivery Address:</span>
                          <span className="">
                            {order.name}, {order.address}, {order.city},{' '}
                            {order.state} {order.zipCode}
                          </span>
                        </div>
                        {order.shippingDetails?.trackingNumber && (
                          <div className="">
                            <span className="">Tracking Number:</span>
                            <span className=" ">
                              {order.shippingDetails.trackingNumber}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order Actions */}
                  <div className="">
                    {/* Tracking, not the confirmation page: a past order is
                        not a payment that just happened. */}
                    <Link href={`/track-order/${order._id}`} className=" ">
                      View Details
                    </Link>
                    {order.status?.toLowerCase() === 'delivered' && (
                      <button className=" ">Leave Review</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="">
          <div className="">🔍</div>
          <h4 className="">No {filter} orders found</h4>
          <p className="">Try changing the filter to see more orders</p>
          <button className="" onClick={() => setFilter('all')}>
            Show All Orders
          </button>
        </div>
      )}
    </div>
  );
}
