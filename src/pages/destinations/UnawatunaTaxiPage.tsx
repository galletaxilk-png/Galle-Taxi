/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TownTaxiTemplate } from './TownTaxiTemplate';
import { TOWNS_DATA } from './townData';
import { useApp } from '../../lib/store';
import { PageSeo } from '../../components/PageSeo';

export const UnawatunaTaxiPage: React.FC = () => {
  const { taxiHubs } = useApp();
  const town = taxiHubs?.['unawatuna-taxi'] || TOWNS_DATA['unawatuna-taxi'];

  return (
    <>
      <PageSeo
        pathnameOverride="/unawatuna-taxi"
        title="Unawatuna Taxi Service | Private Airport & Beach Shuttles"
        description="Book 24/7 Unawatuna taxi service and CMB airport transfers. 10-minute villa pickups, E01 highway tolls included & instant Galle Fort rides."
        keywords="unawatuna taxi service, unawatuna to colombo airport taxi, unawatuna to galle fort taxi, dalawella beach taxi, jungle beach shuttle, private driver unawatuna"
        image={town.heroImage || '/assets/aistudio/Sri_Lanka_Southern_Coast_Surf_Sunset_2549a27a.webp'}
        town={town}
        faqs={town.faqs}
      />
      <TownTaxiTemplate town={town} />
    </>
  );
};
