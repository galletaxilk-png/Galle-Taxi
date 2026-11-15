/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TownTaxiTemplate } from './TownTaxiTemplate';
import { TOWNS_DATA } from './townData';
import { useApp } from '../../lib/store';

export const BentotaTaxiPage: React.FC = () => {
  const { taxiHubs } = useApp();
  const town = taxiHubs?.['bentota-taxi'] || TOWNS_DATA['bentota-taxi'];

  return <TownTaxiTemplate town={town} />;
};
