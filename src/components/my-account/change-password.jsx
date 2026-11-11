'use client';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';
// Removed CSS module import; Tailwind-only styling
// internal
import { useChangePasswordMutation } from '@/redux/features/auth/authApi';
import { notifyError, notifySuccess } from '@/utils/toast';
import ErrorMsg from '../common/error-msg';

// SVG Icons
const LockIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect
      x="3"
      y="11"
      width="18"
      height="11"
      rx="2"
      ry="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle cx="12" cy="16" r="1" fill="currentColor" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const EyeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const EyeOffIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94L17.94 17.94z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19l-6.84-6.84z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const ShieldIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" />
  </svg>
);

// Enhanced validation schema
const schema = Yup.object().shape({
  password: Yup.string()
    .required('Current password is required')
    .min(6, 'Password must be at least 6 characters'),
  newPassword: Yup.string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match'),
});

// Schema for Google users (no current password required)
const schemaTwo = Yup.object().shape({
  newPassword: Yup.string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match'),
});

const PasswordStrengthIndicator = ({ password }) => {
  const getStrength = pwd => {
    let score = 0;
    if (!pwd) return { score: 0, label: '', color: '' };

    // Length check
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;

    // Character variety checks
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score < 3) return { score, label: 'Weak', color: '#ff4757' };
    if (score < 5) return { score, label: 'Fair', color: '#ffa502' };
    if (score < 6) return { score, label: 'Good', color: '#2ed573' };
    return { score, label: 'Strong', color: '#5f27cd' };
  };

  const strength = getStrength(password);
  const percentage = (strength.score / 6) * 100;

  return (
    <div className="">
      <div className="">
        <div
          className=""
          style={{
            width: `${percentage}%`,
            backgroundColor: strength.color,
          }}
        ></div>
      </div>
      {password && (
        <span className="" style={{ color: strength.color }}>
          {strength.label}
        </span>
      )}
    </div>
  );
};

export default function ChangePassword() {
  const { user } = useSelector(state => state.auth);
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(user?.googleSignIn ? schemaTwo : schema),
  });

  const newPassword = watch('newPassword');

  const onSubmit = data => {
    changePassword({
      email: user?.email,
      password: data.password,
      newPassword: data.newPassword,
      googleSignIn: user?.googleSignIn,
    }).then(result => {
      if (result?.error) {
        notifyError(
          result?.error?.data?.message || 'Failed to change password'
        );
      } else {
        notifySuccess('Password changed successfully!');
        reset();
        setShowPasswords({ current: false, new: false, confirm: false });
      }
    });
  };

  const togglePasswordVisibility = field => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="">
      {/* Enhanced Header */}
      <div className="">
        <div className="">
          <div className="">
            <LockIcon className="" />
          </div>
          <h2 className="">Change Password</h2>
          <p className="">
            Keep your account secure by using a strong, unique password
          </p>
        </div>
        <div className="">
          <ShieldIcon className="" />
          <span>Secure</span>
        </div>
      </div>

      {/* Security Tips */}
      <div className="">
        <h3 className="">
          <ShieldIcon className="" />
          Password Security Tips
        </h3>
        <ul className="">
          <li className="">
            <CheckIcon className="" />
            Use at least 8 characters with a mix of letters, numbers, and
            symbols
          </li>
          <li className="">
            <CheckIcon className="" />
            Avoid using personal information like names or birthdays
          </li>
          <li className="">
            <CheckIcon className="" />
            Don't reuse passwords from other accounts
          </li>
          <li className="">
            <CheckIcon className="" />
            Consider using a password manager
          </li>
        </ul>
      </div>

      {/* Password Form */}
      <div className="">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="">
            {/* Current Password (not for Google users) */}
            {!user?.googleSignIn && (
              <div className=" ">
                <label htmlFor="password" className="">
                  Current Password <span className="">*</span>
                </label>
                <div className="">
                  <input
                    {...register('password')}
                    id="password"
                    type={showPasswords.current ? 'text' : 'password'}
                    className=""
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    className=""
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPasswords.current ? (
                      <EyeOffIcon className="" />
                    ) : (
                      <EyeIcon className="" />
                    )}
                  </button>
                </div>
                <ErrorMsg msg={errors.password?.message} />
              </div>
            )}

            {/* New Password */}
            <div className="">
              <label htmlFor="newPassword" className="">
                New Password <span className="">*</span>
              </label>
              <div className="">
                <input
                  {...register('newPassword')}
                  id="newPassword"
                  type={showPasswords.new ? 'text' : 'password'}
                  className=""
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  className=""
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? (
                    <EyeOffIcon className="" />
                  ) : (
                    <EyeIcon className="" />
                  )}
                </button>
              </div>
              <PasswordStrengthIndicator password={newPassword} />
              <ErrorMsg msg={errors.newPassword?.message} />
            </div>

            {/* Confirm Password */}
            <div className="">
              <label htmlFor="confirmPassword" className="">
                Confirm New Password <span className="">*</span>
              </label>
              <div className="">
                <input
                  {...register('confirmPassword')}
                  id="confirmPassword"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  className=""
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  className=""
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? (
                    <EyeOffIcon className="" />
                  ) : (
                    <EyeIcon className="" />
                  )}
                </button>
              </div>
              <ErrorMsg msg={errors.confirmPassword?.message} />
            </div>
          </div>

          {/* Security Information */}
          <div className="">
            <div className="">
              <CheckIcon className="" />
              <span>Password will be updated immediately</span>
            </div>
            <div className="">
              <CheckIcon className="" />
              <span>You'll remain logged in on this device</span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="">
            <button
              type="button"
              className=" "
              onClick={() => {
                reset();
                setShowPasswords({
                  current: false,
                  new: false,
                  confirm: false,
                });
              }}
            >
              Cancel
            </button>
            <button type="submit" className="" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className=""></div>
                  Updating Password...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Last Updated Info */}
      <div className="">
        <span>
          Password last updated:{' '}
          {user?.passwordUpdatedAt
            ? new Date(user.passwordUpdatedAt).toLocaleDateString()
            : 'Never'}
        </span>
      </div>
    </div>
  );
}
