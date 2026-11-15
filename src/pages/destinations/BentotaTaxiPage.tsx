/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TownTaxiTemplate } from './TownTaxiTemplate';
import { TOWNS_DATA } from './townData';
import { useApp } from '../../lib/store';
import { PageSeo } from '../../components/PageSeo';

export const BentotaTaxiPage: React.FC = () => {
  const { taxiHubs } = useApp();
  const town = taxiHubs?.['bentota-taxi'] || TOWNS_DATA['bentota-taxi'];

  return (
    <>
      <PageSeo
        pathnameOverride="/bentota-taxi"
        title="Bentota Taxi Service | Luxury Resort & CMB Airport Transfers"
        description="Book 24/7 Bentota & Beruwala taxi service with direct CMB airport highway transfers. Fixed rates, 5-star resort pickups & Madu River excursion cabs."
        keywords="bentota taxi service, bentota to colombo airport taxi, beruwala taxi, bentota luxury resort transfers, cmb to bentota transfer, private driver bentota"
        image={town.heroImage || '/assets/aistudio/Sri_Lanka_Southern_Coast_Surf_Sunset_2549a27a.webp'}
        town={town}
        faqs={town.faqs}
      />
      <TownTaxiTemplate town={town} />
    </>
  );
};
