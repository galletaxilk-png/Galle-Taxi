/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TownTaxiTemplate } from './TownTaxiTemplate';
import { TOWNS_DATA } from './townData';
import { useApp } from '../../lib/store';
import { PageSeo } from '../../components/PageSeo';

export const WeligamaTaxiPage: React.FC = () => {
  const { taxiHubs } = useApp();
  const town = taxiHubs?.['weligama-taxi'] || TOWNS_DATA['weligama-taxi'];

  return (
    <>
      <PageSeo
        pathnameOverride="/weligama-taxi"
        title="Weligama Taxi Service | Surf Transfers & CMB Airport Rides"
        description="Book 24/7 Weligama taxi service & CMB airport transfers. Fast 2h 10m highway ride, E01 tolls included, surfboard-friendly vans & resort pickups."
        keywords="weligama taxi service, weligama to colombo airport taxi, weligama bay taxi, weligama marriott taxi, midigama taxi, cmb to weligama transfer"
        image={town.heroImage || '/assets/aistudio/Sri_Lanka_Southern_Coast_Surf_Sunset_2549a27a.webp'}
        town={town}
        faqs={town.faqs}
      />
      <TownTaxiTemplate town={town} />
    </>
  );
};
