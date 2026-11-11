'use client';
import { authClient } from '@/lib/authClient';
import { cn } from '@/lib/utils';

import { COMMERCE_COUNTRY } from '@/lib/brand';
import { Country } from 'country-state-city';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Controller } from 'react-hook-form';
import ErrorMsg from '../../common/error-msg';
import { SearchableSelect } from '@/components/ui/searchable-select';
import AddressRegionFields from './address-region-fields';
import CheckoutShippingAddress from './checkout-shipping-address';

const CheckoutBillingArea = ({ register, errors, setValue, control, checkoutData }) => {
  const user = useMemo(() => ({}), []);
  const { isCheckoutSubmitting } = useSelector(state => state.order);

  const {
    register: checkoutRegister,
  } = checkoutData;

  const countries = useMemo(() => Country.getAllCountries(), []);
  // The store's home market (brand.config.json commerce.country), not a
  // hardcoded 'US' inherited from the stack this checkout was copied from.
  const defaultCountry = useMemo(
    () => countries.find(country => country.isoCode === COMMERCE_COUNTRY),
    [countries]
  );

  const [selectedCountry, setSelectedCountry] = useState(
    defaultCountry || null
  );

  // Set initial form values to prevent validation errors
  useEffect(() => {
    if (user?.firstName) setValue('firstName', user.firstName);
    if (user?.lastName) setValue('lastName', user.lastName);
    if (user?.email) setValue('email', user.email);
    if (defaultCountry) setValue('country', defaultCountry.isoCode);
    if (defaultCountry) setValue('shippingCountry', defaultCountry.isoCode);
    setValue('sameAsBillingAddress', true);
  }, [user, setValue, defaultCountry]);

  const handleCountryChange = e => {
    if (isCheckoutSubmitting) return;

    const countryCode = e.target.value;
    if (!countryCode) return;

    const country = countries.find(c => c.isoCode === countryCode);

    setSelectedCountry(country);
    setValue('country', countryCode);
    // A state and city only belong to the country they were picked under.
    setValue('state', '');
    setValue('city', '');
  };

  const handleAddressChange = e => {
    if (isCheckoutSubmitting) return;

    const address = e.target.value;
    setValue('address', address);
  };

  const handleZipCodeChange = e => {
    if (isCheckoutSubmitting) return;

    const zipCode = e.target.value;
    setValue('zipCode', zipCode);
  };

  return (
    <div className="bg-card rounded-lg shadow-sm p-3 md:p-6 border border-border">
      <div className="space-y-4 md:space-y-6">
        <div>
          <div className="mb-3 space-y-0.5 md:mb-5 md:space-y-1">
            <h3 className="text-base md:text-xl font-semibold text-foreground">
              Billing Details
            </h3>
            {/* Explanatory line is desktop-only: on a phone the labelled
                fields directly below already say what this is. */}
            <p className="hidden text-sm text-muted-foreground md:block">
              Enter the contact and billing details for this order.
            </p>
          </div>

          <div className="space-y-3 md:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1 md:mb-2">
                  First Name <span className="text-destructive">*</span>
                </label>
                <input
                  {...register('firstName', {
                    required: `First Name is required!`,
                  })}
                  name="firstName"
                  id="firstName"
                  type="text"
                  placeholder="First Name"
                  defaultValue={user?.firstName}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <ErrorMsg msg={errors?.firstName?.message} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1 md:mb-2">
                  Last Name <span className="text-destructive">*</span>
                </label>
                <input
                  {...register('lastName', {
                    required: `Last Name is required!`,
                  })}
                  name="lastName"
                  id="lastName"
                  type="text"
                  placeholder="Last Name"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <ErrorMsg msg={errors?.lastName?.message} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1 md:mb-2">
                Country <span className="text-destructive">*</span>
              </label>
              <Controller
                name="country"
                control={control}
                rules={{ required: 'Country is required!' }}
                render={({ field }) => {
                  const countryOptions = countries.map(country => ({
                    value: country.isoCode,
                    label: country.name,
                  }));

                  return (
                    <>
                      <SearchableSelect
                        options={countryOptions}
                        value={
                          field.value || selectedCountry?.isoCode || COMMERCE_COUNTRY
                        }
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Simulate event for handleCountryChange
                          const syntheticEvent = {
                            target: { value },
                          };
                          handleCountryChange(syntheticEvent);
                        }}
                        placeholder="Select Country"
                        searchPlaceholder="Search countries..."
                        emptyMessage="No country found."
                        error={!!errors?.country}
                      />
                    </>
                  );
                }}
              />
              <ErrorMsg msg={errors?.country?.message} />
            </div>



            <div>
              <label className="block text-sm font-medium text-foreground mb-1 md:mb-2">
                Street address <span className="text-destructive">*</span>
              </label>
              <input
                {...register('address', {
                  required: `Address is required!`,
                  onChange: e => {
                    handleAddressChange(e);
                  },
                })}
                name="address"
                id="address"
                type="text"
                placeholder="House number and street name"
                className={cn(
                  'w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring',
                  errors?.address && 'border-destructive'
                )}
              />
              <ErrorMsg msg={errors?.address?.message} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AddressRegionFields
                control={control}
                errors={errors}
                setValue={setValue}
                countryCode={selectedCountry?.isoCode}
                stateField="state"
                cityField="city"
                stateLabel="State"
                cityLabel="City"
                required
                disabled={isCheckoutSubmitting}
              />

              <div>
                <label className="block text-sm font-medium text-foreground mb-1 md:mb-2">
                  PIN Code <span className="text-destructive">*</span>
                </label>
                <input
                  {...register('zipCode', {
                    required: `PIN Code is required!`,
                    onChange: e => {
                      handleZipCodeChange(e);
                    },
                  })}
                  name="zipCode"
                  id="zipCode"
                  type="text"
                  placeholder="Enter PIN code"
                  className={cn(
                    'w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring',
                    errors?.zipCode && 'border-destructive'
                  )}
                />
                <ErrorMsg msg={errors?.zipCode?.message} />
              </div>
            </div>

            <div>
              <label htmlFor="contactNo" className="block text-sm font-medium text-foreground mb-1 md:mb-2">
                Phone <span className="text-destructive">*</span>
              </label>
              <input
                {...register('contactNo', {
                  required: 'Phone number is required!',
                  validate: value =>
                    /^(?:\+?91|0)?[6-9]\d{9}$/.test(String(value || '').replace(/[\s-]/g, '')) ||
                    'Enter a valid 10-digit mobile number',
                })}
                name="contactNo"
                id="contactNo"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="10-digit mobile number"
                className={cn(
                  'w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring',
                  errors?.contactNo && 'border-destructive'
                )}
              />
              <ErrorMsg msg={errors?.contactNo?.message} />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1 md:mb-2">
                Email address <span className="text-destructive">*</span>
              </label>
              <input
                {...register('email', {
                  required: 'Email address is required!',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
                    message: 'Enter a valid email address',
                  },
                })}
                name="email"
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                defaultValue={user?.email}
                className={cn(
                  'w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring',
                  errors?.email && 'border-destructive'
                )}
              />
              <ErrorMsg msg={errors?.email?.message} />
            </div>

            <CheckoutShippingAddress
              register={register}
              errors={errors}
              setValue={setValue}
              control={control}
              countries={countries}
              defaultCountry={defaultCountry}
              isCheckoutSubmitting={isCheckoutSubmitting}
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-1 md:mb-2">
                Important Note
              </label>
              <textarea
                {...register('orderNote')}
                name="orderNote"
                id="orderNote"
                rows={4}
                placeholder="Add any important notes or special instructions for your order..."
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              <ErrorMsg msg={errors?.orderNote?.message} />
            </div>
          </div>
        </div>

        {/* Order Summary and Complete Purchase moved to right side - see checkout-order-area.jsx */}

        {/* Hidden payment and shipping inputs for form validation */}
        <div style={{ display: 'none' }}>
          <input
            {...checkoutRegister(`shippingOption`, {
              required: `Shipping Option is required!`,
            })}
            type="radio"
            name="shippingOption"
            value="calculated"
            defaultChecked
          />
          <input
            {...checkoutRegister(`payment`, {
              required: `Payment Option is required!`,
            })}
            type="radio"
            name="payment"
            value="Card"
            defaultChecked
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutBillingArea;
