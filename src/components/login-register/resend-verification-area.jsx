'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
// internal
import ResendVerificationForm from '../forms/resend-verification-form';
const styles = new Proxy({}, { get: () => '' });

export default function ResendVerificationArea() {
  const searchParams = useSearchParams();
  const [helpMessage, setHelpMessage] = useState('');
  const emailFromParams = searchParams?.get('email');

  useEffect(() => {
    // Show special message if email is pre-filled
    if (emailFromParams) {
      setHelpMessage(
        'We found an unverified account with this email. Get a new verification link below.'
      );
    }
  }, [emailFromParams]);

  return (
    <>
      <section className="tp-login-area ">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-5 col-lg-6 col-md-8">
              <div className="tp-login-wrapper ">
                {/* Header */}
                <div
                  className="tp-login-top text-center "
                >
                  {/* Back Button */}
                  <div className="">
                    <Link href="/login" className="">
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
                      Back to Login
                    </Link>
                  </div>

                  <div className="">
                    <h1 className="tp-login-title ">
                      Activate Your Account
                    </h1>
                    <p className="">
                      Get a new verification link sent to your email
                    </p>
                  </div>

                  {/* Help Message */}
                  {helpMessage && (
                    <div className="">
                      <p>{helpMessage}</p>
                    </div>
                  )}
                </div>

                {/* Resend Verification Form */}
                <div className="tp-login-option ">
                  <ResendVerificationForm />
                </div>

                {/* Info Section */}
                <div className="">
                  <div className="">
                    <h4>📧 Verification Email Info</h4>
                    <ul>
                      <li>Check your spam/junk folder</li>
                      <li>Verification links expire after 10 minutes</li>
                      <li>You can request a new link every minute</li>
                      <li>Make sure you entered the correct email address</li>
                    </ul>
                  </div>
                </div>

                {/* Sign In Link */}
                <div className="">
                  <p>
                    Already activated your account?{' '}
                    <Link href="/login" className="">
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
