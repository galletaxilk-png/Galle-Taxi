/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TownTaxiTemplate } from './TownTaxiTemplate';
import { TOWNS_DATA } from './townData';
import { useApp } from '../../lib/store';

export const WeligamaTaxiPage: React.FC = () => {
  const { taxiHubs } = useApp();
  const town = taxiHubs?.['weligama-taxi'] || TOWNS_DATA['weligama-taxi'];

  return <TownTaxiTemplate town={town} />;
};
