'use client';
import { useGetUserOrdersQuery } from '@/redux/features/order/orderApi';
import ChangePassword from './change-password';
import MyOrders from './my-orders';
import NavProfileTab from './nav-profile-tab';
import ProfileInfo from './profile-info';
import ProfileNavTab from './profile-nav-tab';

export default function ProfileArea() {
  const {
    data: orderData,
    isError,
    isLoading,
  } = useGetUserOrdersQuery(undefined);

  return (
    <section>
      <ProfileNavTab activeTab={activeTab} setActiveTab={setActiveTab} />

      <NavProfileTab orderData={orderData} />

      <ProfileInfo />

      <ChangePassword />

      <MyOrders orderData={orderData} />
    </section>
  );
}
