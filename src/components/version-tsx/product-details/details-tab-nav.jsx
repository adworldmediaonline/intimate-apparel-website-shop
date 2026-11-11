'use client';
import DOMPurify from 'isomorphic-dompurify';
import { useState } from 'react';
import { Rating } from 'react-simple-star-rating';
import ReviewForm from './review-form';
import ReviewItem from './review-item';

const DetailsTabNav = ({ product }) => {
  const { _id, description, additionalInformation, reviews } = product || {};
  const [activeTab, setActiveTab] = useState('desc');

  const handleTabChange = tabId => {
    setActiveTab(tabId);
  };

  return (
    <div className="">
      <div className="">
        <button className="" onClick={() => handleTabChange('desc')}>
          Description
        </button>
        {additionalInformation && additionalInformation.length > 0 && (
          <button className="" onClick={() => handleTabChange('additional')}>
            Additional Information
          </button>
        )}
        <button className="" onClick={() => handleTabChange('review')}>
          Reviews ({reviews?.length || 0})
        </button>
      </div>

      <div className="">
        {activeTab === 'desc' && (
          <div className="">
            {description ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(description),
                }}
              />
            ) : (
              <p>No description available for this product.</p>
            )}
          </div>
        )}

        {activeTab === 'additional' && (
          <div className="">
            {additionalInformation && additionalInformation.length > 0 ? (
              <table className="">
                <tbody>
                  {additionalInformation.map((item, i) => (
                    <tr key={i}>
                      <td>{item.key}</td>
                      <td>{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No additional information available for this product.</p>
            )}
          </div>
        )}

        {activeTab === 'review' && (
          <div className=" ">
            {/* Reviews Summary Header */}
            <div className="">
              <div className="">
                <h3 className="">
                  {reviews && reviews.length > 0
                    ? 'Customer Reviews'
                    : 'No Reviews Yet'}
                </h3>
                <div className="">
                  {reviews && reviews.length > 0 ? (
                    <span className="">
                      {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="">Be the first to review!</span>
                  )}
                </div>
              </div>
              <div className="">
                <div className="">
                  {reviews && reviews.length > 0 && (
                    <>
                      <div className="">
                        {(
                          reviews.reduce(
                            (sum, review) => sum + review.rating,
                            0
                          ) / reviews.length
                        ).toFixed(1)}
                      </div>
                      <div className="">
                        <Rating
                          allowFraction
                          size={20}
                          initialValue={
                            reviews.reduce(
                              (sum, review) => sum + review.rating,
                              0
                            ) / reviews.length
                          }
                          readonly={true}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews Content Layout - Desktop Aside, Mobile Below */}
            <div className="">
              {/* Reviews List */}
              <div className="">
                {reviews && reviews.length > 0 ? (
                  <div className="">
                    {reviews.map(item => (
                      <ReviewItem key={item._id} review={item} />
                    ))}
                  </div>
                ) : (
                  <div className="">
                    <div className="">⭐</div>
                    <h4>No reviews yet</h4>
                    <p>
                      Be the first to share your experience with this product!
                    </p>
                  </div>
                )}
              </div>

              {/* Review Form Aside */}
              <div className="">
                <div className="">
                  <div className="">
                    <h3 className="">Share Your Experience</h3>
                    <p className="">
                      Your email address will not be published. Required fields
                      are marked *
                    </p>
                  </div>
                  <div className="">
                    <ReviewForm product_id={_id} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailsTabNav;
