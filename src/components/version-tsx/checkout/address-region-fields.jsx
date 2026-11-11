'use client';

import { useEffect, useMemo, useState } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { IN_STATES, loadIndiaCities } from '@/lib/india-regions';
import { cn } from '@/lib/utils';
import ErrorMsg from '../../common/error-msg';

const INPUT_CLASS =
  'w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring';

const STATE_OPTIONS = IN_STATES.map(name => ({ value: name, label: name }));

/**
 * The State and City pair of an address, in that order: the city list depends
 * on the state, so the state has to be answered first.
 *
 * Both fields hold the plain name rather than an ISO code, because that is
 * what the order document stores and what Shadowfax expects in
 * `customer_details`. Picking from the list is the normal path, but the city
 * data is district-level and misses plenty of real towns, so a typed value is
 * always allowed. Outside India there is no list at all and both fields are
 * ordinary text inputs.
 */
const AddressRegionFields = ({
  control,
  errors,
  setValue,
  countryCode,
  stateField,
  cityField,
  stateLabel,
  cityLabel,
  required,
  disabled,
}) => {
  const isIndia = countryCode === 'IN';
  const stateValue = useWatch({ control, name: stateField });

  const [cityMap, setCityMap] = useState(null);
  const [cityLoadFailed, setCityLoadFailed] = useState(false);
  const [manualCity, setManualCity] = useState(false);

  // Deferred until a state is chosen: the file is 48KB and useless before
  // then, so it never competes with the rest of the checkout page load.
  useEffect(() => {
    if (!isIndia || !stateValue || cityMap) return undefined;

    let active = true;
    loadIndiaCities().then(
      map => {
        if (active) setCityMap(map);
      },
      () => {
        if (active) setCityLoadFailed(true);
      }
    );
    return () => {
      active = false;
    };
  }, [isIndia, stateValue, cityMap]);

  // A city only means something inside its state, so picking a new state
  // drops whatever was chosen before.
  const handleStateSelect = (value, onChange) => {
    onChange(value);
    setValue(cityField, '');
    setManualCity(false);
  };

  const cityOptions = useMemo(() => {
    const names = (isIndia && cityMap && stateValue && cityMap[stateValue]) || [];
    return names.map(name => ({ value: name, label: name }));
  }, [isIndia, cityMap, stateValue]);

  const cityListUnavailable =
    cityLoadFailed || (cityMap !== null && stateValue && cityOptions.length === 0);
  const cityAsText = !isIndia || manualCity || cityListUnavailable;

  return (
    <>
      <div>
        <label
          htmlFor={stateField}
          className="block text-sm font-medium text-foreground mb-1 md:mb-2"
        >
          {stateLabel} <span className="text-destructive">*</span>
        </label>
        <Controller
          name={stateField}
          control={control}
          rules={{ required: required ? `${stateLabel} is required!` : false }}
          render={({ field }) =>
            isIndia ? (
              <SearchableSelect
                options={STATE_OPTIONS}
                value={field.value || ''}
                onValueChange={value => handleStateSelect(value, field.onChange)}
                placeholder={`Select ${stateLabel}`}
                searchPlaceholder="Search states..."
                emptyMessage="No state found."
                disabled={disabled}
                error={!!errors?.[stateField]}
              />
            ) : (
              <input
                {...field}
                id={stateField}
                type="text"
                value={field.value || ''}
                disabled={disabled}
                placeholder="Enter state name"
                className={cn(INPUT_CLASS, errors?.[stateField] && 'border-destructive')}
              />
            )
          }
        />
        <ErrorMsg msg={errors?.[stateField]?.message} />
      </div>

      <div>
        <label
          htmlFor={cityField}
          className="block text-sm font-medium text-foreground mb-1 md:mb-2"
        >
          {cityLabel} <span className="text-destructive">*</span>
        </label>
        <Controller
          name={cityField}
          control={control}
          rules={{ required: required ? `${cityLabel} is required!` : false }}
          render={({ field }) =>
            cityAsText ? (
              <input
                {...field}
                id={cityField}
                type="text"
                value={field.value || ''}
                disabled={disabled}
                placeholder="Enter city name"
                className={cn(INPUT_CLASS, errors?.[cityField] && 'border-destructive')}
              />
            ) : (
              <SearchableSelect
                options={cityOptions}
                value={field.value || ''}
                onValueChange={field.onChange}
                placeholder={
                  stateValue
                    ? cityMap
                      ? `Select ${cityLabel}`
                      : 'Loading cities...'
                    : `Select ${stateLabel} first`
                }
                searchPlaceholder="Search cities..."
                emptyMessage="No city found."
                disabled={disabled || !stateValue || !cityMap}
                error={!!errors?.[cityField]}
                showManualEntry
                onManualEntry={() => setManualCity(true)}
                manualEntryLabel="Enter city manually"
              />
            )
          }
        />
        {/* The list is district-level, so the way out of it has to be visible
            without having to search for a city and come up empty first. */}
        {isIndia && !cityListUnavailable && (
          <button
            type="button"
            onClick={() => {
              setManualCity(!manualCity);
              setValue(cityField, '');
            }}
            className="mt-1 text-xs text-muted-foreground underline hover:text-foreground"
          >
            {manualCity ? 'Choose from list' : 'City not listed? Type it'}
          </button>
        )}
        <ErrorMsg msg={errors?.[cityField]?.message} />
      </div>
    </>
  );
};

export default AddressRegionFields;
