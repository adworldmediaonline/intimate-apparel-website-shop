import { useGetStoreOrderByIdQuery } from '@/redux/features/order/orderApi';
import type { StoreOrderDocument } from '@/types/store-order';

/**
 * RTK subscription for storefront order pages. Pass the `id` from the server page
 * (`await params` → prop) so the value matches the URL segment with no client-side rerouting.
 */
export const useStoreOrder = (orderId: string) => {
  const query = useGetStoreOrderByIdQuery(orderId, {
    skip: !orderId,
    refetchOnMountOrArgChange: true,
  });

  const { data, isError, isLoading, isFetching, isUninitialized } = query;

  const isPending =
    !isError &&
    (isUninitialized || isLoading || (isFetching && data === undefined));

  const hasRenderableOrder = Boolean(
    data?.success === true && data.order != null
  );

  const orderDoc: StoreOrderDocument | undefined = hasRenderableOrder
    ? data!.order!
    : undefined;

  return {
    ...query,
    isPending,
    hasRenderableOrder,
    orderDoc,
  };
};
