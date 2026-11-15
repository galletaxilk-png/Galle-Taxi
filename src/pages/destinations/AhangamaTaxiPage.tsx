/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TownTaxiTemplate } from './TownTaxiTemplate';
import { TOWNS_DATA } from './townData';
import { useApp } from '../../lib/store';
import { PageSeo } from '../../components/PageSeo';

export const AhangamaTaxiPage: React.FC = () => {
  const { taxiHubs } = useApp();
  const town = taxiHubs?.['ahangama-taxi'] || TOWNS_DATA['ahangama-taxi'];

  return (
    <>
      <PageSeo
        pathnameOverride="/ahangama-taxi"
        title="Ahangama Taxi Service | Private Airport & Surf Transfers"
        description="Book 24/7 Ahangama & Kabalana taxi service and CMB airport transfers. Surfboard-friendly AC vehicles, E01 expressway tolls included & fixed rates."
        keywords="ahangama taxi service, ahangama to colombo airport taxi, kabalana surf taxi, ahangama taxi sri lanka, ahangama to galle taxi, ahangama to weligama transfer"
        image={town.heroImage || '/assets/aistudio/Sri_Lanka_Southern_Coast_Surf_Sunset_2549a27a.webp'}
        town={town}
        faqs={town.faqs}
      />
      <TownTaxiTemplate town={town} />
    </>
  );
};
