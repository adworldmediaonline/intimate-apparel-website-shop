// Table-test the tracking step for every state an order passes through.
import assert from 'node:assert/strict';
const STEPS = ['Order Placed', 'Dispatched', 'In Transit', 'Out for Delivery', 'Delivered'];

function currentStep(order) {
  const courier = (order.courierStatus ?? '').toLowerCase();
  const own = (order.status ?? '').toLowerCase();
  if (/out for delivery/.test(courier)) return 3;
  if (order.deliveredDate || own === 'delivered' || /deliver/.test(courier)) return 4;
  if (/transit|in.?scan|bag/.test(courier)) return 2;
  if (/picked|pickup completed|dispatch|manifest|out.?scan/.test(courier)) return 1;
  if (own === 'shipped') return 1;
  return 0;
}

const cases = [
  ['just placed',            { status: 'pending',        courierStatus: '' },                      0],
  ['being packed',           { status: 'processing',     courierStatus: '' },                      0],
  ['label bought, on shelf', { status: 'pending_pickup', courierStatus: 'New', shippedDate: 'x' },  0],
  ['awb assigned, on shelf', { status: 'pending_pickup', courierStatus: 'AWB Assigned' },           0],
  ['courier collected it',   { status: 'pending_pickup', courierStatus: 'Pickup Completed' },       1],
  ['marked shipped by hand', { status: 'shipped',        courierStatus: '' },                       1],
  ['moving',                 { status: 'shipped',        courierStatus: 'In Transit' },             2],
  ['last mile',              { status: 'shipped',        courierStatus: 'Out For Delivery' },       3],
  ['delivered by courier',   { status: 'shipped',        courierStatus: 'Delivered' },              4],
  ['marked delivered',       { status: 'delivered',      courierStatus: 'New' },                    4],
];

let bad = 0;
for (const [label, order, want] of cases) {
  const got = currentStep(order);
  const ok = got === want;
  if (!ok) bad += 1;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label.padEnd(24)} ${String(order.status).padEnd(16)} ${String(order.courierStatus || '-').padEnd(18)} -> ${STEPS[got]}`);
}
assert.equal(bad, 0, `${bad} case(s) wrong`);
console.log('\nall states map to the right step');
