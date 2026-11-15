/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TownTaxiTemplate } from './TownTaxiTemplate';
import { TOWNS_DATA } from './townData';
import { useApp } from '../../lib/store';

export const HikkaduwaTaxiPage: React.FC = () => {
  const { taxiHubs } = useApp();
  const town = taxiHubs?.['hikkaduwa-taxi'] || TOWNS_DATA['hikkaduwa-taxi'];

  return <TownTaxiTemplate town={town} />;
};
