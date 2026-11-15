/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TownTaxiTemplate } from './TownTaxiTemplate';
import { TOWNS_DATA } from './townData';
import { useApp } from '../../lib/store';
import { PageSeo } from '../../components/PageSeo';

export const MirissaTaxiPage: React.FC = () => {
  const { taxiHubs } = useApp();
  const town = taxiHubs?.['mirissa-taxi'] || TOWNS_DATA['mirissa-taxi'];

  return (
    <>
      <PageSeo
        pathnameOverride="/mirissa-taxi"
        title="Mirissa Taxi Service | Private Airport & South Coast Rides"
        description="Book 24/7 Mirissa taxi service and Colombo Airport (CMB) transfers. Fixed rates, E01 highway tolls included, whale watching shuttles & Ella/Yala trips."
        keywords="mirissa taxi service, mirissa to colombo airport taxi, mirissa to ella taxi, mirissa to yala transfer, whale watching shuttle mirissa, cmb to mirissa taxi"
        image={town.heroImage || '/assets/aistudio/Sri_Lanka_Southern_Coast_Surf_Sunset_2549a27a.webp'}
        town={town}
        faqs={town.faqs}
      />
      <TownTaxiTemplate town={town} />
    </>
  );
};
