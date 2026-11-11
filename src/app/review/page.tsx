'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Star, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

const ReviewPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Check if token exists
  useEffect(() => {
    if (!token) {
      setError('Invalid review link. No token provided.');
    }
  }, [token]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!rating) {
      setError('Please select a rating before submitting');
      return;
    }

    if (!token) {
      setError('Invalid review link');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8092';
      const response = await fetch(`${apiUrl}/api/review/submit-unified-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          rating,
          comment: comment.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        // Redirect to shop page after 2 seconds
        setTimeout(() => {
          router.push('/shop');
        }, 2000);
      } else {
        setError(result.message || 'Failed to submit review. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRatingLabel = (ratingValue: number): string => {
    const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    return labels[ratingValue] || '';
  };

  // Success State
  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center transform transition-all duration-500 scale-100">
          <div className="mb-6 flex justify-center">
            <div className="bg-emerald-100 rounded-full p-4 animate-bounce">
              <CheckCircle className="h-16 w-16 text-emerald-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Thank You!
          </h2>
          <p className="text-gray-600 text-lg mb-4">
            Your review has been submitted successfully.
          </p>
          <p className="text-gray-500 text-sm">
            Redirecting to shop page...
          </p>
          <div className="mt-6">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-600" />
          </div>
        </div>
      </div>
    );
  }

  // Error State (Invalid Token or Already Submitted)
  if (error && !token) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <div className="bg-red-100 rounded-full p-4">
              <AlertCircle className="h-16 w-16 text-red-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Invalid Link
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <button
            onClick={() => router.push('/shop')}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg"
          >
            Go to Shop
          </button>
        </div>
      </div>
    );
  }

  // Main Review Form
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 py-12">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">

        {/* Form Content */}
        <form onSubmit={handleSubmitReview} className="p-6 md:p-10">
          {/* Star Rating Section */}
          <div className="mb-8">
            <label className="block text-xl font-bold text-gray-900 mb-4 text-center">
              How would you rate your experience?
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex justify-center gap-3 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform duration-200 hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`h-10 w-10 md:h-12 md:w-12 transition-colors duration-200 ${star <= (hoveredRating || rating)
                      ? 'fill-[var(--wf-sale)] text-[var(--wf-sale)]'
                      : 'fill-gray-200 text-gray-200'
                      }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-lg font-semibold text-blue-600 animate-fade-in">
                {getRatingLabel(rating)}
              </p>
            )}
          </div>


          {/* Comment Section */}
          <div className="mb-8">
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Share your thoughts about your order..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
            />
            <p className="text-xs text-gray-500 mt-2 text-right">
              {comment.length}/1000 characters
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !rating}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg ${loading || !rating
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 hover:shadow-xl transform hover:-translate-y-1'
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting...
              </span>
            ) : (
              'Submit Review'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const ReviewPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      }
    >
      <ReviewPageContent />
    </Suspense>
  );
};

export default ReviewPage;

