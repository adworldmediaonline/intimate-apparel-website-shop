'use client';

import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { COMMERCE_COUNTRY } from '@/lib/brand';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { cn } from '@/lib/utils';
import ErrorMsg from '../../common/error-msg';
import AddressRegionFields from './address-region-fields';

const CheckoutShippingAddress = ({
  register,
  errors,
  setValue,
  control,
  countries,
  defaultCountry,
  isCheckoutSubmitting,
}) => {
  const [selectedShippingCountry, setSelectedShippingCountry] = useState(
    defaultCountry || null
  );
  const [sameAsBillingAddress, setSameAsBillingAddress] = useState(true);

  const handleShippingCountryChange = e => {
    if (isCheckoutSubmitting) return;

    const countryCode = e.target.value;
    if (!countryCode) return;

    const country = countries.find(c => c.isoCode === countryCode);

    setSelectedShippingCountry(country);
    setValue('shippingCountry', countryCode);
    // A state and city only belong to the country they were picked under.
    setValue('shippingState', '');
    setValue('shippingCity', '');
  };

  const handleSameAsBillingAddressChange = e => {
    const isChecked = e.target.checked;
    setSameAsBillingAddress(isChecked);
    setValue('sameAsBillingAddress', isChecked);
  };

  return (
    <div className="rounded-xl border border-border bg-background p-4 shadow-sm md:p-5">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">
              Shipping Address
            </h3>
            <p className="text-sm text-muted-foreground">
              Choose where your order should be delivered.
            </p>
          </div>
          <label
            htmlFor="sameAsBillingAddress"
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <input
              {...register('sameAsBillingAddress', {
                onChange: handleSameAsBillingAddressChange,
              })}
              id="sameAsBillingAddress"
              name="sameAsBillingAddress"
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
              aria-describedby="sameAsBillingAddressHelp"
            />
            <span>Same as Billing Address</span>
          </label>
        </div>

        <p id="sameAsBillingAddressHelp" className="text-sm text-muted-foreground">
          {sameAsBillingAddress
            ? 'We will use your billing address as the shipping address.'
            : 'Enter the recipient and delivery address below.'}
        </p>

        {!sameAsBillingAddress && (
          <div className="space-y-4 rounded-xl bg-muted/40 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Recipient First Name <span className="text-destructive">*</span>
                </label>
                <input
                  {...register('shippingFirstName', {
                    required: !sameAsBillingAddress
                      ? 'Recipient first name is required!'
                      : false,
                  })}
                  name="shippingFirstName"
                  id="shippingFirstName"
                  type="text"
                  placeholder="First Name"
                  className={cn(
                    'w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring',
                    errors?.shippingFirstName && 'border-destructive'
                  )}
                />
                <ErrorMsg msg={errors?.shippingFirstName?.message} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Recipient Last Name <span className="text-destructive">*</span>
                </label>
                <input
                  {...register('shippingLastName', {
                    required: !sameAsBillingAddress
                      ? 'Recipient last name is required!'
                      : false,
                  })}
                  name="shippingLastName"
                  id="shippingLastName"
                  type="text"
                  placeholder="Last Name"
                  className={cn(
                    'w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring',
                    errors?.shippingLastName && 'border-destructive'
                  )}
                />
                <ErrorMsg msg={errors?.shippingLastName?.message} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Shipping Country <span className="text-destructive">*</span>
              </label>
              <Controller
                name="shippingCountry"
                control={control}
                rules={{
                  required: !sameAsBillingAddress
                    ? 'Shipping country is required!'
                    : false,
                }}
                render={({ field }) => {
                  const countryOptions = countries.map(country => ({
                    value: country.isoCode,
                    label: country.name,
                  }));

                  return (
                    <SearchableSelect
                      options={countryOptions}
                      value={
                        field.value || selectedShippingCountry?.isoCode || COMMERCE_COUNTRY
                      }
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleShippingCountryChange({
                          target: { value },
                        });
                      }}
                      placeholder="Select Shipping Country"
                      searchPlaceholder="Search countries..."
                      emptyMessage="No country found."
                      error={!!errors?.shippingCountry}
                    />
                  );
                }}
              />
              <ErrorMsg msg={errors?.shippingCountry?.message} />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Shipping Street Address <span className="text-destructive">*</span>
              </label>
              <input
                {...register('shippingAddress', {
                  required: !sameAsBillingAddress
                    ? 'Shipping address is required!'
                    : false,
                })}
                name="shippingAddress"
                id="shippingAddress"
                type="text"
                placeholder="House number and street name"
                className={cn(
                  'w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring',
                  errors?.shippingAddress && 'border-destructive'
                )}
              />
              <ErrorMsg msg={errors?.shippingAddress?.message} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AddressRegionFields
                control={control}
                errors={errors}
                setValue={setValue}
                countryCode={selectedShippingCountry?.isoCode}
                stateField="shippingState"
                cityField="shippingCity"
                stateLabel="Shipping State"
                cityLabel="Shipping City"
                required={!sameAsBillingAddress}
                disabled={isCheckoutSubmitting}
              />

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Shipping PIN Code <span className="text-destructive">*</span>
                </label>
                <input
                  {...register('shippingZipCode', {
                    required: !sameAsBillingAddress
                      ? 'Shipping PIN code is required!'
                      : false,
                  })}
                  name="shippingZipCode"
                  id="shippingZipCode"
                  type="text"
                  placeholder="Enter PIN code"
                  className={cn(
                    'w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring',
                    errors?.shippingZipCode && 'border-destructive'
                  )}
                />
                <ErrorMsg msg={errors?.shippingZipCode?.message} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Shipping Phone <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                {...register('shippingContactNo')}
                name="shippingContactNo"
                id="shippingContactNo"
                type="text"
                placeholder="Phone"
                className={cn(
                  'w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring',
                  errors?.shippingContactNo && 'border-destructive'
                )}
              />
              <ErrorMsg msg={errors?.shippingContactNo?.message} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutShippingAddress;
