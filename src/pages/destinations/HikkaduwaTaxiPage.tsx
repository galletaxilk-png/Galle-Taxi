/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TownTaxiTemplate } from './TownTaxiTemplate';
import { TOWNS_DATA } from './townData';
import { useApp } from '../../lib/store';
import { PageSeo } from '../../components/PageSeo';

export const HikkaduwaTaxiPage: React.FC = () => {
  const { taxiHubs } = useApp();
  const town = taxiHubs?.['hikkaduwa-taxi'] || TOWNS_DATA['hikkaduwa-taxi'];

  return (
    <>
      <PageSeo
        pathnameOverride="/hikkaduwa-taxi"
        title="Hikkaduwa Taxi Service | Private Airport & Coral Coast Rides"
        description="Book 24/7 Hikkaduwa taxi service and CMB airport transfers. E01 highway tolls included, AC fleet, dive gear luggage space & Galle Fort shuttles."
        keywords="hikkaduwa taxi service, hikkaduwa to colombo airport taxi, narigama beach taxi, hikkaduwa to galle taxi, cmb to hikkaduwa transfer, private driver hikkaduwa"
        image={town.heroImage || '/assets/aistudio/Sri_Lanka_Southern_Coast_Surf_Sunset_2549a27a.webp'}
        town={town}
        faqs={town.faqs}
      />
      <TownTaxiTemplate town={town} />
    </>
  );
};
