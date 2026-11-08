/**
 * Automated Tests for Galle Taxi Authoritative Fare Engine
 */

import { calculateAuthoritativeFare, formatLKR } from './fareEngine';
import { INITIAL_FARE_RULES, INITIAL_VEHICLES } from './initialData';

export function runFareEngineTests(): { passed: number; failed: number; results: string[] } {
  const results: string[] = [];
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      results.push(`PASS: ${testName}`);
    } else {
      failed++;
      results.push(`FAIL: ${testName}`);
      console.error(`Assertion failed: ${testName}`);
    }
  }

  // Test 1: Fixed Route Colombo Airport to Galle (Sedan)
  const cmbToGalle = calculateAuthoritativeFare({
    pickup: 'Colombo Airport',
    destination: 'Galle Fort',
    vehicleCategoryId: 'veh-sedan-std',
    pickupTime: '14:00',
    vehicles: INITIAL_VEHICLES,
    fareRules: INITIAL_FARE_RULES,
  });
  assert(cmbToGalle.isFixedRoute === true, 'Matches fixed route for Colombo Airport to Galle Fort');
  assert(cmbToGalle.fare === 26000, `Fixed route fare for Sedan should be 26,000 LKR (got ${cmbToGalle.fare})`);

  // Test 2: Fixed Route Colombo Airport to Galle (VIP Van)
  const cmbToGalleVan = calculateAuthoritativeFare({
    pickup: 'Colombo Bandaranaike Airport (CMB)',
    destination: 'Galle',
    vehicleCategoryId: 'veh-van-vip',
    pickupTime: '10:00',
    vehicles: INITIAL_VEHICLES,
    fareRules: INITIAL_FARE_RULES,
  });
  assert(cmbToGalleVan.fare === 34000, `VIP Van Airport route should be 34,000 LKR (got ${cmbToGalleVan.fare})`);

  // Test 3: Night Surcharge Test (Between 23:00 and 05:00)
  const nightTrip = calculateAuthoritativeFare({
    pickup: 'Galle Fort',
    destination: 'Unawatuna Beach',
    vehicleCategoryId: 'veh-sedan-std',
    pickupTime: '02:30', // Night time
    vehicles: INITIAL_VEHICLES,
    fareRules: INITIAL_FARE_RULES,
  });
  assert(nightTrip.breakdown.nightSurcharge > 0, 'Applies 15% night surcharge for pickups at 02:30');

  // Test 4: Format LKR currency
  const formatted = formatLKR(26000);
  assert(formatted.includes('26,000'), `Formats LKR properly with commas (got ${formatted})`);

  // Test 5: Minimum Fare Guard
  const microTrip = calculateAuthoritativeFare({
    pickup: 'Rampart St',
    destination: 'Church St',
    vehicleCategoryId: 'veh-sedan-std',
    pickupTime: '12:00',
    vehicles: INITIAL_VEHICLES,
    fareRules: INITIAL_FARE_RULES,
  });
  assert(microTrip.fare >= INITIAL_FARE_RULES.minimumFare, 'Respects minimum trip fare');

  // Test 6: Scenario 1 - Negombo Bus Terminal → Galle Public Bus Station
  const negomboToGalle = calculateAuthoritativeFare({
    pickup: 'Negombo Bus Terminal',
    destination: 'Galle Public Bus Station',
    vehicleCategoryId: 'veh-sedan-std',
    pickupTime: '14:00',
    vehicles: INITIAL_VEHICLES,
    fareRules: INITIAL_FARE_RULES,
  });
  assert(negomboToGalle.distanceKm > 150, `Negombo to Galle distance should be > 150 km (got ${negomboToGalle.distanceKm} km)`);
  assert(negomboToGalle.fare > 35000, `Negombo to Galle Sedan fare should reflect long-distance per-km pricing (got ${negomboToGalle.fare} LKR)`);
  assert(negomboToGalle.isFixedRoute === false, 'Negombo to Galle is dynamically calculated, not a static fixed airport route');

  // Test 7: Scenario 2 - Galle → Anuradhapura
  const galleToAnuradhapura = calculateAuthoritativeFare({
    pickup: 'Galle',
    destination: 'anuradhapura',
    vehicleCategoryId: 'veh-sedan-std',
    pickupTime: '14:00',
    vehicles: INITIAL_VEHICLES,
    fareRules: INITIAL_FARE_RULES,
  });
  assert(galleToAnuradhapura.distanceKm > 280, `Galle to Anuradhapura distance should be > 280 km (got ${galleToAnuradhapura.distanceKm} km)`);
  assert(galleToAnuradhapura.fare > 60000, `Galle to Anuradhapura Sedan fare should exceed 60,000 LKR (got ${galleToAnuradhapura.fare} LKR)`);

  // Test 8: Scenario 3 - Sigiriya → Galle
  const sigiriyaToGalle = calculateAuthoritativeFare({
    pickup: 'Sigiriya',
    destination: 'Galle',
    vehicleCategoryId: 'veh-sedan-std',
    pickupTime: '14:00',
    vehicles: INITIAL_VEHICLES,
    fareRules: INITIAL_FARE_RULES,
  });
  assert(sigiriyaToGalle.distanceKm > 240, `Sigiriya to Galle distance should be > 240 km (got ${sigiriyaToGalle.distanceKm} km)`);
  assert(sigiriyaToGalle.fare > 55000, `Sigiriya to Galle Sedan fare should exceed 55,000 LKR (got ${sigiriyaToGalle.fare} LKR)`);

  // Test 9: Scenario 4 & 5 - Changing Pickup / Destination updates distance & fare
  const shortTrip = calculateAuthoritativeFare({
    pickup: 'Galle Fort',
    destination: 'Mirissa',
    vehicleCategoryId: 'veh-sedan-std',
    pickupTime: '14:00',
    vehicles: INITIAL_VEHICLES,
    fareRules: INITIAL_FARE_RULES,
  });
  assert(shortTrip.distanceKm < 50, `Short trip should be under 50 km (got ${shortTrip.distanceKm} km)`);
  assert(shortTrip.fare < negomboToGalle.fare, 'Changing route from Negombo to Mirissa properly recalculates and lowers the fare');

  // Test 10: Scenario 6 - Switching between different vehicles
  const miniCarFare = calculateAuthoritativeFare({
    pickup: 'Negombo Bus Terminal',
    destination: 'Galle Public Bus Station',
    vehicleCategoryId: 'veh-mini-car',
    pickupTime: '14:00',
    vehicles: INITIAL_VEHICLES,
    fareRules: INITIAL_FARE_RULES,
  });
  const suvFare = calculateAuthoritativeFare({
    pickup: 'Negombo Bus Terminal',
    destination: 'Galle Public Bus Station',
    vehicleCategoryId: 'veh-suv-4wd',
    pickupTime: '14:00',
    vehicles: INITIAL_VEHICLES,
    fareRules: INITIAL_FARE_RULES,
  });
  assert(miniCarFare.fare < negomboToGalle.fare, `Budget Mini Car (${miniCarFare.fare}) should cost less than Sedan (${negomboToGalle.fare})`);
  assert(suvFare.fare > negomboToGalle.fare, `SUV (${suvFare.fare}) should cost more than Sedan (${negomboToGalle.fare})`);

  return { passed, failed, results };
}
