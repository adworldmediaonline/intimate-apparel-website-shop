'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
// internal
import ErrorMsg from '../common/error-msg';
import CloudinaryImage from '@/components/common/CloudinaryImage';
import { useGetShowCategoryQuery } from '@/redux/features/categoryApi';
import HomeCateLoader from '../loader/home/home-cate-loader';

const ElectronicCategory = () => {
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

  // Updated slider settings for better mobile experience
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 1,
    swipeToSlide: true,
    touchThreshold: 10,
    useCSS: true,
    useTransform: true,
    cssEase: 'cubic-bezier(0.24, 0.74, 0.58, 1)',
    waitForAnimate: false,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3.3,
          slidesToScroll: 1,
          arrows: false,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2.3,
          slidesToScroll: 1,
          arrows: false,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1.5,
          slidesToScroll: 1,
          arrows: false,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1.2,
          slidesToScroll: 1,
          arrows: false,
        },
      },
    ],
  };

  // decide what to render
  let content = null;

  if (isLoading) {
    content = <HomeCateLoader loading={isLoading} />;
  }
  if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error" />;
  }
  if (!isLoading && !isError && categories?.result?.length === 0) {
    content = <ErrorMsg msg="No Category found!" />;
  }
  if (!isLoading && !isError && categories?.result?.length > 0) {
    // Get main categories (categories with products)
    const category_items = categories.result.filter(
      cat => cat.products?.length > 0 && cat.status === 'Show'
    );

    content = (
      <div className="tp-product-category-slider-area">
        <div className="category-slider-active">
          <Slider {...settings}>
            {category_items.map(item => (
              <div
                className="tp-product-category-item text-center"
                key={item._id}
              >
                <div
                  className="tp-product-category-wrapper"
                  onClick={() => handleCategoryRoute(item.parent)}
                >
                  <div className="tp-product-category-thumb">
                    <a className="cursor-pointer">
                      <CloudinaryImage
                        src={item.img}
                        alt={`${item.parent} category`}
                        width={160}
                        height={160}
                        sizes="(max-width: 1024px) 140px, 160px"
                        priority={true}
                        quality="auto"
                        format="auto"
                        dpr="auto"
                        crop="pad"
                        objectFit="contain"
                        style={{
                          maxWidth: '65%',
                          height: 'auto',
                          transition:
                            'all 0.35s cubic-bezier(0.24, 0.74, 0.58, 1)',
                        }}
                        gravity="center"
                      />
                    </a>
                  </div>
                  <div className="tp-product-category-content">
                    <h3 className="tp-product-category-title mb-1">
                      <a className="cursor-pointer text-[16px] font-medium text-heading hover:text-theme-primary">
                        {item.parent}
                      </a>
                    </h3>
                    <span className="text-[14px] text-body-text">
                      {item.products.length} Product
                      {item.products.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
        <div className="slider-gradient-overlay left"></div>
        <div className="slider-gradient-overlay right"></div>
      </div>
    );
  }

  return (
    <section className="tp-product-category pt-60 pb-15">
      <div className="container position-relative">
        <div className="row align-items-end">
          <div className="col-xl-12">
            <div className="section-title mb-40">
              <h3 className="tp-section-title">Shop by Category</h3>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xl-12">
            <div className="tp-product-category-slider-area">
              <div className="category-slider-active">{content}</div>
              <div className="slider-gradient-overlay left"></div>
              <div className="slider-gradient-overlay right"></div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .tp-product-category-slider-area {
          position: relative;
          overflow: hidden;
          padding: 0;
          margin: 0;
        }

        .category-slider-active {
          position: relative;
          z-index: 1;
          margin: 0 -12px;
        }

        .slider-gradient-overlay {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 120px;
          z-index: 2;
          pointer-events: none;
          opacity: 0.85;
          display: none;
        }

        .slider-gradient-overlay.right {
          right: 0;
          display: block;
          background: linear-gradient(
            to left,
            rgba(255, 255, 255, 1) 0%,
            rgba(255, 255, 255, 0.9) 20%,
            rgba(255, 255, 255, 0) 100%
          );
        }

        .tp-product-category-item {
          padding: 15px;
          margin: 12px;
          background-color: var(--tp-common-white);
          border-radius: 10px;
          transition: all 0.3s ease-in-out;
        }

        .tp-product-category-item:hover {
          transform: translateY(-5px);
          box-shadow: 0px 15px 35px rgba(171, 171, 171, 0.15);
        }

        .tp-product-category-thumb {
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 140px;
          width: 140px;
          padding: 15px;
          background-color: var(--tp-common-white);
          border-radius: 50%;
          margin: auto;
          position: relative;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.24, 0.74, 0.58, 1);
          box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.06);
        }

        .tp-product-category-thumb:hover img {
          transform: scale(1.08);
        }

        .tp-product-category-content {
          margin-top: 20px;
          text-align: center;
        }

        .tp-product-category-title {
          font-size: 15px;
          font-weight: 500;
          margin-bottom: 5px;
          color: var(--tp-common-black);
          transition: color 0.3s ease;
        }

        .tp-product-category-title:hover {
          color: var(--tp-theme-primary);
        }

        /* Slick arrow styles */
        .slick-prev,
        .slick-next {
          width: 44px;
          height: 44px;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
          z-index: 3;
          transition: all 0.3s ease;
        }

        .slick-prev:hover,
        .slick-next:hover {
          background: var(--tp-theme-primary);
        }

        .slick-prev {
          left: 15px;
        }

        .slick-next {
          right: 15px;
        }

        .slick-prev:before,
        .slick-next:before {
          color: #666;
          font-size: 18px;
          transition: all 0.3s ease;
        }

        .slick-prev:hover:before,
        .slick-next:hover:before {
          color: #fff;
        }

        @media (max-width: 1400px) {
          .tp-product-category-thumb {
            height: 130px;
            width: 130px;
          }
          .slider-gradient-overlay {
            width: 100px;
          }
        }

        @media (max-width: 1200px) {
          .tp-product-category-thumb {
            height: 120px;
            width: 120px;
          }
          .slider-gradient-overlay {
            width: 90px;
          }
        }

        @media (max-width: 992px) {
          .tp-product-category-thumb {
            height: 110px;
            width: 110px;
            padding: 10px;
          }
          .tp-product-category-title {
            font-size: 14px;
          }
          .slider-gradient-overlay {
            width: 70px;
          }
          .slick-list {
            overflow: visible;
          }
        }

        @media (max-width: 768px) {
          .tp-product-category-thumb {
            height: 100px;
            width: 100px;
          }
          .tp-product-category-item {
            padding: 10px;
            margin: 8px;
          }
          .slider-gradient-overlay {
            width: 60px;
          }
        }

        @media (max-width: 576px) {
          .tp-product-category-thumb {
            height: 90px;
            width: 90px;
          }
          .tp-product-category-title {
            font-size: 13px;
          }
          .slider-gradient-overlay {
            width: 50px;
          }
          .tp-product-category-item {
            margin: 5px;
          }
        }

        @media (max-width: 480px) {
          .tp-product-category-thumb {
            height: 85px;
            width: 85px;
          }
          .slider-gradient-overlay {
            width: 40px;
          }
        }
      `}</style>
    </section>
  );
};

export default ElectronicCategory;
