'use client';
import { useUpdateProfileMutation } from '@/redux/features/auth/authApi';
import { notifyError, notifySuccess } from '@/utils/toast';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';
import ErrorMsg from '../common/error-msg';
// Removed CSS module import; Tailwind-only styling

// SVG Icons
const CheckIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <polyline
      points="20,6 9,17 4,12"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

// Simplified validation schema
const schema = Yup.object().shape({
  name: Yup.string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: Yup.string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  phone: Yup.string()
    .required('Phone number is required')
    .min(10, 'Phone number must be at least 10 digits'),
  address: Yup.string()
    .required('Address is required')
    .min(5, 'Please enter a complete address'),
  bio: Yup.string().min(10, 'Bio must be at least 10 characters'),
});

export default function ProfileInfo() {
  const { user } = useSelector(state => state.auth);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      bio: user?.bio || '',
    },
  });

  const watchedValues = watch();

  const onSubmit = data => {
    updateProfile({
      id: user?._id,
      ...data,
    }).then(result => {
      if (result?.error) {
        notifyError(result?.error?.data?.message || 'Failed to update profile');
      } else {
        notifySuccess('Profile updated successfully!');
      }
    });
  };

  const getCompletionPercentage = () => {
    const requiredFields = ['name', 'email', 'phone', 'address'];
    const optionalFields = ['bio'];

    const requiredFilled = requiredFields.filter(
      field => watchedValues[field] && watchedValues[field].trim()
    ).length;

    const optionalFilled = optionalFields.filter(
      field => watchedValues[field] && watchedValues[field].trim()
    ).length;

    const requiredPercentage = (requiredFilled / requiredFields.length) * 70;
    const optionalPercentage = (optionalFilled / optionalFields.length) * 30;

    return Math.round(requiredPercentage + optionalPercentage);
  };

  const completionPercentage = getCompletionPercentage();

  return (
    <div className="">
      {/* Profile Header */}
      <div className="">
        <div className="">
          <div className="">
            <div className="">
              <div className="">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
            <div className="">
              <h2 className="">Profile Information</h2>
              <p className="">
                Update your personal details and contact information
              </p>
            </div>
          </div>

          <div className="">
            <div className="">
              <span className="">Profile Completion</span>
              <span className="">{completionPercentage}%</span>
            </div>
            <div className="">
              <div
                className=""
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Single Form */}
      <div className="">
        <form onSubmit={handleSubmit(onSubmit)} className="">
          {/* Basic Information Section */}
          <div className="">
            <h3 className="">Basic Information</h3>

            <div className="">
              <div className="">
                <label className="">
                  Full Name <span className="">*</span>
                </label>
                <div className="">
                  <input
                    type="text"
                    className=""
                    placeholder="Enter your full name"
                    {...register('name')}
                  />
                  {watchedValues.name && !errors.name && (
                    <CheckIcon className="" />
                  )}
                </div>
                {errors.name && <ErrorMsg msg={errors.name.message} />}
              </div>

              <div className="">
                <label className="">
                  Email Address <span className="">*</span>
                </label>
                <div className="">
                  <input
                    type="email"
                    className=""
                    placeholder="Enter your email"
                    {...register('email')}
                  />
                  {watchedValues.email && !errors.email && (
                    <CheckIcon className="" />
                  )}
                </div>
                {errors.email && <ErrorMsg msg={errors.email.message} />}
              </div>

              <div className="">
                <label className="">
                  Phone Number <span className="">*</span>
                </label>
                <div className="">
                  <input
                    type="tel"
                    className=""
                    placeholder="Enter your phone number"
                    {...register('phone')}
                  />
                  {watchedValues.phone && !errors.phone && (
                    <CheckIcon className="" />
                  )}
                </div>
                {errors.phone && <ErrorMsg msg={errors.phone.message} />}
              </div>

              <div className="">
                <label className="">
                  Bio <span className="">(Optional)</span>
                </label>
                <div className="">
                  <textarea
                    className=""
                    placeholder="Tell us about yourself"
                    rows="3"
                    {...register('bio')}
                  />
                  {watchedValues.bio && !errors.bio && (
                    <CheckIcon className="" />
                  )}
                </div>
                {errors.bio && <ErrorMsg msg={errors.bio.message} />}
              </div>
            </div>
          </div>

          {/* Address Information Section */}
          <div className="">
            <h3 className="">Address Information</h3>

            <div className="">
              <div className=" ">
                <label className="">
                  Address <span className="">*</span>
                </label>
                <div className="">
                  <input
                    type="text"
                    className={` ${errors.address ? styles.inputError : ''} ${
                      watchedValues.address && !errors.address
                        ? styles.inputSuccess
                        : ''
                    }`}
                    placeholder="Enter your full address"
                    {...register('address')}
                  />
                  {watchedValues.address && !errors.address && (
                    <CheckIcon className="" />
                  )}
                </div>
                {errors.address && <ErrorMsg msg={errors.address.message} />}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="">
            <button type="submit" disabled={isLoading} className="">
              {isLoading ? (
                <>
                  <div className=""></div>
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
