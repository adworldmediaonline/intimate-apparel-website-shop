/**
 * Indian states and their cities, for the checkout address fields.
 *
 * The state list is inline because it is under a kilobyte. The city list is
 * not: all 4,242 of them are 48KB, so they live in `public/data/in-cities.json`
 * and are fetched once, on demand, rather than shipped in the checkout bundle.
 * Regenerate that file from the `country-state-city` package with:
 *
 *   node -e "const {State,City}=require('country-state-city');const out={};\
 *   for(const s of State.getStatesOfCountry('IN'))out[s.name]=[...new Set(\
 *   City.getCitiesOfState('IN',s.isoCode).map(c=>c.name.trim()))].sort((a,b)=>\
 *   a.localeCompare(b));require('fs').writeFileSync(\
 *   'public/data/in-cities.json',JSON.stringify(out))"
 *
 * The data is district-level, so plenty of real delivery addresses name a town
 * that is not in it. Every field built on this must keep a way to type a value
 * by hand.
 */

export const IN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const;

type CityMap = Record<string, string[]>;

// Shared across the billing and shipping blocks, which both mount on the
// checkout page. A failed request clears the cache so the next state
// selection retries instead of leaving the dropdown permanently empty.
let cityRequest: Promise<CityMap> | null = null;

export function loadIndiaCities(): Promise<CityMap> {
  if (!cityRequest) {
    cityRequest = fetch('/data/in-cities.json')
      .then(res => {
        if (!res.ok) throw new Error(`city list: HTTP ${res.status}`);
        return res.json() as Promise<CityMap>;
      })
      .catch(error => {
        cityRequest = null;
        throw error;
      });
  }
  return cityRequest;
}
