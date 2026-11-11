'use client';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
// internal
import { useResendVerificationMutation } from '@/redux/features/auth/authApi';
import { notifyError, notifySuccess } from '@/utils/toast';
import ErrorMsg from '../common/error-msg';

// schema
const schema = Yup.object().shape({
  email: Yup.string().required().email().label('Email'),
});

export default function ResendVerificationForm({ email = '', onSuccess }) {
  const [resendVerification, { isLoading }] = useResendVerificationMutation();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get email from URL params if available
  const emailFromParams = searchParams?.get('email') || email;

  // react hook form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: emailFromParams },
  });

  // Update form when email from params changes
  useEffect(() => {
    if (emailFromParams) {
      setValue('email', emailFromParams);
    }
  }, [emailFromParams, setValue]);

  // on submit
  const onSubmit = async data => {
    try {
      const result = await resendVerification({
        email: data.email,
      }).unwrap();

      notifySuccess(
        'Verification email sent! Please check your email to activate your account.'
      );

      // Redirect to login after successful send
      setTimeout(() => {
        router.push('/login');
      }, 2000);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const errorMessage =
        error?.data?.error || 'Failed to resend verification email';
      notifyError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="tp-login-input-wrapper">
        <div className="tp-login-input-box">
          <div className="tp-login-input">
            <input
              {...register('email')}
              name="email"
              id="email"
              type="email"
              placeholder="Enter your email address"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
          <div className="tp-login-input-title">
            <label htmlFor="email">Your Email</label>
          </div>
          <ErrorMsg msg={errors.email?.message} />
        </div>
      </div>

      <div className="tp-login-suggetions d-sm-flex align-items-center justify-content-between mb-20">
        <div className="tp-login-remeber">
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
            💡 Check your spam folder if you don't see the email
          </p>
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
              Sending Email...
            </span>
          ) : (
            'Send Verification Email'
          )}
        </button>
      </div>
    </form>
  );
}
