'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
// internal
// import LoginShapes from './login-shapes';
import RegisterForm from '../forms/register-form';

export default function RegisterArea() {
  const searchParams = useSearchParams();
  const [redirectMessage, setRedirectMessage] = useState('');
  const redirectTo = searchParams.get('redirect');

  useEffect(() => {
    // Show special message if coming from checkout
    if (redirectTo === '/checkout') {
      setRedirectMessage(
        'Sign up to continue with your order or go back to checkout as guest.'
      );
    }
  }, [redirectTo]);

  return (
    <>
      <section className="tp-login-area ">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-5 col-lg-6 col-md-8">
              <div className="tp-login-wrapper ">
                {/* Clean Header */}
                <div className="tp-login-top text-center ">
                  {/* Back Button */}
                  <div className="">
                    <Link href="/" className="">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M19 12H5M12 19L5 12L12 5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Back to Home
                    </Link>
                  </div>

                  <div className="">
                    <h1 className="tp-login-title ">Create Account</h1>
                    <p className="">Join Intimate Apparel today</p>
                  </div>

                  {/* Redirect Message */}
                  {redirectMessage && (
                    <div className="">
                      <p>{redirectMessage}</p>
                      <Link href="/checkout" className="">
                        ← Return to checkout
                      </Link>
                    </div>
                  )}
                </div>

                {/* Register Form */}
                <div className="tp-login-option ">
                  <RegisterForm redirectUrl={redirectTo} />
                </div>

                {/* Sign In Link */}
                <div className="">
                  <p>
                    Already have an account?{' '}
                    <Link
                      href={
                        redirectTo ? `/login?redirect=${redirectTo}` : '/login'
                      }
                      className=""
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
