/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TownTaxiTemplate } from './TownTaxiTemplate';
import { TOWNS_DATA } from './townData';
import { useApp } from '../../lib/store';

export const AhangamaTaxiPage: React.FC = () => {
  const { taxiHubs } = useApp();
  const town = taxiHubs?.['ahangama-taxi'] || TOWNS_DATA['ahangama-taxi'];

  return <TownTaxiTemplate town={town} />;
};
