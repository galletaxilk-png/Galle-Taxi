/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { TownTaxiTemplate } from './TownTaxiTemplate';
import { TOWNS_DATA } from './townData';
import { useApp } from '../../lib/store';

export const UnawatunaTaxiPage: React.FC = () => {
  const { taxiHubs, siteSettings } = useApp();
  const town = taxiHubs?.['unawatuna-taxi'] || TOWNS_DATA['unawatuna-taxi'];

  // SEO Meta Title, Meta Description, Social Cards & Schema.org Structured Data
  useEffect(() => {
    const prevTitle = document.title;
    const pageTitle =
      town.pageTitle || 'Unawatuna Taxi Service | Private Airport & Beach Shuttles';
    const pageDescription =
      'Book reliable 24/7 Unawatuna taxi service & CMB airport transfers. Fast 10-min pickups, E01 expressway tolls included, private AC fleet & Galle Fort shuttles.';
    const pageKeywords =
      'unawatuna taxi service, unawatuna to colombo airport taxi, unawatuna to galle fort taxi, taxi unawatuna sri lanka, dalawella beach taxi, jungle beach shuttle, private driver unawatuna';
    const canonicalUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/unawatuna-taxi`
        : 'https://galletaxi.lk/unawatuna-taxi';
    const heroImgUrl = town.heroImage || '/assets/aistudio/Sunset_Beach_Road_Trip_with_Surfboard_19548307.webp';
    const ogImage =
      typeof window !== 'undefined' && heroImgUrl.startsWith('/')
        ? `${window.location.origin}${heroImgUrl}`
        : heroImgUrl;

    // 1. Update Title
    document.title = pageTitle;

    // 2. Helper to safely update or insert meta tags with cleanup
    const metaCleanups: (() => void)[] = [];
    const setMetaTag = (attributeName: 'name' | 'property', key: string, content: string) => {
      let metaEl = document.querySelector(`meta[${attributeName}="${key}"]`);
      const created = !metaEl;
      const prevContent = metaEl?.getAttribute('content') ?? null;

      if (!metaEl) {
        metaEl = document.createElement('meta');
        metaEl.setAttribute(attributeName, key);
        document.head.appendChild(metaEl);
      }
      metaEl.setAttribute('content', content);

      metaCleanups.push(() => {
        if (created) {
          metaEl?.remove();
        } else if (prevContent !== null) {
          metaEl?.setAttribute('content', prevContent);
        }
      });
    };

    // Standard SEO Tags
    setMetaTag('name', 'description', pageDescription);
    setMetaTag('name', 'keywords', pageKeywords);

    // OpenGraph Tags
    setMetaTag('property', 'og:title', pageTitle);
    setMetaTag('property', 'og:description', pageDescription);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:site_name', siteSettings.businessName || 'Galle Taxi');

    // Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', pageTitle);
    setMetaTag('name', 'twitter:description', pageDescription);
    setMetaTag('name', 'twitter:image', ogImage);

    // Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    const createdCanonical = !canonicalLink;
    const prevCanonicalHref = canonicalLink?.getAttribute('href') ?? null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Schema.org Structured Data (TaxiService & FAQPage)
    const schemaScriptId = 'unawatuna-taxi-seo-schema';
    let schemaScript = document.getElementById(schemaScriptId) as HTMLScriptElement | null;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = schemaScriptId;
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'TaxiService',
          '@id': `${canonicalUrl}#taxiservice`,
          name: 'Unawatuna Taxi Service - Galle Taxi',
          serviceType: 'Private Beach Resort Taxi and Airport Transfer Service',
          description: pageDescription,
          url: canonicalUrl,
          telephone: siteSettings.phone || '+94771234567',
          priceRange: '$$',
          currenciesAccepted: 'LKR, USD, EUR, GBP',
          paymentAccepted: 'Cash, Credit Card, Bank Transfer',
          openingHoursSpecification: [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday',
              ],
              opens: '00:00',
              closes: '23:59',
            },
          ],
          areaServed: [
            { '@type': 'AdministrativeArea', name: 'Unawatuna' },
            { '@type': 'AdministrativeArea', name: 'Galle Fort' },
            { '@type': 'AdministrativeArea', name: 'Dalawella' },
            { '@type': 'AdministrativeArea', name: 'Jungle Beach' },
            { '@type': 'AdministrativeArea', name: 'Rumassala' },
            { '@type': 'AdministrativeArea', name: 'Thalpe' },
            { '@type': 'AdministrativeArea', name: 'Ahangama' },
            { '@type': 'AdministrativeArea', name: 'Mirissa' },
            { '@type': 'AdministrativeArea', name: 'Colombo Airport (CMB)' },
          ],
          provider: {
            '@type': 'LocalBusiness',
            name: siteSettings.businessName || 'Galle Taxi',
            image: ogImage,
            telephone: siteSettings.phone || '+94771234567',
            address: {
              '@type': 'PostalAddress',
              streetAddress: siteSettings.address || 'Rampart Street, Galle Dutch Fort',
              addressLocality: 'Galle',
              postalCode: '80000',
              addressCountry: 'LK',
            },
          },
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Unawatuna Popular Taxi & Transfer Routes',
            itemListElement: (town.popularRoutes || []).map((route) => ({
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: `${route.from} to ${route.to} Taxi`,
                description: `${route.duration} (${route.distanceKm} km). ${route.highlight}`,
              },
            })),
          },
        },
        {
          '@type': 'FAQPage',
          '@id': `${canonicalUrl}#faq`,
          mainEntity: (town.faqs || []).map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        },
      ],
    };

    schemaScript.textContent = JSON.stringify(structuredData);

    return () => {
      document.title = prevTitle;
      metaCleanups.forEach((cleanup) => cleanup());
      if (createdCanonical) {
        canonicalLink?.remove();
      } else if (prevCanonicalHref !== null) {
        canonicalLink?.setAttribute('href', prevCanonicalHref);
      }
      const existingScript = document.getElementById(schemaScriptId);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [
    town.pageTitle,
    town.heroImage,
    town.popularRoutes,
    town.faqs,
    siteSettings.businessName,
    siteSettings.phone,
    siteSettings.address,
  ]);

  return <TownTaxiTemplate town={town} />;
};

