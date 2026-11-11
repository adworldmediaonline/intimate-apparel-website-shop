'use client';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
// internal
import { useRegisterUserMutation } from '@/redux/features/auth/authApi';
import { CloseEye, OpenEye } from '@/svg';
import { notifyError, notifySuccess } from '@/utils/toast';
import ErrorMsg from '../common/error-msg';

// schema
const schema = Yup.object().shape({
  name: Yup.string().required().label('Name'),
  email: Yup.string().required().email().label('Email'),
  password: Yup.string().required().min(6).label('Password'),
});

export default function RegisterForm({ redirectUrl }) {
  const [showPass, setShowPass] = useState(false);
  const [registerUser, { isLoading }] = useRegisterUserMutation();
  const router = useRouter();

  // react hook form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  // on submit
  const onSubmit = async data => {
    try {
      const result = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      }).unwrap();

      notifySuccess(
        'Registration successful! Please check your email to activate your account.'
      );
      reset();

      // Slight delay before redirect for better UX
      setTimeout(() => {
        // If redirectUrl is provided, add it to the login redirect
        if (redirectUrl) {
          router.push(`/login?redirect=${redirectUrl}`);
        } else {
          router.push('/login');
        }
      }, 1500);
    } catch (error) {
      const errorMessage =
        error?.data?.error || error?.data?.message || 'Registration failed';

      // Check if this is an unverified account error
      if (error?.data?.resendAvailable) {
        notifyError(
          `${errorMessage} You can request a new verification link.`,
          {
            duration: 6000,
            style: {
              backgroundColor: '#fff3cd',
              color: '#856404',
              border: '1px solid #ffeaa7',
            },
          }
        );

        // Redirect to resend verification page after a delay
        setTimeout(() => {
          router.push(
            `/resend-verification?email=${encodeURIComponent(data.email)}`
          );
        }, 2000);
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
              {...register('name', { required: `Name is required!` })}
              id="name"
              name="name"
              type="text"
              placeholder="your name..."
              disabled={isLoading}
            />
          </div>
          <div className="tp-login-input-title">
            <label htmlFor="name">Your Name</label>
          </div>
          <ErrorMsg msg={errors.name?.message} />
        </div>
        <div className="tp-login-input-box">
          <div className="tp-login-input">
            <input
              {...register('email', { required: `Email is required!` })}
              id="email"
              name="email"
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
              Creating Account...
            </span>
          ) : (
            'Sign Up'
          )}
        </button>
      </div>
    </form>
  );
}
