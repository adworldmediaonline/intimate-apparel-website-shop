'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'next/navigation';
// internal
import ErrorMsg from '@/components/common/error-msg';
import { useGetAllProductsQuery } from '@/redux/features/productApi';
import { handleFilterSidebarClose } from '@/redux/features/shop-filter-slice';
import ShopColorLoader from '@/components/loader/shop/color-filter-loader';

const ColorFilter = ({ setCurrPage, shop_right = false }) => {
  const { data: products, isError, isLoading } = useGetAllProductsQuery({
  publishStatus: 'published',
});
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const color = searchParams.get('color');

  // handle color
  const handleColor = clr => {
    setCurrPage(1);
    router.push(
      `/${shop_right ? 'shop-right-sidebar' : 'shop'}?color=${clr
        .toLowerCase()
        .split(' ')
        .join('-')}`
    );
    dispatch(handleFilterSidebarClose());
  };
  // decide what to render
  let content = null;

  if (isLoading) {
    content = <ShopColorLoader loading={isLoading} />;
  }
  if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error" />;
  }
  if (!isLoading && !isError && products?.data?.length === 0) {
    content = <ErrorMsg msg="No Products found!" />;
  }
  if (!isLoading && !isError && products?.data?.length > 0) {
    // Since we no longer have color information in imageURLs,
    // we'll use a default set of colors or get them from another source
    const defaultColors = [
      { name: 'Black', clrCode: '#000000' },
      { name: 'White', clrCode: '#FFFFFF' },
      { name: 'Red', clrCode: '#FF0000' },
      { name: 'Blue', clrCode: '#0000FF' },
      { name: 'Green', clrCode: '#008000' },
      // Add more default colors as needed
    ];

    content = defaultColors.map((item, i) => (
      <li key={i}>
        <div className="tp-shop-widget-checkbox-circle">
          <input
            type="checkbox"
            id={item.name}
            checked={
              color ===
              item.name.toLowerCase().replace('&', '').split(' ').join('-')
                ? 'checked'
                : false
            }
            readOnly
          />
          <label onClick={() => handleColor(item.name)} htmlFor={item.name}>
            {item.name}
          </label>
          <span
            style={{ backgroundColor: `${item.clrCode}` }}
            className="tp-shop-widget-checkbox-circle-self"
          ></span>
        </div>
        <span className="tp-shop-widget-checkbox-circle-number">
          {/* Since we don't have color info in imageURLs anymore,
              we'll show the total number of products */}
          {products.data.length}
        </span>
      </li>
    ));
  }

  return (
    <>
      <div className="tp-shop-widget mb-50">
        <h3 className="tp-shop-widget-title">Filter by Color</h3>
        <div className="tp-shop-widget-content">
          <div className="tp-shop-widget-checkbox-circle-list">
            <ul>{content}</ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default ColorFilter;
