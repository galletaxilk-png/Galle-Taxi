import React, { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../lib/store';
import { DayTourProduct } from '../lib/toursData';
import { TownTaxiConfig } from '../pages/destinations/townData';
import { FaqEntry, RouteSeoEntry, resolveRouteSeo } from '../lib/seoConfig';

interface PageSeoProps {
  pathnameOverride?: string;
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  schemaType?: RouteSeoEntry['schemaType'];
  serviceType?: string;
  areaServed?: string[];
  town?: TownTaxiConfig;
  tour?: DayTourProduct;
  faqs?: FaqEntry[];
}

function upsertMeta(attrName: 'name' | 'property', key: string, content: string) {
  const matches = Array.from(document.head.querySelectorAll(`meta[${attrName}="${key}"]`));
  let el = matches[0] as HTMLMetaElement | undefined;
  // Deduplicate any stale meta tags so document.querySelector always reads the active page value
  for (let i = 1; i < matches.length; i++) {
    matches[i].remove();
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  const links = Array.from(document.head.querySelectorAll('link[rel="canonical"]'));
  let link = links[0] as HTMLLinkElement | undefined;
  for (let i = 1; i < links.length; i++) {
    links[i].remove();
  }
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function upsertJsonLd(schema: Record<string, unknown>) {
  document
    .querySelectorAll('script[type="application/ld+json"]')
    .forEach((node) => {
      if (node.id !== 'page-seo-schema') {
        node.remove();
      }
    });

  let script = document.getElementById('page-seo-schema') as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = 'page-seo-schema';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schema);
}

export const PageSeo: React.FC<PageSeoProps> = ({
  pathnameOverride,
  title,
  description,
  keywords,
  image,
  schemaType,
  serviceType,
  areaServed,
  town,
  tour,
  faqs,
}) => {
  const { pathname } = useLocation();
  const { siteSettings, taxiHubs, tours } = useApp();

  useLayoutEffect(() => {
    const targetPath = pathnameOverride || pathname || '/';
    const origin =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'https://galletaxi.lk';

    const townsMap = town
      ? { ...(taxiHubs || {}), [town.slug]: town }
      : taxiHubs;

    const toursList = tour
      ? [tour, ...(tours || []).filter((t) => t.id !== tour.id && t.slug !== tour.slug)]
      : tours;

    const seo = resolveRouteSeo(targetPath, {
      origin,
      siteSettings,
      townsMap,
      toursList,
      customTitle: title,
      customDescription: description,
      customKeywords: keywords,
      customImage: image,
      customSchemaType: schemaType,
      customServiceType: serviceType,
      customAreaServed: areaServed,
      extraFaqs: faqs,
    });

    document.title = seo.title;

    upsertMeta('name', 'description', seo.description);
    upsertMeta('name', 'keywords', seo.keywords);

    upsertMeta('property', 'og:type', seo.ogType);
    upsertMeta('property', 'og:site_name', seo.siteName);
    upsertMeta('property', 'og:title', seo.title);
    upsertMeta('property', 'og:description', seo.description);
    upsertMeta('property', 'og:url', seo.canonicalUrl);
    upsertMeta('property', 'og:image', seo.ogImage);

    upsertMeta('name', 'twitter:card', seo.twitterCard);
    upsertMeta('name', 'twitter:title', seo.title);
    upsertMeta('name', 'twitter:description', seo.description);
    upsertMeta('name', 'twitter:image', seo.ogImage);

    upsertCanonical(seo.canonicalUrl);
    upsertJsonLd(seo.schema);
  }, [
    pathnameOverride,
    pathname,
    title,
    description,
    keywords,
    image,
    schemaType,
    serviceType,
    areaServed,
    town,
    tour,
    faqs,
    siteSettings,
    taxiHubs,
    tours,
  ]);

  return null;
};
