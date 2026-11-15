/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TownTaxiTemplate } from './TownTaxiTemplate';
import { TOWNS_DATA } from './townData';
import { useApp } from '../../lib/store';

export const UnawatunaTaxiPage: React.FC = () => {
  const { taxiHubs } = useApp();
  const town = taxiHubs?.['unawatuna-taxi'] || TOWNS_DATA['unawatuna-taxi'];

  return <TownTaxiTemplate town={town} />;
};
