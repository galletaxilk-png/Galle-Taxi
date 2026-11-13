/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TourVehiclePrice {
  id: string;
  name: string;
  category: string;
  passengers: string;
  maxPassengers: number;
  luggage: string;
  priceUsd: number;
  highlight: string;
  badge?: string;
}

export interface TourItineraryItem {
  time: string;
  title: string;
  description: string;
}

export interface TourHighlightItem {
  title: string;
  description: string;
}

export interface DayTourProduct {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  duration: string;
  startingLocation: string;
  pickupLocations?: string[];
  rating: number;
  reviewCount: number;
  badge?: string;
  isPublished: boolean;
  shortDescription: string;
  fullDescription: string;
  heroImage: string;
  galleryImages: string[];
  vehiclePrices: TourVehiclePrice[];
  highlights: TourHighlightItem[];
  itinerary: TourItineraryItem[];
  included: string[];
  excluded: string[];
  importantInfo: string[];
  cancellationPolicy: string;
  mapQuery: string;
  seo: {
    title: string;
    description: string;
    keywords: string;
    ogImage?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

const getTourImage = (_id: string, defaultUrl: string): string => {
  return defaultUrl;
};

export const PRIVATE_DAY_TOURS: DayTourProduct[] = [
  {
    id: 'galle-south-coast',
    slug: 'galle-south-coast-discovery',
    title: 'Galle & South Coast Discovery',
    shortTitle: 'Galle & South Coast',
    duration: '8–9 Hours',
    startingLocation: 'Galle, Unawatuna, Thalpe, or Ahangama',
    rating: 4.96,
    reviewCount: 142,
    badge: 'Signature Tour',
    isPublished: true,
    pickupLocations: [
      'Galle (Fort / Hotel / Villa)',
      'Unawatuna (Beach / Resort)',
      'Ahangama (Hotel / Surf Camp)',
      'Thalpe / Koggala',
    ],
    shortDescription:
      'Immerse in Dutch colonial history inside UNESCO Galle Fort, panoramic views from Rumassala, relaxing Unawatuna bay, and authentic Koggala stilt fishing.',
    fullDescription:
      'Experience the pinnacle of southern Sri Lanka in a private, unhurried day tour. Wander through cobblestone Dutch colonial alleys lined with 17th-century ramparts, lighthouses, and artisan boutiques. Soak in sweeping ocean panoramas from the Rumassala Peace Pagoda, take a refreshing beach break at Unawatuna, and witness traditional stilt fishermen perched above the breaking surf along Koggala coastline.',
    heroImage: '/assets/images/service_galle_tour_1793121943026.jpg',
    galleryImages: [
      '/assets/images/service_galle_tour_1793121943026.jpg',
      '/assets/images/hero_galle_taxi_1793121940996.jpg',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80',
    ],
    vehiclePrices: [
      {
        id: 'sedan',
        name: 'Executive Sedan',
        category: 'Toyota Premio / Allion / Prius',
        passengers: '1–3 Passengers',
        maxPassengers: 3,
        luggage: '2 Medium Bags',
        priceUsd: 55,
        highlight: 'Ideal for couples & solo travelers',
      },
      {
        id: 'suv',
        name: 'Comfort SUV',
        category: 'Toyota Rush / Honda Vezel',
        passengers: '1–4 Passengers',
        maxPassengers: 4,
        luggage: '3 Large Bags',
        priceUsd: 70,
        highlight: 'Elevated ride with panoramic windows',
        badge: 'Popular',
      },
      {
        id: 'kdh-flat-roof',
        name: 'KDH Flat Roof Van',
        category: 'Toyota KDH Flat Roof',
        passengers: '4–6 Passengers',
        maxPassengers: 6,
        luggage: '6 Large Bags',
        priceUsd: 80,
        highlight: 'Spacious for families and group day trips',
      },
      {
        id: 'kdh-high-roof',
        name: 'KDH High Roof Van',
        category: 'Toyota KDH High Roof VIP',
        passengers: '6–9 Passengers',
        maxPassengers: 9,
        luggage: '9 Large Bags',
        priceUsd: 95,
        highlight: 'Maximum legroom and luggage capacity',
        badge: 'Spacious VIP',
      },
    ],
    highlights: [
      {
        title: 'UNESCO Galle Fort Ramparts',
        description: 'Guided walk along 17th-century Dutch battlements, the 1939 British lighthouse, and colonial cobblestone streets.',
      },
      {
        title: 'Rumassala Japanese Peace Pagoda',
        description: 'Tranquil Buddhist stupa nestled high on Rumassala headland with 360-degree views across Galle Bay.',
      },
      {
        title: 'Unawatuna Beachfront & Dining',
        description: 'Stroll or swim in calm turquoise waters and savor fresh seafood at a beachfront restaurant of your choice.',
      },
      {
        title: 'Koggala Traditional Stilt Fishermen',
        description: 'Observe and photograph Sri Lanka’s world-famous artisanal stilt-fishing ritual perched above the Indian Ocean waves.',
      },
      {
        title: 'Handunugoda Virgin White Tea',
        description: 'Visit the world-renowned low-country plantation where untouched virgin white tea is delicately harvested.',
      },
    ],
    itinerary: [
      {
        time: '08:30 AM',
        title: 'Private Hotel Pickup',
        description: 'Chauffeur arrives at your hotel or villa in Galle, Unawatuna, Thalpe, or Ahangama in a pristine air-conditioned vehicle.',
      },
      {
        time: '09:00 – 11:30 AM',
        title: 'Galle Dutch Fort Heritage Walking Tour',
        description: 'Explore the Portuguese-Dutch ramparts, maritime museum, Dutch Reformed Church, Clock Tower, and boutique artisan stores.',
      },
      {
        time: '11:45 AM – 12:45 PM',
        title: 'Rumassala Headland & Peace Pagoda',
        description: 'Scenic climb through jungle foliage to the Japanese Peace Pagoda with panoramic vistas across the southern sea.',
      },
      {
        time: '01:00 – 02:30 PM',
        title: 'Unawatuna Bay Beach Relaxation & Coastal Lunch',
        description: 'Relax at one of Sri Lanka’s most celebrated bays. Enjoy lunch and refreshments at your preferred seaside venue.',
      },
      {
        time: '03:00 – 04:00 PM',
        title: 'Koggala Stilt Fishermen & Lake Shore',
        description: 'Stop at the historic stilt-fishing coast and picturesque Koggala Lake shoreline for iconic photography.',
      },
      {
        time: '04:15 – 05:15 PM',
        title: 'Handunugoda Tea Estate & Spice Walk',
        description: 'Complimentary tea tasting and stroll through cinnamon gardens and 200-year-old tea factory.',
      },
      {
        time: '05:30 PM',
        title: 'Scenic Return Drop-off',
        description: 'Smooth and comfortable ride back to your hotel or requested sunset dinner location.',
      },
    ],
    included: [
      'Private air-conditioned vehicle for 8–9 hours',
      'Professional English-speaking chauffeur',
      'Fuel, highway tolls, and standard parking clearances',
      'Flexible door-to-door hotel pickup and drop-off',
      'Complimentary chilled bottled water',
    ],
    excluded: [
      'Lunch, snacks, and personal beverages',
      'Museum entrance fees (optional)',
      'Gratuities for driver (at your discretion)',
    ],
    importantInfo: [
      'Modest attire covering shoulders and knees required when entering temple grounds at Peace Pagoda.',
      'Bring sunscreen, sunglasses, hat, and swimwear if planning to swim at Unawatuna.',
      'Itinerary is 100% private and flexible to your family preferences.',
    ],
    cancellationPolicy: 'Free cancellation up to 24 hours before your scheduled pickup time with 100% full refund.',
    mapQuery: 'Galle+Fort,Sri+Lanka',
    seo: {
      title: 'Galle & South Coast Discovery Private Day Tour | Galle Taxi',
      description: 'Book a luxury private day tour of Galle Dutch Fort, Rumassala Peace Pagoda, Unawatuna Beach & Koggala. Private car from $55. English chauffeur included.',
      keywords: 'Galle day tour, Galle Fort taxi tour, private driver Galle, Unawatuna tour from Galle, South Coast Sri Lanka tour',
    },
  },
  {
    id: 'ella-highlands-adventure',
    slug: 'ella-highlands-adventure',
    title: 'Ella Highlands Adventure',
    shortTitle: 'Ella Highlands Adventure',
    duration: '12–14 Hours',
    startingLocation: 'Galle, Unawatuna, Weligama, or Mirissa',
    rating: 4.98,
    reviewCount: 98,
    badge: 'Mountain Scenic',
    isPublished: true,
    pickupLocations: [
      'Galle / Unawatuna',
      'Ahangama / Weligama',
      'Mirissa',
      'Matara / Tangalle',
    ],
    shortDescription:
      'Ascend to misty highlands: walk the historic Nine Arch Bridge, hike Little Adam’s Peak, witness roaring Ravana Falls, and visit an authentic tea factory.',
    fullDescription:
      'Leave the tropical coast behind as you ascend the scenic mountain passes into the emerald hill country of Ella. Walk atop the world-famous colonial Nine Arch Bridge, take an easy scenic hike up Little Adam’s Peak for 360-degree valley views, feel the cool spray of Ravana Waterfall, and discover the craftsmanship of authentic Ceylon tea.',
    heroImage: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
      '/assets/images/hero_galle_taxi_1793121940996.jpg',
    ],
    vehiclePrices: [
      {
        id: 'sedan',
        name: 'Executive Sedan',
        category: 'Toyota Premio / Allion / Prius',
        passengers: '1–3 Passengers',
        maxPassengers: 3,
        luggage: '2 Medium Bags',
        priceUsd: 125,
        highlight: 'Smooth ride for couples on mountain highway',
      },
      {
        id: 'suv',
        name: 'Comfort SUV',
        category: 'Toyota Rush / Honda Vezel',
        passengers: '1–4 Passengers',
        maxPassengers: 4,
        luggage: '3 Large Bags',
        priceUsd: 145,
        highlight: 'High ground clearance and mountain comfort',
        badge: 'Recommended',
      },
      {
        id: 'kdh-flat-roof',
        name: 'KDH Flat Roof Van',
        category: 'Toyota KDH Flat Roof',
        passengers: '4–6 Passengers',
        maxPassengers: 6,
        luggage: '6 Large Bags',
        priceUsd: 165,
        highlight: 'Spacious hill climb for family groups',
      },
      {
        id: 'kdh-high-roof',
        name: 'KDH High Roof Van',
        category: 'Toyota KDH High Roof VIP',
        passengers: '6–9 Passengers',
        maxPassengers: 9,
        luggage: '9 Large Bags',
        priceUsd: 190,
        highlight: 'VIP recliner seating with dual AC for long journeys',
        badge: 'Best for Groups',
      },
    ],
    highlights: [
      {
        title: 'Demodara Nine Arch Bridge',
        description: 'Stand on the iconic 1921 British railway viaduct spanning deep cloud forest canopy without a single piece of steel.',
      },
      {
        title: 'Little Adam’s Peak Summit Hike',
        description: 'An easy 45-minute graded hike through fragrant tea plantations leading to sweeping vistas over Ella Gap.',
      },
      {
        title: 'Ravana Waterfall Cascade',
        description: 'Marvel at one of Sri Lanka’s widest multi-tiered waterfalls tumbling down dramatic mountain cliffs.',
      },
      {
        title: 'Working Highland Ceylon Tea Factory',
        description: 'Step inside an active tea factory to observe traditional withering, rolling, fermenting, and taste Orange Pekoe.',
      },
      {
        title: 'Ella Mountain Village Vibe',
        description: 'Enjoy free time in Ella town for lunch at trendy cafes overlooking the deep mountain ravine.',
      },
    ],
    itinerary: [
      {
        time: '05:30 AM',
        title: 'Early Morning Hotel Departure',
        description: 'Early departure from Galle or southern coast to beat highway traffic and maximize your mountain daylight.',
      },
      {
        time: '08:45 – 09:30 AM',
        title: 'Ravana Falls & Breakfast Stop',
        description: 'Arrive in Ella foothills, view Ravana Falls cascading beside the pass, and enjoy a quick breakfast/coffee.',
      },
      {
        time: '10:00 AM – 12:00 PM',
        title: 'Demodara Nine Arch Bridge & Blue Train',
        description: 'Walk the scenic jungle path to the bridge. Chauffeur coordinates with daily train schedules so you can photograph the passing blue train.',
      },
      {
        time: '12:30 – 01:45 PM',
        title: 'Ella Town & Panoramic Mountain Lunch',
        description: 'Lunch at a recommended cliffside restaurant with sweeping views of Ella Rock.',
      },
      {
        time: '02:00 – 03:30 PM',
        title: 'Little Adam’s Peak Panoramic Hike',
        description: 'Gentle trek across tea hills with 360-degree viewpoints over the southern plains.',
      },
      {
        time: '03:45 – 04:45 PM',
        title: 'Highland Tea Estate Tour & Tasting',
        description: 'Tour a working tea processing facility and sample fresh Ceylon black and green teas.',
      },
      {
        time: '05:00 – 07:30 PM',
        title: 'Expressway Return to Galle',
        description: 'Comfortable expressway cruise back to the coast with safe drop-off at your hotel.',
      },
    ],
    included: [
      'Private air-conditioned car or van with expert hill-country driver',
      'Fuel, highway tolls, and mountain parking clearances',
      'Door-to-door hotel transfers',
      'Assistance timing train crossings at Nine Arch Bridge',
      'Complimentary chilled bottled water',
    ],
    excluded: [
      'Meals, snacks, and personal beverages',
      'Tea factory entry/tasting ticket (approx $3-$5)',
      'Optional Zip-line / Flying Ravana tickets',
      'Driver gratuity',
    ],
    importantInfo: [
      'Wear comfortable walking shoes with good grip for the Nine Arch Bridge and Little Adam’s Peak.',
      'Weather in Ella is cooler than the coast (around 20–24°C), so bring a light jacket or shawl.',
      'Early departure is recommended to catch the mountain morning light.',
    ],
    cancellationPolicy: 'Free cancellation up to 24 hours prior to departure for a full refund.',
    mapQuery: 'Ella,Sri+Lanka',
    seo: {
      title: 'Ella Highlands Adventure Day Tour from Galle | Galle Taxi',
      description: 'Private day trip from Galle to Ella. Visit Nine Arch Bridge, Little Adam’s Peak, Ravana Falls & tea factory. Private vehicle from $125.',
      keywords: 'Ella day tour from Galle, Nine Arch Bridge tour, private taxi Galle to Ella, Ella day trip driver Sri Lanka',
    },
  },
  {
    id: 'udawalawe-elephant-safari',
    slug: 'udawalawe-elephant-safari',
    title: 'Udawalawe Elephant Safari',
    shortTitle: 'Udawalawe Elephant Safari',
    duration: '9–11 Hours',
    startingLocation: 'Galle, Unawatuna, Weligama, or Mirissa',
    rating: 4.97,
    reviewCount: 116,
    badge: 'Wild Elephants',
    isPublished: true,
    pickupLocations: [
      'Galle / Unawatuna',
      'Ahangama / Weligama',
      'Mirissa',
      'Hikkaduwa / Bentota',
    ],
    shortDescription:
      'Guaranteed wild elephant sightings! Visit the Elephant Transit Home feeding and enjoy a 3-hour open-top 4x4 safari across Udawalawe’s savannah.',
    fullDescription:
      'Udawalawe National Park is celebrated worldwide for its guaranteed wild elephant encounters in open savannah landscapes reminiscent of East Africa. Witness the heartwarming milk-feeding session of rescued orphan calves at the Elephant Transit Home, followed by an exhilarating 3-hour game drive in a customized open-top 4x4 safari jeep along the borders of Udawalawe reservoir.',
    heroImage: '/assets/images/regenerated_image_1793632543146.png',
    galleryImages: [
      '/assets/images/regenerated_image_1793632543146.png',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80',
      '/assets/images/service_airport_transfer_1793121941979.jpg',
    ],
    vehiclePrices: [
      {
        id: 'sedan',
        name: 'Executive Sedan',
        category: 'Toyota Premio / Allion / Prius',
        passengers: '1–3 Passengers',
        maxPassengers: 3,
        luggage: '2 Medium Bags',
        priceUsd: 95,
        highlight: 'Quiet and comfortable highway transit',
      },
      {
        id: 'suv',
        name: 'Comfort SUV',
        category: 'Toyota Rush / Honda Vezel',
        passengers: '1–4 Passengers',
        maxPassengers: 4,
        luggage: '3 Large Bags',
        priceUsd: 110,
        highlight: 'Extra legroom for the 2.5 hour journey',
        badge: 'Recommended',
      },
      {
        id: 'kdh-flat-roof',
        name: 'KDH Flat Roof Van',
        category: 'Toyota KDH Flat Roof',
        passengers: '4–6 Passengers',
        maxPassengers: 6,
        luggage: '6 Large Bags',
        priceUsd: 130,
        highlight: 'Great value for families and small groups',
      },
      {
        id: 'kdh-high-roof',
        name: 'KDH High Roof Van',
        category: 'Toyota KDH High Roof VIP',
        passengers: '6–9 Passengers',
        maxPassengers: 9,
        luggage: '9 Large Bags',
        priceUsd: 150,
        highlight: 'Spacious seating for multi-family groups',
        badge: 'Family Favorite',
      },
    ],
    highlights: [
      {
        title: 'Guaranteed Wild Elephant Herds',
        description: 'Over 500 wild Asian elephants roam freely across open grasslands and waterholes.',
      },
      {
        title: 'Elephant Transit Home (ETH) Calf Feeding',
        description: 'Observe rescued orphaned baby elephants joyfully receiving their morning milk bottles before being rehabilitated to the wild.',
      },
      {
        title: 'Private Open-Top 4x4 Safari Jeep',
        description: 'Elevated seating in an open 4x4 jeep navigated by an experienced wildlife tracker.',
      },
      {
        title: 'Udawalawe Scenic Reservoir & Wildlife',
        description: 'Spot wild water buffalo, marsh crocodiles, spotted deer, monitor lizards, and over 180 bird species.',
      },
      {
        title: 'Authentic Village Claypot Lunch',
        description: 'Savor traditional southern rice & curry prepared over woodfire at a local countryside restaurant.',
      },
    ],
    itinerary: [
      {
        time: '06:30 AM',
        title: 'Hotel Pickup in Galle / South Coast',
        description: 'Prompt pickup with air-conditioned vehicle. Grab a breakfast box from your hotel.',
      },
      {
        time: '09:30 – 10:30 AM',
        title: 'Elephant Transit Home Milk Feeding',
        description: 'Witness the heartwarming spectacle of baby elephants bounding into the compound for milk feeding.',
      },
      {
        time: '10:45 AM – 01:45 PM',
        title: 'Udawalawe National Park 4x4 Game Drive',
        description: 'Embark on a 3-hour game drive through the wilderness, tracking elephant families, birds of prey, and wildlife.',
      },
      {
        time: '02:00 – 03:00 PM',
        title: 'Local Countryside Lunch',
        description: 'Enjoy delicious Sri Lankan dishes at an authentic riverside restaurant.',
      },
      {
        time: '03:15 – 05:30 PM',
        title: 'Relaxed Return Transfer',
        description: 'Smooth drive back to your hotel in Galle, Unawatuna, or Weligama.',
      },
    ],
    included: [
      'Private air-conditioned car or van transfer roundtrip from your hotel',
      'Fuel, highway tolls, and vehicle parking fees',
      'Dedicated chauffeur assistance booking your official park 4x4 jeep',
      'Bottled drinking water',
    ],
    excluded: [
      'National Park entry tickets (~$30 USD per adult paid at gate)',
      'Elephant Transit Home entry fee (~$5 USD)',
      '4x4 Open Safari Jeep hire (~$40–$50 USD per jeep)',
      'Lunch and drinks',
    ],
    importantInfo: [
      'Safari jeeps are booked directly on arrival at the park entrance (our driver assists with all ticketing).',
      'Bring binoculars, camera with zoom lens, sunscreen, and sunglasses.',
      'Child and family friendly tour with minimal walking.',
    ],
    cancellationPolicy: 'Free cancellation up to 24 hours prior to pickup with 100% full refund.',
    mapQuery: 'Udawalawe+National+Park,Sri+Lanka',
    seo: {
      title: 'Udawalawe Elephant Safari Day Tour from Galle | Galle Taxi',
      description: 'Private day tour from Galle to Udawalawe National Park. See wild elephant herds & Transit Home. Private roundtrip car from $95.',
      keywords: 'Udawalawe safari from Galle, Udawalawe day trip taxi, elephant safari Sri Lanka, private driver Udawalawe',
    },
  },
  {
    id: 'yala-national-park-safari',
    slug: 'yala-national-park-safari',
    title: 'Yala National Park Safari',
    shortTitle: 'Yala National Park Safari',
    duration: '11–13 Hours',
    startingLocation: 'Galle, Unawatuna, Weligama, or Mirissa',
    rating: 4.95,
    reviewCount: 131,
    badge: 'Big 5 Safari',
    isPublished: true,
    pickupLocations: [
      'Galle / Unawatuna (04:30 AM)',
      'Ahangama / Weligama (04:45 AM)',
      'Mirissa (05:00 AM)',
      'Tangalle / Hambantota (05:30 AM)',
    ],
    shortDescription:
      'Embark on Sri Lanka’s premier big cat safari: world-highest leopard density, wild elephants, sloth bears, and crocodiles via open 4x4 jeep.',
    fullDescription:
      'Yala National Park Block 1 is globally renowned for possessing the highest recorded leopard density on earth. Travel smoothly along the Southern Expressway directly to the wilderness borders of Tissamaharama. Board an elevated 4x4 open-top safari jeep to track the elusive Sri Lankan leopard (Panthera pardus kotiya), majestic Asian elephants, sloth bears, crocodiles, and painted storks across coastal lagoons and granite rock outcrops.',
    heroImage: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80',
      '/assets/images/hero_galle_taxi_1793121940996.jpg',
    ],
    vehiclePrices: [
      {
        id: 'sedan',
        name: 'Executive Sedan',
        category: 'Toyota Premio / Allion / Prius',
        passengers: '1–3 Passengers',
        maxPassengers: 3,
        luggage: '2 Medium Bags',
        priceUsd: 120,
        highlight: 'Quiet high-speed expressway cruiser',
      },
      {
        id: 'suv',
        name: 'Comfort SUV',
        category: 'Toyota Rush / Honda Vezel',
        passengers: '1–4 Passengers',
        maxPassengers: 4,
        luggage: '3 Large Bags',
        priceUsd: 140,
        highlight: 'Plush seats and superior visibility',
        badge: 'Recommended',
      },
      {
        id: 'kdh-flat-roof',
        name: 'KDH Flat Roof Van',
        category: 'Toyota KDH Flat Roof',
        passengers: '4–6 Passengers',
        maxPassengers: 6,
        luggage: '6 Large Bags',
        priceUsd: 160,
        highlight: 'Comfortable long-haul transit for families',
      },
      {
        id: 'kdh-high-roof',
        name: 'KDH High Roof Van',
        category: 'Toyota KDH High Roof VIP',
        passengers: '6–9 Passengers',
        maxPassengers: 9,
        luggage: '9 Large Bags',
        priceUsd: 185,
        highlight: 'Premium executive group comfort with dual AC',
        badge: 'VIP Choice',
      },
    ],
    highlights: [
      {
        title: 'World-Class Leopard Spotting',
        description: 'Yala Block 1 has the world’s dense population of wild leopards, frequently spotted lounging on granite rocks.',
      },
      {
        title: 'Sri Lankan Sloth Bears & Elephants',
        description: 'Encounter elusive sloth bears foraging for palu fruit, wild elephant herds, and spotted deer.',
      },
      {
        title: 'Elevated 4x4 Open Safari Jeep',
        description: 'Customized safari vehicle with high-clearance open sides and dedicated local ranger driver.',
      },
      {
        title: 'Coastal Dunes & Patanangala Beach',
        description: 'See where wild jungles meet the wild Indian Ocean along dramatic sand dunes and lagoons.',
      },
      {
        title: 'Fast Expressway Highway Transit',
        description: 'Smooth 2-hour transfer via Southern Expressway E01, avoiding congested rural routes.',
      },
    ],
    itinerary: [
      {
        time: '04:30 AM',
        title: 'Early Morning Hotel Pickup',
        description: 'Depart Galle or southern coast early to reach the park entrance in time for optimal morning wildlife activity.',
      },
      {
        time: '07:15 AM',
        title: 'Tissamaharama Jeep Transfer',
        description: 'Meet your private 4x4 safari jeep driver and transfer your day bags into the safari vehicle.',
      },
      {
        time: '07:30 – 11:30 AM',
        title: 'Yala National Park Safari Drive (Block 1)',
        description: '4-hour immersive expedition tracking big cats, elephants, bears, crocodiles, and hornbills.',
      },
      {
        time: '12:00 – 01:30 PM',
        title: 'Lakeside Lunch at Tissamaharama',
        description: 'Relax after the safari with fresh lunch overlooking historic Tissa Wewa lake.',
      },
      {
        time: '02:00 – 04:30 PM',
        title: 'Expressway Return to Hotel',
        description: 'Rest comfortably in your air-conditioned car as we return to your resort.',
      },
    ],
    included: [
      'Private air-conditioned car or van transfer roundtrip from hotel',
      'Fuel, highway tolls, and driver allowances included',
      'Assistance arranging authorized private 4x4 open safari jeep',
      'Bottled drinking water',
    ],
    excluded: [
      'Yala National Park entrance tickets (~$35 USD per adult paid at gate)',
      'Private 4x4 open safari jeep hire (~$50–$65 USD per vehicle)',
      'Lunch and beverages',
      'Driver gratuity',
    ],
    importantInfo: [
      'National park entry tickets and safari jeep hire are paid directly at park entrance (our chauffeur arranges everything smoothly).',
      'Early morning start is essential for top predator sightings before midday heat.',
      'Neutral earth-toned clothing recommended.',
    ],
    cancellationPolicy: 'Free cancellation up to 24 hours before pickup with full refund.',
    mapQuery: 'Yala+National+Park,Sri+Lanka',
    seo: {
      title: 'Yala National Park Safari Day Tour from Galle | Galle Taxi',
      description: 'Private safari day excursion from Galle to Yala National Park. Track leopards & wild elephants. Private roundtrip car from $120.',
      keywords: 'Yala safari from Galle, private taxi Galle to Yala, Yala day tour Sri Lanka, leopard safari private driver',
    },
  },
  {
    id: 'bentota-madu-river',
    slug: 'bentota-madu-river-experience',
    title: 'Bentota & Madu River Experience',
    shortTitle: 'Bentota & Madu River',
    duration: '8–10 Hours',
    startingLocation: 'Galle, Unawatuna, Hikkaduwa, or Bentota',
    rating: 4.94,
    reviewCount: 88,
    badge: 'River & Coast',
    isPublished: true,
    pickupLocations: [
      'Galle / Unawatuna',
      'Hikkaduwa',
      'Bentota / Aluthgama',
      'Ahangama',
    ],
    shortDescription:
      'Mangrove boat safari on Madu River, cinnamon island demonstration, sea turtle conservation sanctuary, and watersports at Bentota beach.',
    fullDescription:
      'Discover the tranquil waterways, lush biodiversity, and coastal charms of Sri Lanka’s southwest. Glide through dense mangrove tunnels on a private Madu Ganga boat safari, witness age-old cinnamon peeling on an isolated island, receive fish therapy, release endangered baby sea turtles at a licensed conservation hatchery, and visit historic Brief Garden or relax on golden Bentota beach.',
    heroImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
      '/assets/images/service_galle_tour_1793121943026.jpg',
      'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80',
      '/assets/images/hero_galle_taxi_1793121940996.jpg',
    ],
    vehiclePrices: [
      {
        id: 'sedan',
        name: 'Executive Sedan',
        category: 'Toyota Premio / Allion / Prius',
        passengers: '1–3 Passengers',
        maxPassengers: 3,
        luggage: '2 Medium Bags',
        priceUsd: 85,
        highlight: 'Comfortable day touring for couples',
      },
      {
        id: 'suv',
        name: 'Comfort SUV',
        category: 'Toyota Rush / Honda Vezel',
        passengers: '1–4 Passengers',
        maxPassengers: 4,
        luggage: '3 Large Bags',
        priceUsd: 100,
        highlight: 'Great visibility for coastal roads',
        badge: 'Popular',
      },
      {
        id: 'kdh-flat-roof',
        name: 'KDH Flat Roof Van',
        category: 'Toyota KDH Flat Roof',
        passengers: '4–6 Passengers',
        maxPassengers: 6,
        luggage: '6 Large Bags',
        priceUsd: 120,
        highlight: 'Ideal for family groups with children',
      },
      {
        id: 'kdh-high-roof',
        name: 'KDH High Roof Van',
        category: 'Toyota KDH High Roof VIP',
        passengers: '6–9 Passengers',
        maxPassengers: 9,
        luggage: '9 Large Bags',
        priceUsd: 140,
        highlight: 'Spacious group van with ample headroom',
        badge: 'Spacious',
      },
    ],
    highlights: [
      {
        title: 'Madu Ganga Mangrove River Safari',
        description: '2-hour covered boat safari through 64 islands, biological mangrove caves, and monkey habitats.',
      },
      {
        title: 'Cinnamon Island Artisan Demonstration',
        description: 'Step onto a river island to observe master craftsmen strip pure Ceylon cinnamon bark by hand.',
      },
      {
        title: 'Sea Turtle Hatchery & Conservation',
        description: 'Touch and support rescued Green, Hawksbill, and Olive Ridley sea turtles at Kosgoda sanctuary.',
      },
      {
        title: 'Natural Fish Spa Experience',
        description: 'Dip your feet into open river water enclosures for a natural and ticklish fish therapy session.',
      },
      {
        title: 'Bentota Golden Sand Beach',
        description: 'Relax at one of Sri Lanka’s premier wide golden sand beaches with optional watersports.',
      },
    ],
    itinerary: [
      {
        time: '08:30 AM',
        title: 'Hotel Pickup',
        description: 'Chauffeur picks you up from your hotel in Galle or nearby coastal areas.',
      },
      {
        time: '09:30 – 11:30 AM',
        title: 'Madu River Mangrove Boat Cruise',
        description: 'Explore the wetlands, visit the Cinnamon Island, temple island, and natural river fish spa.',
      },
      {
        time: '12:00 – 12:45 PM',
        title: 'Kosgoda Sea Turtle Conservation Project',
        description: 'Learn about marine turtle conservation and observe newly hatched baby turtles.',
      },
      {
        time: '01:00 – 02:30 PM',
        title: 'Bentota Riverfront Lunch',
        description: 'Enjoy fresh river fish or seafood lunch overlooking the lagoon.',
      },
      {
        time: '02:45 – 04:15 PM',
        title: 'Bentota Beach or Watersports',
        description: 'Leisure time on the golden sands of Bentota or optional jet-ski / banana boat rides.',
      },
      {
        time: '04:30 – 05:30 PM',
        title: 'Coastal Return Drive',
        description: 'Scenic drive along the palm-lined southwest coast back to your hotel.',
      },
    ],
    included: [
      'Private air-conditioned vehicle for 8–10 hours',
      'Professional English-speaking driver',
      'Fuel, highway tolls, and parking clearances',
      'Door-to-door hotel transfers',
      'Bottled drinking water',
    ],
    excluded: [
      'Madu River boat hire (~$20–$25 USD for the entire private boat)',
      'Turtle hatchery entrance ticket (~$5 USD per person)',
      'Lunch, drinks, and personal watersports',
      'Driver gratuity',
    ],
    importantInfo: [
      'Bring camera, sun protection, sunglasses, and comfortable footwear.',
      'Private boat safari tickets are settled directly at the boat pier.',
      'Perfect family-friendly tour suitable for all ages.',
    ],
    cancellationPolicy: 'Free cancellation up to 24 hours before pickup for a full refund.',
    mapQuery: 'Bentota,Sri+Lanka',
    seo: {
      title: 'Bentota & Madu River Experience Day Tour | Galle Taxi',
      description: 'Private day tour to Bentota and Madu River from Galle. Mangrove boat safari, cinnamon island & turtle hatchery. Private car from $85.',
      keywords: 'Madu River safari from Galle, Bentota day tour, turtle hatchery Galle, private driver Bentota Sri Lanka',
    },
  },
];

/**
 * Helper to identify matching DayTourProduct for a given booking record
 */
export function findTourForBooking(
  booking?: {
    tourId?: string;
    tourSlug?: string;
    tourTitle?: string;
    destination?: string;
    specialInstructions?: string;
    vehicleCategoryName?: string;
  },
  customTours?: DayTourProduct[]
): DayTourProduct | undefined {
  if (!booking) return undefined;
  const pool = customTours && customTours.length > 0 ? customTours : PRIVATE_DAY_TOURS;

  // 1. Direct tourId or tourSlug match
  if (booking.tourId) {
    const byId = pool.find((t) => t.id === booking.tourId);
    if (byId) return byId;
  }
  if (booking.tourSlug) {
    const bySlug = pool.find((t) => t.slug === booking.tourSlug);
    if (bySlug) return bySlug;
  }
  if (booking.tourTitle) {
    const byTitle = pool.find((t) => t.title.toLowerCase() === booking.tourTitle?.toLowerCase());
    if (byTitle) return byTitle;
  }

  // 2. Destination match
  if (booking.destination) {
    const dest = booking.destination.toLowerCase();
    const byDest = pool.find((t) => {
      const titleLower = t.title.toLowerCase();
      const shortLower = t.shortTitle.toLowerCase();
      return dest.includes(titleLower) || dest.includes(shortLower);
    });
    if (byDest) return byDest;
  }

  // 3. Special instructions match: e.g. "Tour: Galle & South Coast Discovery..."
  if (booking.specialInstructions) {
    const notes = booking.specialInstructions.toLowerCase();
    const byNotes = pool.find((t) => {
      return notes.includes(t.title.toLowerCase()) || notes.includes(t.shortTitle.toLowerCase()) || notes.includes(t.slug.toLowerCase());
    });
    if (byNotes) return byNotes;
  }

  // 4. Vehicle category name match
  if (booking.vehicleCategoryName) {
    const vName = booking.vehicleCategoryName.toLowerCase();
    const byVName = pool.find((t) => vName.includes(t.title.toLowerCase()) || vName.includes(t.shortTitle.toLowerCase()));
    if (byVName) return byVName;
  }

  return undefined;
}

