'use client';
import { yupResolver } from '@hookform/resolvers/yup';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
// internal
import { useLoginUserMutation } from '@/redux/features/auth/authApi';
import { CloseEye, OpenEye } from '@/svg';
import { notifyError, notifySuccess } from '@/utils/toast';
import ErrorMsg from '../common/error-msg';

// schema
const schema = Yup.object().shape({
  email: Yup.string().required().email().label('Email'),
  password: Yup.string().required().min(6).label('Password'),
});

export default function LoginForm() {
  const [showPass, setShowPass] = useState(false);
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get redirect path if any
  const redirectTo = searchParams.get('redirect') || '/';

  // react hook form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  // onSubmit
  const onSubmit = async data => {
    try {
      const result = await loginUser({
        email: data.email,
        password: data.password,
      }).unwrap();

      if (result) {
        notifySuccess('Login successful!');
        reset();

        // Small delay for better UX
        setTimeout(() => {
          // Redirect to checkout if coming from there, otherwise to home
          router.push(redirectTo === '/' ? '/checkout' : redirectTo);
        }, 800);
      }
    } catch (error) {
      const errorMessage = error?.data?.error || 'Login failed';

      // Check if this is an inactive account error
      if (
        errorMessage.includes('activation link') ||
        errorMessage.includes('activate your account')
      ) {
        notifyError(`${errorMessage}`, {
          duration: 6000,
          style: {
            backgroundColor: '#fff3cd',
            color: '#856404',
            border: '1px solid #ffeaa7',
          },
        });

        // Redirect to resend verification page after a delay
        setTimeout(() => {
          router.push(
            `/resend-verification?email=${encodeURIComponent(data.email)}`
          );
        }, 3000);
      } else {
        notifyError(errorMessage);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="tp-login-input-wrapper">
        <div className="tp-login-input-box">
          <div className="tp-login-input">
            <input
              {...register('email', { required: `Email is required!` })}
              name="email"
              id="email"
              type="email"
              placeholder="your@mail.com"
              disabled={isLoading}
            />
          </div>
          <div className="tp-login-input-title">
            <label htmlFor="email">Your Email</label>
          </div>
          <ErrorMsg msg={errors.email?.message} />
        </div>
        <div className="tp-login-input-box">
          <div className="p-relative">
            <div className="tp-login-input">
              <input
                {...register('password', { required: `Password is required!` })}
                id="password"
                name="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Min. 6 character"
                disabled={isLoading}
              />
            </div>
            <div className="tp-login-input-eye" id="password-show-toggle">
              <span className="open-eye" onClick={() => setShowPass(!showPass)}>
                {showPass ? <CloseEye /> : <OpenEye />}
              </span>
            </div>
            <div className="tp-login-input-title">
              <label htmlFor="password">Password</label>
            </div>
          </div>
          <ErrorMsg msg={errors.password?.message} />
        </div>
      </div>
      <div className="tp-login-suggetions d-sm-flex align-items-center justify-content-between mb-20">
        <div className="tp-login-remeber">
          <input id="remeber" type="checkbox" disabled={isLoading} />
          <label htmlFor="remeber">Remember me</label>
        </div>
        <div className="tp-login-forgot">
          <Link href="/forgot">Forgot Password?</Link>
        </div>
      </div>
      <div className="tp-login-bottom">
        <button
          type="submit"
          className="tp-login-btn w-100"
          disabled={isLoading}
        >
          {isLoading ? (
            <span>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Signing In...
            </span>
          ) : (
            'Login'
          )}
        </button>
      </div>
    </form>
  );
}
