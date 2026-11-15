/**
 * Centralized Route SEO Metadata, Open Graph, Twitter Card & Schema.org Generator
 * Shared between the React SPA client (<PageSeo />) and Express SSR crawler middleware (server.ts).
 */

import type { SiteSettings, Vehicle } from '../types';
import { TOWNS_DATA, type TownTaxiConfig } from '../pages/destinations/townData';
import { PRIVATE_DAY_TOURS, type DayTourProduct } from './toursData';

export const DEFAULT_BASE_URL = 'https://galletaxi.lk';
export const DEFAULT_BUSINESS_NAME = 'Galle Taxi';
export const DEFAULT_BUSINESS_PHONE_DISPLAY = '+94 72 288 5885';
export const DEFAULT_BUSINESS_PHONE_E164 = '+94722885885';
export const DEFAULT_BUSINESS_WHATSAPP = '+94722885885';
export const DEFAULT_BUSINESS_EMAIL = 'support@galletaxi.lk';
export const DEFAULT_BUSINESS_STREET = 'No. 03 Rampart Street, Galle Dutch Fort';
export const DEFAULT_BUSINESS_ADDRESS = 'No. 03 Rampart Street, Galle Dutch Fort, Galle 80000, Sri Lanka';
export const DEFAULT_OG_IMAGE_PATH = '/assets/aistudio/Sunset_Beach_Road_Trip_with_Surfboard_19548307.webp';

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface RouteSeoEntry {
  path: string;
  title: string;
  description: string;
  keywords: string;
  image?: string;
  serviceType?: string;
  schemaType?: 'TaxiService' | 'WebSite' | 'AboutPage' | 'ContactPage' | 'CollectionPage' | 'WebPage';
  areaServed?: string[];
  faqs?: FaqEntry[];
}

export interface ResolvedPageSeo {
  path: string;
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  ogType: string;
  ogImage: string;
  siteName: string;
  twitterCard: 'summary_large_image';
  schema: Record<string, unknown>;
}

export interface ResolveSeoOptions {
  origin?: string;
  siteSettings?: Partial<SiteSettings>;
  townsMap?: Record<string, TownTaxiConfig>;
  toursList?: DayTourProduct[];
  vehicles?: Vehicle[];
  customTitle?: string;
  customDescription?: string;
  customKeywords?: string;
  customImage?: string;
  customSchemaType?: RouteSeoEntry['schemaType'];
  customServiceType?: string;
  customAreaServed?: string[];
  extraFaqs?: FaqEntry[];
}

export function normalizePhoneE164(raw?: string): string {
  if (!raw || typeof raw !== 'string') return DEFAULT_BUSINESS_PHONE_E164;
  const cleaned = raw.replace(/[^0-9+]/g, '');
  if (!cleaned || cleaned === '+94771234567' || cleaned === '94771234567') {
    return DEFAULT_BUSINESS_PHONE_E164;
  }
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}

export function normalizeMediaUrl(raw?: string, fallbackPath: string = DEFAULT_OG_IMAGE_PATH): string {
  const value = (raw || '').trim();
  if (!value) return fallbackPath;
  if (value.startsWith('/src/assets/images/')) {
    return value.replace('/src/assets/images/', '/assets/images/');
  }
  return value;
}

export function toAbsoluteUrl(pathOrUrl: string, origin: string = DEFAULT_BASE_URL): string {
  const cleanOrigin = origin.replace(/\/+$/, '');
  if (!pathOrUrl) return `${cleanOrigin}${DEFAULT_OG_IMAGE_PATH}`;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const normalizedPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${cleanOrigin}${normalizedPath}`;
}

const HUB_SEO_DETAILS: Record<
  string,
  {
    title: string;
    description: string;
    keywords: string;
    serviceName: string;
    serviceType: string;
    areaServed: string[];
  }
> = {
  'ahangama-taxi': {
    title: 'Ahangama Taxi Service | Private Airport & Surf Transfers',
    description:
      'Book 24/7 Ahangama & Kabalana taxi service and CMB airport transfers. Surfboard-friendly AC vehicles, E01 expressway tolls included & fixed rates.',
    keywords:
      'ahangama taxi service, ahangama to colombo airport taxi, kabalana surf taxi, ahangama taxi sri lanka, ahangama to galle taxi, ahangama to weligama transfer',
    serviceName: 'Ahangama Taxi Service - Galle Taxi',
    serviceType: 'Private Surf Coast Taxi and Airport Transfer Service',
    areaServed: ['Ahangama', 'Kabalana', 'Midigama', 'Koggala', 'Weligama', 'Galle', 'Colombo Airport (CMB)'],
  },
  'mirissa-taxi': {
    title: 'Mirissa Taxi Service | Private Airport & South Coast Rides',
    description:
      'Book 24/7 Mirissa taxi service and Colombo Airport (CMB) transfers. Fixed rates, E01 highway tolls included, whale watching shuttles & Ella/Yala trips.',
    keywords:
      'mirissa taxi service, mirissa to colombo airport taxi, mirissa to ella taxi, mirissa to yala transfer, whale watching shuttle mirissa, cmb to mirissa taxi',
    serviceName: 'Mirissa Taxi Service - Galle Taxi',
    serviceType: 'Private Beach Resort Taxi and Airport Transfer Service',
    areaServed: ['Mirissa', 'Weligama', 'Galle', 'Matara', 'Yala', 'Ella', 'Udawalawe', 'Hiriketiya', 'Colombo Airport (CMB)'],
  },
  'unawatuna-taxi': {
    title: 'Unawatuna Taxi Service | Private Airport & Beach Shuttles',
    description:
      'Book 24/7 Unawatuna taxi service and CMB airport transfers. 10-minute villa pickups, E01 highway tolls included & instant Galle Fort rides.',
    keywords:
      'unawatuna taxi service, unawatuna to colombo airport taxi, unawatuna to galle fort taxi, dalawella beach taxi, jungle beach shuttle, private driver unawatuna',
    serviceName: 'Unawatuna Taxi Service - Galle Taxi',
    serviceType: 'Private Beach Resort Taxi and Airport Transfer Service',
    areaServed: ['Unawatuna', 'Dalawella', 'Thalpe', 'Rumassala', 'Galle', 'Koggala', 'Colombo Airport (CMB)'],
  },
  'weligama-taxi': {
    title: 'Weligama Taxi Service | Surf Transfers & CMB Airport Rides',
    description:
      'Book 24/7 Weligama taxi service & CMB airport transfers. Fast 2h 10m highway ride, E01 tolls included, surfboard-friendly vans & resort pickups.',
    keywords:
      'weligama taxi service, weligama to colombo airport taxi, weligama bay taxi, weligama marriott taxi, midigama taxi, cmb to weligama transfer',
    serviceName: 'Weligama Taxi Service - Galle Taxi',
    serviceType: 'Private Surf Resort Taxi and Airport Transfer Service',
    areaServed: ['Weligama', 'Midigama', 'Ahangama', 'Mirissa', 'Galle', 'Yala', 'Ella', 'Colombo Airport (CMB)'],
  },
  'bentota-taxi': {
    title: 'Bentota Taxi Service | Luxury Resort & CMB Airport Transfers',
    description:
      'Book 24/7 Bentota & Beruwala taxi service with direct CMB airport highway transfers. Fixed rates, 5-star resort pickups & Madu River excursion cabs.',
    keywords:
      'bentota taxi service, bentota to colombo airport taxi, beruwala taxi, bentota luxury resort transfers, cmb to bentota transfer, private driver bentota',
    serviceName: 'Bentota Taxi Service - Galle Taxi',
    serviceType: 'Private Luxury Resort Taxi and Airport Transfer Service',
    areaServed: ['Bentota', 'Beruwala', 'Induruwa', 'Aluthgama', 'Hikkaduwa', 'Galle', 'Colombo Airport (CMB)'],
  },
  'hikkaduwa-taxi': {
    title: 'Hikkaduwa Taxi Service | Private Airport & Coral Coast Rides',
    description:
      'Book 24/7 Hikkaduwa taxi service and CMB airport transfers. E01 highway tolls included, AC fleet, dive gear luggage space & Galle Fort shuttles.',
    keywords:
      'hikkaduwa taxi service, hikkaduwa to colombo airport taxi, narigama beach taxi, hikkaduwa to galle taxi, cmb to hikkaduwa transfer, private driver hikkaduwa',
    serviceName: 'Hikkaduwa Taxi Service - Galle Taxi',
    serviceType: 'Private Coastal Beach Taxi and Airport Transfer Service',
    areaServed: ['Hikkaduwa', 'Narigama', 'Dodanduwa', 'Ambalangoda', 'Bentota', 'Galle', 'Colombo Airport (CMB)'],
  },
};

export const STATIC_ROUTE_SEO: Record<string, RouteSeoEntry> = {
  '/': {
    path: '/',
    title: 'Galle Taxi | Airport Transfers, Coastal Cabs & Private Tours Sri Lanka',
    description:
      'Book 24/7 private taxis in Galle & Southern Sri Lanka. Instant fare quotes for Colombo Airport (CMB) transfers, KDH vans, sedans, coastal hubs & day tours.',
    keywords:
      'galle taxi, galle airport taxi, colombo airport to galle transfer, southern expressway taxi, private driver sri lanka, galletaxi.lk',
    image: '/assets/aistudio/Sunset_Beach_Road_Trip_with_Surfboard_19548307.webp',
    serviceType: 'Private Taxi, Airport Transfers & Island Day Tours',
    schemaType: 'TaxiService',
    areaServed: ['Galle', 'Unawatuna', 'Ahangama', 'Weligama', 'Mirissa', 'Hikkaduwa', 'Bentota', 'Colombo Airport (CMB)'],
  },
  '/airport-drop': {
    path: '/airport-drop',
    title: 'Galle to Colombo Airport Drop Taxi | Private CMB Transfers',
    description:
      'Book reliable 24/7 airport drop taxi from Galle & South Coast to Colombo Airport (CMB). Fixed rates, E01 highway tolls included, AC fleet & chauffeurs.',
    keywords:
      'galle to colombo airport taxi, airport drop galle, colombo airport transfer cmb, southern expressway taxi sri lanka, unawatuna to airport taxi, weligama to cmb transfer',
    image: '/assets/images/service_airport_transfer_1793121941979.webp',
    serviceType: 'Private Airport Departure Transfer',
    schemaType: 'TaxiService',
    areaServed: ['Galle', 'Unawatuna', 'Ahangama', 'Weligama', 'Mirissa', 'Hikkaduwa', 'Koggala', 'Bentota', 'Colombo Airport (CMB)'],
    faqs: [
      {
        question: 'How long does the drive take from Galle to Colombo Airport (CMB)?',
        answer:
          'Via the Southern Expressway (E01) and Outer Circular Expressway (E02), the drive usually takes 1 hour 45 minutes to 2 hours 15 minutes depending on traffic near the airport gate. We always recommend scheduling your departure at least 4.5 hours before an international flight departure time.',
      },
      {
        question: 'Are the expressway highway toll clearances included in the fare?',
        answer:
          'Yes, 100% included. All quoted fares on Galle Taxi include the Southern Expressway toll fees, vehicle fuel, parking clearances, and English-speaking chauffeur service. You will never be asked for additional toll cash during the trip.',
      },
      {
        question: 'Can you pick up from any hotel, villa, or resort along the South Coast?',
        answer:
          'Yes. We provide door-to-door departure pickups from anywhere in Galle Fort, Unawatuna, Thalpe, Koggala, Ahangama, Midigama, Weligama, Mirissa, and surrounding southern beach villas. Your chauffeur will arrive 10 minutes prior to your requested departure time.',
      },
      {
        question: 'What if our departure flight is scheduled in the middle of the night?',
        answer:
          'Our dispatch desk and chauffeurs operate 24 hours a day, 7 days a week. Midnight, early dawn, or late evening pickups are fully supported at no extra night surcharge.',
      },
      {
        question: 'What happens if we need to cancel or change our pickup time?',
        answer:
          'We offer free cancellations and flexible reschedule options up to 12 hours before your scheduled pickup time. Just message our 24/7 WhatsApp hotline or email us.',
      },
    ],
  },
  '/airport-pickup': {
    path: '/airport-pickup',
    title: 'Colombo Airport Pick Up Taxi | Meet & Greet CMB to Galle',
    description:
      'Book 24/7 Colombo Airport (CMB) pick up taxis to Galle & Southern Coast. Arrival lobby meet & greet nameboard, live flight tracking & free waiting included.',
    keywords:
      'colombo airport pickup taxi, cmb to galle taxi, colombo airport to unawatuna taxi, cmb airport meet and greet taxi, airport arrival taxi sri lanka',
    image: '/assets/images/service_airport_transfer_1793121941979.webp',
    serviceType: 'Private Airport Arrival Meet & Greet Transfer',
    schemaType: 'TaxiService',
    areaServed: ['Colombo Airport (CMB)', 'Galle', 'Unawatuna', 'Ahangama', 'Weligama', 'Mirissa', 'Hikkaduwa', 'Bentota'],
    faqs: [
      {
        question: 'How will I find my chauffeur at Colombo Airport (CMB)?',
        answer:
          'Immediately after clearing customs, baggage claim, and currency exchange, step into the main arrival lobby. Your chauffeur will be waiting in the greeting area holding a clear nameboard prominently displaying your name and the Galle Taxi emblem.',
      },
      {
        question: 'What happens if my inbound flight is delayed or rescheduled?',
        answer:
          'We monitor all incoming commercial flights in real time using automated flight radar. There is ZERO extra waiting surcharge or penalty if your flight touches down later than scheduled. Your chauffeur automatically adjusts pickup time to your actual landing time.',
      },
      {
        question: 'Is there time to withdraw Sri Lankan Rupees (LKR) or purchase a tourist SIM card?',
        answer:
          'Absolutely. There are multiple 24/7 bank ATMs and Dialog/Mobitel telecommunications kiosks right in the arrivals hall before exiting. Your chauffeur will patiently assist you and wait until you have everything sorted before heading to the vehicle.',
      },
      {
        question: 'Can you transport surfboards, baby strollers, and oversized baggage?',
        answer:
          'Yes. For travelers carrying surfboard bags, golf bags, or heavy family luggage, we recommend our High-Roof VIP KDH Commuter Van, which easily accommodates long boards and up to 10 large suitcases without crowding passengers.',
      },
      {
        question: 'How do we pay for our airport transfer?',
        answer:
          'You can pay your driver upon safe arrival at your hotel in Sri Lankan Rupees (LKR), USD, EUR, or GBP at current bank rates, or arrange credit card processing with our dispatch office beforehand.',
      },
    ],
  },
  '/general-taxi': {
    path: '/general-taxi',
    title: 'Galle Taxi Service | Private Coastal Rides & Island Transfers',
    description:
      'Book 24/7 point-to-point taxis from Galle to Unawatuna, Mirissa, Ahangama, Ella & Yala. Instant local pickups, fixed fares & licensed AC chauffeur fleet.',
    keywords:
      'galle taxi service, taxi ride galle, galle to mirissa taxi, galle to ella taxi, galle to yala taxi, coastal cab sri lanka, private driver galle fort',
    image: '/assets/images/regenerated_image_1793163512211.webp',
    serviceType: 'Point-to-Point Coastal Taxi and Intercity Chauffeur Service',
    schemaType: 'TaxiService',
    areaServed: ['Galle', 'Unawatuna', 'Ahangama', 'Weligama', 'Mirissa', 'Hikkaduwa', 'Bentota', 'Ella', 'Yala', 'Kandy'],
    faqs: [
      {
        question: 'How fast can a taxi arrive for an on-demand pickup in Galle or Unawatuna?',
        answer:
          'We maintain active vehicles throughout Galle Fort, Unawatuna, Thalpe, and Ahangama. Average arrival time is 10 to 20 minutes from the moment you book via our website or message our WhatsApp dispatch.',
      },
      {
        question: 'Are all taxis air-conditioned and private?',
        answer:
          'Yes, 100%. Every Galle Taxi ride is strictly private—never shared with strangers—and operates in modern, cool, fully air-conditioned vehicles with licensed, courteous English-speaking chauffeurs.',
      },
      {
        question: 'Can we hire a taxi and driver for a full day of sightseeing or custom stops?',
        answer:
          'Yes! We offer flexible hourly and full-day chauffeur hire. Your driver will remain on standby at each destination while you explore, shop, dine, or surf.',
      },
      {
        question: 'How are fares calculated for custom point-to-point trips?',
        answer:
          'Our fares are calculated based on transparent per-kilometer rates with zero surge pricing. Short trips have fixed transparent minimums, and long-distance inter-city trips feature all-inclusive fixed rates covering fuel, vehicle, and driver.',
      },
      {
        question: 'Can we stop for photos, fresh coconuts, or currency exchange along the way?',
        answer:
          'Of course. Your chauffeur is at your complete disposal and happy to accommodate brief stops for roadside king coconuts, viewpoints, or quick errands at no extra charge.',
      },
    ],
  },
  '/services': {
    path: '/services',
    title: 'Taxi & Chauffeur Services in Galle Sri Lanka | Galle Taxi',
    description:
      'Explore CMB airport transfers, Galle Fort sightseeing tours, coastal taxi hubs, hotel villa transfers & private chauffeur car hire across Sri Lanka.',
    keywords:
      'galle taxi services, sri lanka private chauffeur services, galle sightseeing taxi, hotel transfers galle fort, long distance cab sri lanka',
    image: '/assets/images/service_galle_tour_1793121943026.webp',
    serviceType: 'Airport Transfers, City Cabs & Private Island Chauffeur Services',
    schemaType: 'CollectionPage',
    areaServed: ['Galle', 'Southern Province', 'Colombo Airport (CMB)', 'Sri Lanka'],
  },
  '/vehicles': {
    path: '/vehicles',
    title: 'Our Luxury Taxi Fleet & Chauffeurs | Galle Taxi Sri Lanka',
    description:
      'Compare our air-conditioned sedans, KDH Flat & High Roof VIP vans, budget mini cars & 4WD SUVs in Galle. View passenger capacity, luggage space & per-km rates.',
    keywords:
      'galle taxi fleet, kdh van hire galle, sedan taxi galle, suv private driver sri lanka, mini car cab galle fort',
    image: '/assets/images/vehicle_premium_van_1793121943671.webp',
    serviceType: 'Air-Conditioned Private Taxi Fleet & Chauffeurs',
    schemaType: 'CollectionPage',
    areaServed: ['Galle', 'Southern Province', 'Sri Lanka'],
  },
  '/book': {
    path: '/book',
    title: 'Book a Taxi Online | Instant Fare Calculator – Galle Taxi',
    description:
      'Calculate fixed fares and book your private taxi or CMB airport transfer in Galle online in under 60 seconds. Instant email voucher & 24/7 dispatch support.',
    keywords:
      'book galle taxi online, sri lanka taxi fare calculator, reserve airport transfer cmb, galle cab booking',
    image: '/assets/aistudio/Sunset_Beach_Road_Trip_with_Surfboard_19548307.webp',
    serviceType: 'Online Taxi & Airport Transfer Reservation',
    schemaType: 'TaxiService',
    areaServed: ['Galle', 'Colombo Airport (CMB)', 'Unawatuna', 'Ahangama', 'Weligama', 'Mirissa', 'Hikkaduwa', 'Bentota'],
  },
  '/track-booking': {
    path: '/track-booking',
    title: 'Track Your Taxi Booking Live | Dispatch Status – Galle Taxi',
    description:
      'Check live dispatch status, assigned chauffeur details, vehicle plate number, and official trip receipt for your Galle Taxi reservation anytime.',
    keywords:
      'track galle taxi booking, check cab dispatch status, galle taxi receipt lookup',
    image: '/assets/images/regenerated_image_1793163512211.webp',
    schemaType: 'WebPage',
  },
  '/booking-success': {
    path: '/booking-success',
    title: 'Booking Confirmed & Dispatch Voucher | Galle Taxi Sri Lanka',
    description:
      'Your Galle Taxi booking is confirmed. View your reference ID, route summary, multi-currency fare breakdown, and downloadable receipt.',
    keywords: 'galle taxi booking confirmation, official travel voucher, taxi receipt sri lanka',
    image: '/assets/aistudio/Sunset_Beach_Road_Trip_with_Surfboard_19548307.webp',
    schemaType: 'WebPage',
  },
  '/about': {
    path: '/about',
    title: 'About Galle Taxi | Licensed Southern Coast Chauffeur Network',
    description:
      'Learn about Galle Taxi inside Galle Dutch Fort. 12+ years of Sri Lankan hospitality, vetted English-speaking drivers, and zero hidden highway toll fees.',
    keywords:
      'about galle taxi, galle fort chauffeur company, licensed sri lanka taxi service, southern province tourism transport',
    image: '/assets/images/hero_galle_taxi_1793121940996.webp',
    schemaType: 'AboutPage',
  },
  '/contact': {
    path: '/contact',
    title: 'Contact Galle Taxi | 24/7 WhatsApp & Airport Dispatch Desk',
    description:
      'Reach Galle Taxi 24/7 at No. 03 Rampart Street, Galle Fort or via WhatsApp & phone for urgent airport pickups, custom Sri Lanka tours, and corporate transfers.',
    keywords:
      'contact galle taxi, galle taxi phone number, galle taxi whatsapp, galle fort taxi office',
    image: '/assets/images/hero_galle_taxi_1793121940996.webp',
    schemaType: 'ContactPage',
  },
  '/privacy': {
    path: '/privacy',
    title: 'Privacy Policy | Data Protection & Security – Galle Taxi',
    description:
      'Read the official Galle Taxi Privacy Policy explaining how passenger booking details, flight numbers, and contact data are protected and secured.',
    keywords: 'galle taxi privacy policy, passenger data protection sri lanka',
    schemaType: 'WebPage',
  },
  '/terms': {
    path: '/terms',
    title: 'Terms & Conditions | Booking, Tolls & Cancellation – Galle Taxi',
    description:
      'Review Galle Taxi terms for fixed expressway fares, complimentary airport flight delay waiting time, multi-currency cash payments, and free cancellation.',
    keywords: 'galle taxi terms and conditions, sri lanka taxi cancellation policy, expressway toll policy',
    schemaType: 'WebPage',
  },
};

export function resolveRouteSeo(rawPathname: string, options: ResolveSeoOptions = {}): ResolvedPageSeo {
  const pathname = (rawPathname || '/').split('?')[0].replace(/\/+$/, '') || '/';
  const origin = (options.origin || DEFAULT_BASE_URL).replace(/\/+$/, '');
  const settings = options.siteSettings || {};
  const businessName = settings.businessName || DEFAULT_BUSINESS_NAME;
  const telephone = normalizePhoneE164(settings.phone);
  const addressStreet = settings.address || DEFAULT_BUSINESS_ADDRESS;
  const email = settings.email || DEFAULT_BUSINESS_EMAIL;
  const siteHeroImage = normalizeMediaUrl(settings.heroImageUrl, DEFAULT_OG_IMAGE_PATH);

  const canonicalUrl = `${origin}${pathname === '/' ? '/' : pathname}`;

  const buildProviderBlock = (imageAbs: string) => ({
    '@type': 'LocalBusiness',
    name: businessName,
    url: origin,
    image: imageAbs,
    telephone,
    email,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: addressStreet || DEFAULT_BUSINESS_STREET,
      addressLocality: 'Galle',
      postalCode: '80000',
      addressCountry: 'LK',
    },
    sameAs: [origin],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '00:00',
        closes: '23:59',
      },
    ],
  });

  // 1. Check Day Tour routes (/tours/:slug)
  if (pathname.startsWith('/tours/')) {
    const slug = decodeURIComponent(pathname.slice('/tours/'.length));
    const allTours = options.toursList && options.toursList.length > 0 ? options.toursList : PRIVATE_DAY_TOURS;
    const tour = allTours.find((t) => t.slug === slug || t.id === slug);

    if (tour) {
      const title = options.customTitle || tour.seo?.title || `${tour.title} Private Day Tour | ${businessName}`;
      const description =
        options.customDescription ||
        tour.seo?.description ||
        tour.shortDescription ||
        `Book our private ${tour.title} day tour from Galle with air-conditioned vehicle and English-speaking chauffeur.`;
      const keywords =
        options.customKeywords ||
        tour.seo?.keywords ||
        `${tour.title}, ${tour.startingLocation} day tour, galle taxi tours`;
      const ogImageRel = normalizeMediaUrl(options.customImage || tour.seo?.ogImage || tour.heroImage, DEFAULT_OG_IMAGE_PATH);
      const ogImage = toAbsoluteUrl(ogImageRel, origin);

      const lowestUsd = tour.vehiclePrices?.length
        ? Math.min(...tour.vehiclePrices.map((v) => Number(v.priceUsd || 0)).filter((p) => p > 0))
        : 55;

      const tourGraph: Record<string, unknown>[] = [
        {
          '@type': 'TouristTrip',
          '@id': `${canonicalUrl}#tour`,
          name: tour.title,
          description,
          url: canonicalUrl,
          image: ogImage,
          touristType: 'Private Chauffeur Excursion',
          itinerary: (tour.itinerary || []).map((item) => ({
            '@type': 'City',
            name: item.title,
            description: item.description,
          })),
          offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: String(Number.isFinite(lowestUsd) ? lowestUsd : 55),
            availability: 'https://schema.org/InStock',
            url: canonicalUrl,
          },
          provider: buildProviderBlock(ogImage),
        },
        {
          '@type': 'TaxiService',
          '@id': `${canonicalUrl}#taxiservice`,
          name: `${tour.title} - ${businessName}`,
          serviceType: `Private Day Tour (${tour.duration})`,
          description,
          url: canonicalUrl,
          telephone,
          priceRange: '$$',
          areaServed: [{ '@type': 'AdministrativeArea', name: tour.startingLocation || 'Galle, Sri Lanka' }],
          provider: buildProviderBlock(ogImage),
        },
      ];

      if (tour.rating && tour.reviewCount) {
        (tourGraph[0] as Record<string, unknown>).aggregateRating = {
          '@type': 'AggregateRating',
          ratingValue: String(tour.rating),
          reviewCount: String(tour.reviewCount),
        };
      }

      return {
        path: pathname,
        title,
        description,
        keywords,
        canonicalUrl,
        ogType: 'website',
        ogImage,
        siteName: businessName,
        twitterCard: 'summary_large_image',
        schema: {
          '@context': 'https://schema.org',
          '@graph': tourGraph,
        },
      };
    }
  }

  // 2. Check Coastal Town Hub routes (e.g. /ahangama-taxi, /mirissa-taxi, /unawatuna-taxi, etc.)
  const slugKey = pathname.slice(1);
  const allTowns = { ...TOWNS_DATA, ...(options.townsMap || {}) };
  const matchedTown = allTowns[slugKey] || Object.values(allTowns).find((t) => t.slug === slugKey);

  if (matchedTown) {
    const hubMeta = HUB_SEO_DETAILS[matchedTown.slug] || HUB_SEO_DETAILS[slugKey];
    const title =
      options.customTitle ||
      hubMeta?.title ||
      matchedTown.pageTitle ||
      `${matchedTown.townName} Taxi Service | Private Airport & Coastal Rides`;
    const description =
      options.customDescription ||
      hubMeta?.description ||
      matchedTown.tagline ||
      `Book 24/7 ${matchedTown.townName} taxi service and Colombo Airport (CMB) transfers with ${businessName}.`;
    const keywords =
      options.customKeywords ||
      hubMeta?.keywords ||
      `${matchedTown.townName} taxi, ${matchedTown.townName} to colombo airport taxi, private driver ${matchedTown.townName}`;
    const ogImageRel = normalizeMediaUrl(
      options.customImage || matchedTown.heroImage,
      '/assets/aistudio/Sri_Lanka_Southern_Coast_Surf_Sunset_2549a27a.webp'
    );
    const ogImage = toAbsoluteUrl(ogImageRel, origin);

    const faqs = options.extraFaqs && options.extraFaqs.length > 0 ? options.extraFaqs : matchedTown.faqs || [];
    const graph: Record<string, unknown>[] = [
      {
        '@type': 'TaxiService',
        '@id': `${canonicalUrl}#taxiservice`,
        name: hubMeta?.serviceName || `${matchedTown.townName} Taxi Service - ${businessName}`,
        serviceType: hubMeta?.serviceType || `Private Taxi and Airport Transfers in ${matchedTown.townName}`,
        description,
        url: canonicalUrl,
        telephone,
        priceRange: '$$',
        currenciesAccepted: 'LKR, USD, EUR, GBP',
        paymentAccepted: 'Cash, Credit Card, Bank Transfer',
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '00:00',
            closes: '23:59',
          },
        ],
        areaServed: (hubMeta?.areaServed || [matchedTown.townName, 'Galle', 'Colombo Airport (CMB)']).map((name) => ({
          '@type': 'AdministrativeArea',
          name,
        })),
        provider: buildProviderBlock(ogImage),
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `${matchedTown.townName} Popular Taxi & Transfer Routes`,
          itemListElement: (matchedTown.popularRoutes || []).map((route) => ({
            '@type': 'Offer',
            priceCurrency: 'LKR',
            price: String(route.sedanLkr),
            itemOffered: {
              '@type': 'Service',
              name: `${route.from} to ${route.to} Taxi`,
              description: `${route.duration} (${route.distanceKm} km). ${route.highlight}`,
            },
          })),
        },
      },
    ];

    if (faqs.length > 0) {
      graph.push({
        '@type': 'FAQPage',
        '@id': `${canonicalUrl}#faq`,
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      });
    }

    return {
      path: pathname,
      title,
      description,
      keywords,
      canonicalUrl,
      ogType: 'website',
      ogImage,
      siteName: businessName,
      twitterCard: 'summary_large_image',
      schema: {
        '@context': 'https://schema.org',
        '@graph': graph,
      },
    };
  }

  // 3. Static / App Core Routes
  const staticEntry = STATIC_ROUTE_SEO[pathname] || STATIC_ROUTE_SEO['/'];
  const title = options.customTitle || staticEntry.title;
  const description = options.customDescription || staticEntry.description;
  const keywords = options.customKeywords || staticEntry.keywords;
  const effectiveSchemaType = options.customSchemaType || staticEntry.schemaType || 'TaxiService';
  const effectiveServiceType = options.customServiceType || staticEntry.serviceType || 'Private Taxi & Airport Transfers';
  const effectiveAreaServed =
    options.customAreaServed && options.customAreaServed.length > 0
      ? options.customAreaServed
      : staticEntry.areaServed;
  const defaultRouteImage =
    pathname === '/'
      ? siteHeroImage
      : staticEntry.image || siteHeroImage || DEFAULT_OG_IMAGE_PATH;
  const ogImage = toAbsoluteUrl(normalizeMediaUrl(options.customImage || defaultRouteImage, DEFAULT_OG_IMAGE_PATH), origin);

  const primaryEntity: Record<string, unknown> = {
    '@type': effectiveSchemaType,
    '@id': `${canonicalUrl}#primary`,
    name: effectiveSchemaType === 'TaxiService' ? `${businessName} - ${title.split('|')[0].trim()}` : title,
    description,
    url: canonicalUrl,
  };

  if (effectiveSchemaType === 'TaxiService' || pathname === '/') {
    primaryEntity['@type'] = 'TaxiService';
    primaryEntity.serviceType = effectiveServiceType;
    primaryEntity.telephone = telephone;
    primaryEntity.priceRange = '$$';
    primaryEntity.currenciesAccepted = 'LKR, USD, EUR, GBP, INR';
    primaryEntity.paymentAccepted = 'Cash, Credit Card, Bank Transfer';
    primaryEntity.provider = buildProviderBlock(ogImage);
    primaryEntity.openingHoursSpecification = [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '00:00',
        closes: '23:59',
      },
    ];
    if (effectiveAreaServed?.length) {
      primaryEntity.areaServed = effectiveAreaServed.map((name) => ({
        '@type': 'AdministrativeArea',
        name,
      }));
    }
  } else {
    primaryEntity.publisher = buildProviderBlock(ogImage);
  }

  const graph: Record<string, unknown>[] = [primaryEntity];

  if (pathname === '/') {
    graph.push({
      '@type': 'WebSite',
      '@id': `${origin}/#website`,
      name: businessName,
      url: origin,
      description,
      publisher: buildProviderBlock(ogImage),
    });
  }

  const combinedFaqs = options.extraFaqs && options.extraFaqs.length > 0 ? options.extraFaqs : staticEntry.faqs || [];
  if (combinedFaqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${canonicalUrl}#faq`,
      mainEntity: combinedFaqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });
  }

  // Note: for /contact or /about ensure LocalBusiness phone + address stays explicit
  if (pathname === '/contact' || pathname === '/about' || pathname === '/services' || pathname === '/vehicles') {
    graph.push({
      '@type': 'LocalBusiness',
      '@id': `${origin}/#localbusiness`,
      name: businessName,
      url: origin,
      image: ogImage,
      telephone,
      email,
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: addressStreet || DEFAULT_BUSINESS_STREET,
        addressLocality: 'Galle',
        postalCode: '80000',
        addressCountry: 'LK',
      },
    });
  }

  return {
    path: pathname,
    title,
    description,
    keywords,
    canonicalUrl,
    ogType: 'website',
    ogImage,
    siteName: businessName,
    twitterCard: 'summary_large_image',
    schema: {
      '@context': 'https://schema.org',
      '@graph': graph,
    },
  };
}

function escapeHtmlAttr(value: string): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtmlText(value: string): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeJsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/<\//g, '<\\/');
}

function upsertMetaTagInHtml(
  html: string,
  attrName: 'name' | 'property',
  attrKey: string,
  content: string
): string {
  const escaped = escapeHtmlAttr(content);
  const regex = new RegExp(
    `<meta\\b[^>]*\\b${attrName}=["']${attrKey}["'][^>]*>`,
    'i'
  );
  const replacement = `<meta ${attrName}="${attrKey}" content="${escaped}" />`;
  if (regex.test(html)) {
    return html.replace(regex, replacement);
  }
  return html.replace('</head>', `    ${replacement}\n  </head>`);
}

function upsertCanonicalInHtml(html: string, href: string): string {
  const escaped = escapeHtmlAttr(href);
  const regex = /<link\b[^>]*\brel=["']canonical["'][^>]*>/i;
  const replacement = `<link rel="canonical" href="${escaped}" />`;
  if (regex.test(html)) {
    return html.replace(regex, replacement);
  }
  return html.replace('</head>', `    ${replacement}\n  </head>`);
}

/**
 * Injects page-specific SEO tags, Open Graph cards, Twitter cards, canonical link,
 * and Schema.org JSON-LD directly into index.html for social crawlers (WhatsApp, Facebook, X, LinkedIn)
 * and search engine bots before JavaScript hydration.
 */
export function injectSeoIntoHtml(html: string, seo: ResolvedPageSeo): string {
  let out = html;

  // Replace <title>...</title>
  if (/<title>[\s\S]*?<\/title>/i.test(out)) {
    out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtmlText(seo.title)}</title>`);
  } else {
    out = out.replace('</head>', `    <title>${escapeHtmlText(seo.title)}</title>\n  </head>`);
  }

  // Standard Meta
  out = upsertMetaTagInHtml(out, 'name', 'description', seo.description);
  out = upsertMetaTagInHtml(out, 'name', 'keywords', seo.keywords);

  // Open Graph (WhatsApp, Facebook, LinkedIn, Telegram, Discord)
  out = upsertMetaTagInHtml(out, 'property', 'og:type', seo.ogType);
  out = upsertMetaTagInHtml(out, 'property', 'og:site_name', seo.siteName);
  out = upsertMetaTagInHtml(out, 'property', 'og:title', seo.title);
  out = upsertMetaTagInHtml(out, 'property', 'og:description', seo.description);
  out = upsertMetaTagInHtml(out, 'property', 'og:url', seo.canonicalUrl);
  out = upsertMetaTagInHtml(out, 'property', 'og:image', seo.ogImage);

  // Twitter / X
  out = upsertMetaTagInHtml(out, 'name', 'twitter:card', seo.twitterCard);
  out = upsertMetaTagInHtml(out, 'name', 'twitter:title', seo.title);
  out = upsertMetaTagInHtml(out, 'name', 'twitter:description', seo.description);
  out = upsertMetaTagInHtml(out, 'name', 'twitter:image', seo.ogImage);

  // Canonical
  out = upsertCanonicalInHtml(out, seo.canonicalUrl);

  // Schema.org JSON-LD
  const jsonLdTag = `<script id="page-seo-schema" type="application/ld+json">${escapeJsonLd(seo.schema)}</script>`;
  const schemaRegex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i;
  if (schemaRegex.test(out)) {
    out = out.replace(schemaRegex, jsonLdTag);
  } else {
    out = out.replace('</head>', `    ${jsonLdTag}\n  </head>`);
  }

  return out;
}
