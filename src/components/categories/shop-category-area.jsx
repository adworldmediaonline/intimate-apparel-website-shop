'use client';
import React from 'react';
import ErrorMsg from '../common/error-msg';
import { useGetShowCategoryQuery } from '@/redux/features/categoryApi';
import { useRouter } from 'next/navigation';
import ShopCategoryLoader from '../loader/shop/shop-category-loader';

const ShopCategoryArea = () => {
  const { data: categories, isLoading, isError } = useGetShowCategoryQuery();
  const router = useRouter();
  // handle category route
  const handleCategoryRoute = title => {
    router.push(
      `/shop?category=${title
        .toLowerCase()
        .replace('&', '')
        .split(' ')
        .join('-')}`
    );
  };

  // decide what to render
  let content = null;

  if (isLoading) {
    content = <ShopCategoryLoader loading={isLoading} />;
  }
  if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error" />;
  }
  if (!isLoading && !isError && categories?.result?.length === 0) {
    content = <ErrorMsg msg="No Category found!" />;
  }
  if (!isLoading && !isError && categories?.result?.length > 0) {
    // Filter categories to only show ones with products
    const category_items = categories.result.filter(
      cat => cat.products?.length > 0 && cat.status === 'Show'
    );

    // Only render if there are categories with products
    if (category_items.length === 0) {
      content = <ErrorMsg msg="No categories with products found!" />;
    } else {
      content = category_items.map(item => (
        <div key={item._id} className="col-lg-3 col-sm-6">
          <div
            className="tp-category-main-box mb-25 p-relative fix"
            style={{ backgroundColor: '#F3F5F7' }}
          >
            <div className="tp-category-main-content">
              <h3
                className="tp-category-main-title pb-1"
                onClick={() => handleCategoryRoute(item.parent)}
              >
                <a className="cursor-pointer">{item.parent}</a>
              </h3>
              <span className="tp-category-main-item">
                {item.products.length} Product
                {item.products.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      ));
    }
  }

  // Only render the section if there's content to show
  return content ? (
    <section className="tp-category-area pb-120">
      <div className="container">
        <div className="row">{content}</div>
      </div>
    </section>
  ) : null;
};

export default ShopCategoryArea;
