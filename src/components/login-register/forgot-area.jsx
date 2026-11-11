'use client';
import Link from 'next/link';
import ForgotForm from '../forms/forgot-form';

// import LoginShapes from './login-shapes';

export default function ForgotArea() {
  return (
    <section className="tp-login-area ">
      {/* <LoginShapes /> */}
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-5 col-lg-6 col-md-8">
            <div className="tp-login-wrapper ">
              {/* Clean Header */}
              <div className="tp-login-top text-center ">
                <div className="">
                  <h1 className="tp-login-title ">Reset Password</h1>
                  <p className="">
                    Enter your email address to request password reset
                  </p>
                </div>
              </div>

              {/* Forgot Form */}
              <div className="tp-login-option ">
                <ForgotForm />
              </div>

              {/* Back to Login Link */}
              <div className="">
                <p>
                  Remember your password?{' '}
                  <Link href="/login" className="">
                    Back to login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
