import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../lib/store';
import { DayTourProduct } from '../lib/toursData';
import { TownTaxiConfig } from '../pages/destinations/townData';
import { FaqEntry, resolveRouteSeo } from '../lib/seoConfig';

interface PageSeoProps {
  pathnameOverride?: string;
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  town?: TownTaxiConfig;
  tour?: DayTourProduct;
  faqs?: FaqEntry[];
}

function upsertMeta(attrName: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(`meta[${attrName}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function upsertJsonLd(schema: Record<string, unknown>) {
  // Remove any legacy duplicate per-page script tags so only one authoritative JSON-LD block exists
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
  town,
  tour,
  faqs,
}) => {
  const { pathname } = useLocation();
  const { siteSettings, taxiHubs, tours } = useApp();

  useEffect(() => {
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
    town,
    tour,
    faqs,
    siteSettings,
    taxiHubs,
    tours,
  ]);

  return null;
};
