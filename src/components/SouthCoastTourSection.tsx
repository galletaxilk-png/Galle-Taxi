/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Car,
  CheckCircle2,
  XCircle,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Camera,
  Compass,
  Users,
  Briefcase,
  ShieldCheck,
  Sun,
  Waves,
  Mountain,
  Binoculars,
  Heart,
  ChevronRight,
  Phone,
  Mail,
  User,
  MessageSquare,
  Check,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { CURRENCIES, formatCurrency, formatLKR } from '../lib/fareEngine';
import { GoogleAddressAutocomplete } from './GoogleAddressAutocomplete';
import { dispatchCustomerEmailVoucher } from '../lib/emailService';
import { Booking } from '../types';

export interface DayTourVehiclePricing {
  id: string;
  name: string;
  passengers: string;
  maxPassengers: number;
  luggage: string;
  priceUsd: number;
  highlight: string;
  badge?: string;
}

export interface DayTourItineraryStop {
  time: string;
  title: string;
  desc: string;
}

export interface DayTourHighlight {
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface DayTour {
  id: string;
  tag: string;
  tagColor: string;
  title: string;
  shortName: string;
  routeSummary: string;
  duration: string;
  defaultTime: string;
  description: string;
  pickupLocations: string[];
  vehicles: DayTourVehiclePricing[];
  highlights: DayTourHighlight[];
  itinerary: DayTourItineraryStop[];
  inclusions: string[];
  exclusions: string[];
}

export const DAY_TOURS: DayTour[] = [
  {
    id: 'galle-south-coast',
    tag: 'Signature Coast & Heritage',
    tagColor: 'text-[#F5B91B] bg-[#F5B91B]/10 border-[#F5B91B]/30',
    title: 'Galle & South Coast Discovery',
    shortName: 'Galle & South Coast',
    routeSummary: 'Galle Fort • Rumassala • Unawatuna • Koggala • Ahangama',
    duration: '8–9 Hours',
    defaultTime: '08:30',
    description:
      'Explore the historic streets of Galle Fort, enjoy panoramic coastal views from Rumassala, relax at Unawatuna Beach and discover the traditional stilt-fishing culture near Koggala. This route is exceptionally practical and rewarding as a one-day coastal tour.',
    pickupLocations: [
      'Galle (Fort / Hotel / Villa)',
      'Unawatuna (Beach / Resort)',
      'Ahangama (Hotel / Surf Camp)',
      'Thalpe / Koggala',
      'Mirissa / Weligama (Flexible pickup)',
    ],
    vehicles: [
      {
        id: 'sedan',
        name: 'Sedan',
        passengers: '1–3 passengers',
        maxPassengers: 3,
        luggage: 'Small luggage',
        priceUsd: 55,
        highlight: 'Couples & Solo Explorers',
      },
      {
        id: 'suv',
        name: 'SUV',
        passengers: '1–4 passengers',
        maxPassengers: 4,
        luggage: 'Extra comfort',
        priceUsd: 70,
        highlight: 'Premium Comfort & Views',
        badge: 'Popular',
      },
      {
        id: 'van',
        name: 'KDH Flat Roof Van',
        passengers: '4–6 passengers',
        maxPassengers: 6,
        luggage: 'Families and groups',
        priceUsd: 80,
        highlight: 'Great for Families',
      },
      {
        id: 'kdh-high-roof',
        name: 'KDH High Roof Van',
        passengers: '6–9 passengers',
        maxPassengers: 9,
        luggage: 'Spacious group travel',
        priceUsd: 95,
        highlight: 'Large Groups & Luggage',
        badge: 'Spacious',
      },
    ],
    highlights: [
      {
        title: 'Galle Fort Ramparts',
        desc: 'Historic ramparts, 1939 lighthouse, cobblestone Dutch colonial streets, and photo stops.',
        icon: Compass,
      },
      {
        title: 'Japanese Peace Pagoda',
        desc: 'Panoramic ocean views from Rumassala headland, peaceful Buddhist shrine, and jungle sanctuary.',
        icon: Sun,
      },
      {
        title: 'Unawatuna Beach',
        desc: 'Tropical golden beach scenery, calm turquoise bay, swimming, and relaxed beachfront café dining.',
        icon: Waves,
      },
      {
        title: 'Koggala Stilt Fishermen',
        desc: 'Witness and photograph the iconic traditional Sri Lankan stilt fishing ritual perched above the waves.',
        icon: Camera,
      },
      {
        title: 'Scenic Coastal Drive',
        desc: 'Explore the southern coastline with flexible stops for fresh king coconuts, spice stalls, and viewpoints.',
        icon: Car,
      },
    ],
    itinerary: [
      {
        time: '08:30 AM',
        title: 'Hotel Pickup',
        desc: 'Pickup directly from your hotel or villa in Galle, Unawatuna, or Ahangama.',
      },
      {
        time: '09:00 – 11:00 AM',
        title: 'Explore Galle Fort',
        desc: 'Walk the historic ramparts, see the lighthouse, visit boutique cafes, and explore Dutch colonial heritage.',
      },
      {
        time: '11:30 AM – 12:15 PM',
        title: 'Rumassala Peace Pagoda',
        desc: 'Enjoy panoramic ocean views across Galle Bay and tranquil temple surroundings.',
      },
      {
        time: '12:30 – 02:00 PM',
        title: 'Unawatuna Beach and Lunch',
        desc: 'Relax by the beach and enjoy fresh seafood or local cuisine at your own expense.',
      },
      {
        time: '02:30 – 03:15 PM',
        title: 'Koggala Stilt-Fishing Viewpoint',
        desc: 'Take photographs and experience authentic southern Sri Lankan coastal culture.',
      },
      {
        time: '03:30 – 05:00 PM',
        title: 'Scenic Return & Drop-Off',
        desc: 'Optional short photo stop, subject to time, followed by safe return to your hotel.',
      },
    ],
    inclusions: [
      'Private air-conditioned vehicle for 8–9 hours',
      'Professional English-speaking driver and fuel included',
      'Flexible hotel pickup and drop-off (Galle, Unawatuna, Ahangama)',
      'Agreed sightseeing route with flexible stops',
      'Standard parking charges and highway clearances',
    ],
    exclusions: [
      'Lunch, snacks, and drinks',
      'Paid museum tickets or temple donations',
      'Optional activities and water sports',
      'Paid site-licensed tour guides (chauffeur provides route assistance)',
      'Personal expenses and gratuities',
    ],
  },
  {
    id: 'mirissa-weligama-sunset',
    tag: 'Sunset, Surf & Scenic Bays',
    tagColor: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    title: 'Mirissa, Weligama & Coconut Tree Hill Sunset Tour',
    shortName: 'Mirissa & Coconut Hill',
    routeSummary: 'Weligama Bay • Mirissa Harbor • Coconut Tree Hill • Secret Beach • Virgin Tea',
    duration: '7–8 Hours',
    defaultTime: '11:00',
    description:
      'Experience the relaxed vibe of Weligama Bay, swim at secluded Secret Beach, capture iconic golden hour photos at Coconut Tree Hill, and visit the renowned Handunugoda Virgin White Tea Estate.',
    pickupLocations: [
      'Galle / Unawatuna',
      'Ahangama / Midigama',
      'Weligama Bay',
      'Mirissa Town / Beach',
      'Koggala / Thalpe',
    ],
    vehicles: [
      {
        id: 'sedan',
        name: 'Sedan',
        passengers: '1–3 passengers',
        maxPassengers: 3,
        luggage: 'Small luggage',
        priceUsd: 50,
        highlight: 'Couples & Solo Explorers',
      },
      {
        id: 'suv',
        name: 'SUV',
        passengers: '1–4 passengers',
        maxPassengers: 4,
        luggage: 'Extra comfort',
        priceUsd: 65,
        highlight: 'Scenic Comfort & Views',
        badge: 'Popular',
      },
      {
        id: 'van',
        name: 'KDH Flat Roof Van',
        passengers: '4–6 passengers',
        maxPassengers: 6,
        luggage: 'Families and groups',
        priceUsd: 75,
        highlight: 'Great for Families',
      },
      {
        id: 'kdh-high-roof',
        name: 'KDH High Roof Van',
        passengers: '6–9 passengers',
        maxPassengers: 9,
        luggage: 'Spacious group travel',
        priceUsd: 90,
        highlight: 'Large Groups & Luggage',
        badge: 'Spacious',
      },
    ],
    highlights: [
      {
        title: 'Coconut Tree Hill',
        desc: 'Sri Lanka’s most photographed palm-tree headland overlooking the Indian Ocean.',
        icon: Camera,
      },
      {
        title: 'Secret Beach Mirissa',
        desc: 'Hidden tropical cove with crystal-clear turquoise waters and tidal rock pools.',
        icon: Waves,
      },
      {
        title: 'Weligama Bay Surf Scene',
        desc: 'Vibrant coastal surf atmosphere, artisan beachfront cafes, and catamarans.',
        icon: Sun,
      },
      {
        title: 'Handunugoda Tea Estate',
        desc: 'Famous low-country estate known for untouched Virgin White Tea and spice gardens.',
        icon: Compass,
      },
      {
        title: 'Mirissa Harbor & Sunset',
        desc: 'Watch the sun sink into the ocean with fresh king coconuts or seaside dinner.',
        icon: Sparkles,
      },
    ],
    itinerary: [
      {
        time: '11:00 AM',
        title: 'Hotel Pickup',
        desc: 'Leisurely late-morning pickup along the southern coast.',
      },
      {
        time: '11:45 AM – 01:15 PM',
        title: 'Handunugoda Virgin White Tea Estate',
        desc: 'Complimentary tea tasting, guided factory stroll, and cinnamon garden walk.',
      },
      {
        time: '01:30 – 03:00 PM',
        title: 'Weligama Bay & Coastal Lunch',
        desc: 'Watch beginner surfers, stroll the sandy bay, and enjoy seaside lunch at your own pace.',
      },
      {
        time: '03:30 – 04:45 PM',
        title: 'Mirissa Secret Beach',
        desc: 'Relax in a secluded tropical lagoon away from crowds.',
      },
      {
        time: '05:00 – 06:15 PM',
        title: 'Coconut Tree Hill Golden Hour',
        desc: 'Breathtaking 360-degree sunset ocean panorama and iconic photographs.',
      },
      {
        time: '06:30 – 07:15 PM',
        title: 'Evening Return Drop-off',
        desc: 'Smooth return ride to your hotel or drop-off at a Mirissa beachfront restaurant.',
      },
    ],
    inclusions: [
      'Private air-conditioned vehicle for 7–8 hours',
      'Professional driver & fuel included',
      'Hotel pickup and drop-off in southern coastal hubs',
      'Handunugoda Tea Estate visit coordination',
      'Standard parking fees and tolls',
    ],
    exclusions: [
      'Lunch, dinner, and drinks',
      'Optional tuk-tuk transfer into Secret Beach rocky track (approx $2-$3)',
      'Personal expenses and gratuities',
    ],
  },
  {
    id: 'yala-national-park-safari',
    tag: 'Big Cats & Wild Safari',
    tagColor: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
    title: 'Yala National Park Safari Day Excursion',
    shortName: 'Yala Safari Excursion',
    routeSummary: 'Southern Coast → Expressway direct → Yala Block 1 → Tissamaharama',
    duration: '12–14 Hours',
    defaultTime: '04:30',
    description:
      'A thrilling full-day wildlife expedition into Sri Lanka’s premier national park. Experience world-famous leopard density, herds of wild elephants, sloth bears, spotted deer, and vibrant avian species via private 4x4 Jeep.',
    pickupLocations: [
      'Galle / Unawatuna (04:30 AM)',
      'Ahangama / Weligama (04:45 AM)',
      'Mirissa (05:00 AM)',
      'Tangalle / Hambantota (05:30 AM)',
    ],
    vehicles: [
      {
        id: 'sedan',
        name: 'Sedan',
        passengers: '1–3 passengers',
        maxPassengers: 3,
        luggage: 'Small luggage',
        priceUsd: 95,
        highlight: 'Couples & Solo Explorers',
      },
      {
        id: 'suv',
        name: 'SUV',
        passengers: '1–4 passengers',
        maxPassengers: 4,
        luggage: 'Extra comfort for long road',
        priceUsd: 120,
        highlight: 'Smooth Highway Cruise',
        badge: 'Recommended',
      },
      {
        id: 'van',
        name: 'KDH Flat Roof Van',
        passengers: '4–6 passengers',
        maxPassengers: 6,
        luggage: 'Families and groups',
        priceUsd: 135,
        highlight: 'Spacious for Families',
      },
      {
        id: 'kdh-high-roof',
        name: 'KDH High Roof Van',
        passengers: '6–9 passengers',
        maxPassengers: 9,
        luggage: 'Spacious group travel',
        priceUsd: 160,
        highlight: 'Large Groups',
        badge: 'Group Choice',
      },
    ],
    highlights: [
      {
        title: 'Highest Leopard Density',
        desc: 'Yala Block 1 has one of the highest recorded leopard densities on earth.',
        icon: Binoculars,
      },
      {
        title: 'Wild Asian Elephants',
        desc: 'Spot herds feeding by waterholes and traversing scrub forest tracks.',
        icon: Heart,
      },
      {
        title: 'Open-Top 4x4 Safari Track',
        desc: 'Customized open safari jeep with elevated viewing seats and expert wildlife driver.',
        icon: Car,
      },
      {
        title: 'Expressway Direct Transfer',
        desc: 'Quick, smooth journey via Southern Expressway direct to Tissamaharama gate.',
        icon: Clock,
      },
      {
        title: 'Diverse Ecosystems',
        desc: 'Monsoon forests, coastal lagoons, sand dunes, and ancient rocky outcrops.',
        icon: Mountain,
      },
    ],
    itinerary: [
      {
        time: '04:30 AM',
        title: 'Early Morning Hotel Pickup',
        desc: 'Prompt pickup with air-conditioned vehicle. Grab a breakfast box from your hotel.',
      },
      {
        time: '07:30 AM',
        title: 'Tissamaharama Briefing & Jeep Boarding',
        desc: 'Switch into your reserved private 4x4 safari jeep with open viewing roof.',
      },
      {
        time: '08:00 AM – 12:30 PM',
        title: 'Morning Game Drive (Yala Block 1)',
        desc: 'Track leopards, elephants, crocodiles, hornbills, and deer through prime trails.',
      },
      {
        time: '01:00 – 02:00 PM',
        title: 'Lunch Break & Rest',
        desc: 'Enjoy lunch by Tissa Lake or a tranquil wilderness lodge restaurant.',
      },
      {
        time: '02:30 – 05:00 PM',
        title: 'Afternoon Safari / Lake Viewpoint',
        desc: 'Secondary wildlife drive or birdwatching around Wirawila / Debarawewa wetlands.',
      },
      {
        time: '05:30 – 08:00 PM',
        title: 'Highway Return & Hotel Drop-off',
        desc: 'Comfortable air-conditioned expressway drive back to your resort.',
      },
    ],
    inclusions: [
      'Private air-conditioned car or van transfer roundtrip',
      'Expressway toll charges and fuel included',
      'Professional chauffeur for full 12–14 hour journey',
      'Assistance arranging licensed private 4x4 Safari Jeep',
      'Flexible return timing based on your wildlife sightings',
    ],
    exclusions: [
      'Yala National Park entrance tickets (approx $35/person paid at gate)',
      '4x4 Open Safari Jeep hire (approx $45–$60 per vehicle paid to jeep driver)',
      'Meals, drinks, and personal expenses',
    ],
  },
  {
    id: 'udawalawe-elephant-safari',
    tag: 'Elephants in Natural Habitat',
    tagColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    title: 'Udawalawe Elephant Sanctuary & Transit Home',
    shortName: 'Udawalawe Elephant Tour',
    routeSummary: 'Galle / South Coast → Embilipitiya → Udawalawe National Park & ETH',
    duration: '9–10 Hours',
    defaultTime: '06:30',
    description:
      'Guaranteed wild elephant sightings! Visit the heartwarming Elephant Transit Home (ETH) baby elephant milk feeding session, followed by an unforgettable 3-hour open-top 4x4 safari across Udawalawe’s savannah and reservoir.',
    pickupLocations: [
      'Galle / Unawatuna (06:30 AM)',
      'Ahangama / Weligama (06:45 AM)',
      'Mirissa (07:00 AM)',
      'Hikkaduwa / Bentota (06:00 AM)',
    ],
    vehicles: [
      {
        id: 'sedan',
        name: 'Sedan',
        passengers: '1–3 passengers',
        maxPassengers: 3,
        luggage: 'Small luggage',
        priceUsd: 75,
        highlight: 'Couples & Solo Explorers',
      },
      {
        id: 'suv',
        name: 'SUV',
        passengers: '1–4 passengers',
        maxPassengers: 4,
        luggage: 'Extra comfort',
        priceUsd: 95,
        highlight: 'Smooth Countryside Ride',
        badge: 'Popular',
      },
      {
        id: 'van',
        name: 'KDH Flat Roof Van',
        passengers: '4–6 passengers',
        maxPassengers: 6,
        luggage: 'Families and groups',
        priceUsd: 110,
        highlight: 'Great for Families',
      },
      {
        id: 'kdh-high-roof',
        name: 'KDH High Roof Van',
        passengers: '6–9 passengers',
        maxPassengers: 9,
        luggage: 'Spacious group travel',
        priceUsd: 130,
        highlight: 'Large Family Groups',
        badge: 'Spacious',
      },
    ],
    highlights: [
      {
        title: 'Elephant Transit Home (ETH)',
        desc: 'Watch rescued baby orphan elephants enthusiastically fed milk before wild rehabilitation.',
        icon: Heart,
      },
      {
        title: 'Guaranteed Wild Elephants',
        desc: 'Home to over 500 wild elephants in an open savannah reminiscent of East Africa.',
        icon: Binoculars,
      },
      {
        title: 'Udawalawe Reservoir',
        desc: 'Picturesque man-made lake framed by mountain ridges and water buffaloes.',
        icon: Waves,
      },
      {
        title: 'Family & Child Friendly',
        desc: 'Gentler tracks, closer wildlife encounters, and shorter drive times than Yala.',
        icon: Users,
      },
      {
        title: 'Scenic Countryside Drive',
        desc: 'Travel through rural paddy fields, coconut groves, and southern farming villages.',
        icon: Compass,
      },
    ],
    itinerary: [
      {
        time: '06:30 AM',
        title: 'Hotel Pickup',
        desc: 'Early morning departure through scenic Southern inland roads.',
      },
      {
        time: '09:30 – 10:30 AM',
        title: 'Elephant Transit Home (ETH)',
        desc: 'Attend the morning milk-feeding presentation and watch baby elephants frolic.',
      },
      {
        time: '10:45 AM – 01:45 PM',
        title: 'Udawalawe 4x4 Safari Game Drive',
        desc: 'Traverse the grasslands to see large herds of elephants, eagles, peacocks, and water buffalo.',
      },
      {
        time: '02:00 – 03:00 PM',
        title: 'Authentic Village Lunch',
        desc: 'Enjoy authentic Sri Lankan clay-pot rice & curry at a local countryside restaurant.',
      },
      {
        time: '03:15 – 05:30 PM',
        title: 'Comfortable Hotel Return',
        desc: 'Relax in your air-conditioned vehicle as we drive back to your coastal resort.',
      },
    ],
    inclusions: [
      'Private air-conditioned vehicle for 9–10 hours',
      'Chauffeur, fuel, and highway tolls included',
      'Roundtrip door-to-door hotel transfers',
      'Assistance booking authorized park 4x4 safari jeep',
      'Flexible stops for refreshments and photos',
    ],
    exclusions: [
      'Udawalawe National Park entrance tickets (approx $30/person)',
      'Elephant Transit Home entry (approx $5/person)',
      '4x4 Safari Jeep hire (approx $40–$50 per vehicle)',
      'Lunch and beverages',
    ],
  },
  {
    id: 'ella-scenic-highlands',
    tag: 'Misty Mountains & Colonial Rails',
    tagColor: 'text-teal-400 bg-teal-400/10 border-teal-400/30',
    title: 'Ella Scenic Highlands & Nine Arch Bridge Day Tour',
    shortName: 'Ella Scenic Highlands',
    routeSummary: 'Southern Coast → Ravana Falls → Nine Arch Bridge → Little Adam’s Peak → Tea Factory',
    duration: '11–13 Hours',
    defaultTime: '05:30',
    description:
      'Ascend from the golden southern coast up into Sri Lanka’s lush emerald highlands. Walk across the architectural marvel of the Nine Arch Bridge, hike Little Adam’s Peak for panoramic valley vistas, stand beside Ravana Falls, and tour a working Ceylon tea factory.',
    pickupLocations: [
      'Galle / Unawatuna (05:30 AM)',
      'Ahangama / Weligama (05:45 AM)',
      'Mirissa / Matara (06:00 AM)',
      'Tangalle / Hambantota (06:30 AM)',
    ],
    vehicles: [
      {
        id: 'sedan',
        name: 'Sedan',
        passengers: '1–3 passengers',
        maxPassengers: 3,
        luggage: 'Small luggage',
        priceUsd: 85,
        highlight: 'Couples & Solo Explorers',
      },
      {
        id: 'suv',
        name: 'SUV',
        passengers: '1–4 passengers',
        maxPassengers: 4,
        luggage: 'Extra comfort for hills',
        priceUsd: 110,
        highlight: 'Ideal for Mountain Curves',
        badge: 'Recommended',
      },
      {
        id: 'van',
        name: 'KDH Flat Roof Van',
        passengers: '4–6 passengers',
        maxPassengers: 6,
        luggage: 'Families and groups',
        priceUsd: 125,
        highlight: 'Comfortable Group Climb',
      },
      {
        id: 'kdh-high-roof',
        name: 'KDH High Roof Van',
        passengers: '6–9 passengers',
        maxPassengers: 9,
        luggage: 'Spacious group travel',
        priceUsd: 150,
        highlight: 'Spacious Group Touring',
        badge: 'Spacious',
      },
    ],
    highlights: [
      {
        title: 'Nine Arch Bridge',
        desc: 'Iconic British colonial stone viaduct spanning dense jungle canopy in Ella.',
        icon: Camera,
      },
      {
        title: 'Little Adam’s Peak Hike',
        desc: 'Gentle 45-minute hike through tea bushes rewarding you with 360-degree mountain gap views.',
        icon: Mountain,
      },
      {
        title: 'Ravana Waterfall',
        desc: 'One of Sri Lanka’s widest cascades tumbling dramatically beside the mountain pass.',
        icon: Waves,
      },
      {
        title: 'Ceylon Tea Factory Tour',
        desc: 'Smell freshly processed black tea leaves and discover traditional orthodox tea production.',
        icon: Sun,
      },
      {
        title: 'Cool Mountain Climate',
        desc: 'A refreshing change of weather from the tropical coast into mist-covered peaks.',
        icon: Sparkles,
      },
    ],
    itinerary: [
      {
        time: '05:30 AM',
        title: 'Early Morning Hotel Pickup',
        desc: 'Depart the coast and enjoy the dramatic elevation climb up into Uva province.',
      },
      {
        time: '08:45 – 09:30 AM',
        title: 'Ravana Falls & Breakfast Stop',
        desc: 'Marvel at the cascading falls and enjoy morning tea overlooking the ravine.',
      },
      {
        time: '10:00 AM – 12:00 PM',
        title: 'Demodara Nine Arch Bridge',
        desc: 'Walk across the historic tracks and time your visit to watch the blue mountain train pass.',
      },
      {
        time: '12:30 – 01:45 PM',
        title: 'Ella Gap Lunch',
        desc: 'Dine at an Ella hilltop cafe with breathtaking panoramic views across the gorge.',
      },
      {
        time: '02:00 – 03:30 PM',
        title: 'Little Adam’s Peak Panoramic Hike',
        desc: 'Easy-to-moderate trail offering sensational vistas of Ella Rock and southern plains.',
      },
      {
        time: '03:45 – 04:45 PM',
        title: 'Highland Tea Factory & Tasting',
        desc: 'Tour a working tea estate and sample graded Ceylon Orange Pekoe tea.',
      },
      {
        time: '05:00 – 08:30 PM',
        title: 'Smooth Descent Return',
        desc: 'Descent via expressway/highways back to your southern coastal resort.',
      },
    ],
    inclusions: [
      'Private air-conditioned car or van with experienced hill-country chauffeur',
      'All vehicle fuel, highway tolls, and mountain road clearances',
      'Full day roundtrip door-to-door service',
      'Flexible photo and restroom stops across the mountain passes',
      'Expert advice on train crossing times at the bridge',
    ],
    exclusions: [
      'Meals, snacks, and personal beverages',
      'Tea factory admission/tasting ticket (approx $3-$5)',
      'Optional Zip-line or Flying Ravana adventure activities',
      'Personal expenses and gratuities',
    ],
  },
];

export const SouthCoastTourSection: React.FC = () => {
  const { currency, createBooking, siteSettings } = useApp();

  // Active tour state from DAY_TOURS
  const [activeTourId, setActiveTourId] = useState<string>('galle-south-coast');
  const activeTour = DAY_TOURS.find((t) => t.id === activeTourId) || DAY_TOURS[0];

  // 3-Step Interactive Booking State
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1);

  // Step 1: Vehicle & Pricing
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('sedan');

  // Step 2: Schedule & Pickup Location
  const [pickupMode, setPickupMode] = useState<'preset' | 'custom'>('preset');
  const [presetPickup, setPresetPickup] = useState<string>(activeTour.pickupLocations[0]);
  const [customAddress, setCustomAddress] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [pickupTime, setPickupTime] = useState<string>(activeTour.defaultTime);

  // Step 3: Passenger Details
  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [passengerCount, setPassengerCount] = useState<number>(2);
  const [luggageCount, setLuggageCount] = useState<number>(2);
  const [specialNotes, setSpecialNotes] = useState<string>('');

  // Submission & Confirmation state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);

  // Switch tour handler
  const handleSwitchTour = (tourId: string) => {
    setActiveTourId(tourId);
    const targetTour = DAY_TOURS.find((t) => t.id === tourId);
    if (targetTour) {
      setPresetPickup(targetTour.pickupLocations[0]);
      setPickupTime(targetTour.defaultTime);
      if (!targetTour.vehicles.some((v) => v.id === selectedVehicleId)) {
        setSelectedVehicleId('sedan');
      }
    }
  };

  const selectedVehicle =
    activeTour.vehicles.find((v) => v.id === selectedVehicleId) || activeTour.vehicles[0];

  // Converted prices
  const formatTourPrice = (usdPrice: number) => {
    if (currency === 'USD') {
      return `$${usdPrice}`;
    }
    const lkrEquivalent = usdPrice * CURRENCIES.USD.rateToLkr;
    return formatCurrency(lkrEquivalent, currency);
  };

  const getEffectivePickup = () => {
    if (pickupMode === 'custom' && customAddress.trim()) {
      return customAddress.trim();
    }
    return presetPickup;
  };

  // Step 1 Validation
  const handleProceedToStep2 = () => {
    setValidationError(null);
    setBookingStep(2);
    const bookingWidget = document.getElementById('tour-booking-widget');
    if (bookingWidget) {
      bookingWidget.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Step 2 Validation
  const handleProceedToStep3 = () => {
    setValidationError(null);
    const effectivePickup = getEffectivePickup();
    if (!effectivePickup || effectivePickup.trim().length < 3) {
      setValidationError('Please select or enter your hotel or pickup location.');
      return;
    }
    if (!selectedDate) {
      setValidationError('Please choose a valid tour departure date.');
      return;
    }
    if (!pickupTime) {
      setValidationError('Please specify your morning pickup time.');
      return;
    }
    setBookingStep(3);
    const bookingWidget = document.getElementById('tour-booking-widget');
    if (bookingWidget) {
      bookingWidget.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Step 3 Completion: Authoritative Booking Creation
  const handleCompleteBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!customerName.trim() || customerName.trim().length < 2) {
      setValidationError('Please enter your full passenger name.');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (cleanPhone.length < 8) {
      setValidationError('Please enter a valid phone or WhatsApp number with country code (e.g. +94 77 123 4567).');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setValidationError('Please provide a valid email address to receive your confirmation voucher & itinerary.');
      return;
    }

    if (passengerCount > selectedVehicle.maxPassengers) {
      setValidationError(
        `Selected vehicle (${selectedVehicle.name}) accommodates up to ${selectedVehicle.maxPassengers} passengers. Please go back to Step 1 and choose a larger vehicle.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const effectivePickup = getEffectivePickup();
      const fareInLkr = selectedVehicle.priceUsd * CURRENCIES.USD.rateToLkr;

      const specialDetails = [
        `[Private Day Tour: ${activeTour.title}]`,
        `[Duration: ${activeTour.duration}]`,
        `[Selling Rate: $${selectedVehicle.priceUsd} USD]`,
        `[Route: ${activeTour.routeSummary}]`,
        specialNotes.trim() ? `[Notes: ${specialNotes.trim()}]` : '',
      ]
        .filter(Boolean)
        .join(' ');

      // Create booking in database
      const created = await createBooking({
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        pickupLocation: `${effectivePickup} (Hotel / Villa)`,
        destination: `${activeTour.title} (${activeTour.routeSummary})`,
        pickupDate: selectedDate,
        pickupTime,
        vehicleCategoryId: selectedVehicle.id,
        vehicleCategoryName: `${selectedVehicle.name} (${selectedVehicle.highlight})`,
        passengerCount,
        luggageCount,
        specialInstructions: specialDetails,
        estimatedFare: fareInLkr,
      });

      // Dispatch automated voucher email
      try {
        await dispatchCustomerEmailVoucher({
          bookingReference: created.bookingReference,
          customerName: customerName.trim(),
          customerEmail: email.trim(),
          phone: phone.trim(),
          pickupLocation: `${effectivePickup}`,
          destination: `${activeTour.title} (${activeTour.duration})`,
          pickupDate: selectedDate,
          pickupTime,
          vehicleCategoryName: selectedVehicle.name,
          passengerCount,
          luggageCount,
          estimatedFare: fareInLkr,
          specialInstructions: specialDetails,
          dispatcherEmail: siteSettings?.email || 'galletaxi.lk@gmail.com',
          dispatcherPhone: siteSettings?.phone || '+94 77 123 4567',
          dispatcherWhatsapp: siteSettings?.whatsappNumber || '+94771234567',
        });
      } catch (emailErr) {
        console.warn('Voucher email notice:', emailErr);
      }

      setCompletedBooking(created);
      setIsSubmitting(false);

      const bookingWidget = document.getElementById('tour-booking-widget');
      if (bookingWidget) {
        bookingWidget.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      console.error('Booking creation error:', err);
      setValidationError('An unexpected error occurred while saving your booking. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCopyReference = () => {
    if (completedBooking?.bookingReference) {
      navigator.clipboard.writeText(completedBooking.bookingReference);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 3000);
    }
  };

  const handleResetForNewBooking = () => {
    setCompletedBooking(null);
    setBookingStep(1);
    setCustomerName('');
    setPhone('');
    setEmail('');
    setSpecialNotes('');
    setValidationError(null);
  };

  // WhatsApp chauffeur dispatch link
  const generateWhatsAppDispatchLink = (booking: Booking) => {
    const rawWa = siteSettings?.whatsappNumber || '94771234567';
    const cleanWa = rawWa.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello Galle Taxi Dispatch! 🚖\n\nI have confirmed my Private Day Tour reservation:\n\n• Reference: *${booking.bookingReference}*\n• Tour: *${activeTour.title}*\n• Date: *${booking.pickupDate}* at *${booking.pickupTime}*\n• Vehicle: *${selectedVehicle.name}* ($${selectedVehicle.priceUsd} USD)\n• Pickup Location: *${booking.pickupLocation}*\n• Passenger: *${booking.customerName}* (${booking.phone})\n\nPlease confirm our dedicated chauffeur assignment. Thank you!`
    );
    return `https://wa.me/${cleanWa}?text=${message}`;
  };

  return (
    <section id="south-coast-tour" className="py-24 bg-[#0E0E10] border-t border-b border-[#1F1F23]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Section Heading & 5-Tour Switcher Bar */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5B91B]/10 border border-[#F5B91B]/30 text-xs font-bold text-[#F5B91B] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Private Day Tours Catalog (5 Curated Routes)</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-['Outfit']">
                Explore Sri Lanka by Private Day Tour
              </h2>
              <p className="text-slate-400 text-sm sm:text-base max-w-2xl font-light">
                Fixed-price private vehicle day tours with dedicated chauffeurs, flexible hotel pickup, zero hidden fees, and transparent pricing in USD.
              </p>
            </div>

            <div className="text-xs text-slate-400 bg-[#141416] px-4 py-2.5 rounded-xl border border-[#27272A] w-fit">
              <span className="text-emerald-400 font-bold mr-1">✓ 5 Curated Tours</span>
              <span>• Complete Booking in 3 Easy Steps</span>
            </div>
          </div>

          {/* 5-Tour Switcher Tab Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            {DAY_TOURS.map((tour, idx) => {
              const isCurrent = tour.id === activeTour.id;
              const startingPrice = tour.vehicles[0]?.priceUsd || 50;

              return (
                <button
                  key={tour.id}
                  onClick={() => handleSwitchTour(tour.id)}
                  type="button"
                  className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                    isCurrent
                      ? 'bg-[#18181E] border-[#F5B91B] shadow-lg shadow-[#F5B91B]/10 ring-1 ring-[#F5B91B]'
                      : 'bg-[#141416] border-[#27272A] hover:border-slate-700 hover:bg-[#18181B]'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-500 font-bold">
                        TOUR 0{idx + 1}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#F5B91B]" />
                        {tour.duration.split(' ')[0]}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white font-['Outfit'] leading-snug">
                      {tour.shortName}
                    </h3>

                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {tour.routeSummary.split('•')[0]} & more
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#27272A] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block leading-none">From</span>
                      <span className="text-sm font-black text-[#F5B91B] font-mono">
                        {formatTourPrice(startingPrice)}
                      </span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                        isCurrent ? 'bg-[#F5B91B] text-black' : 'bg-[#27272A] text-slate-400'
                      }`}
                    >
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Tour Detailed Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#18181E] via-[#141416] to-[#0E0E10] border border-[#27272A] space-y-6">
          <div className="space-y-4 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${activeTour.tagColor}`}>
                {activeTour.tag}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#1F1F23] text-slate-300 text-xs font-mono font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#F5B91B]" />
                <span>{activeTour.duration}</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-[#1F1F23] text-emerald-400 text-xs font-mono font-medium flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5" />
                <span>Private Dedicated Chauffeur</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-[#1F1F23] text-slate-300 text-xs font-mono font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F5B91B]" />
                <span>All Fuel & Tolls Included</span>
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-['Outfit']">
              {activeTour.title}
            </h3>

            {/* Route summary tags */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300 bg-[#0B0B0D]/80 px-3.5 py-2 rounded-lg border border-[#27272A] w-fit">
              <MapPin className="w-4 h-4 text-[#F5B91B] shrink-0" />
              <span className="font-medium text-slate-200">{activeTour.routeSummary}</span>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
              {activeTour.description}
            </p>
          </div>
        </div>

        {/* STEP 1 - 3 COMPLETE BOOKING FLOW COMPONENT */}
        <div id="tour-booking-widget" className="scroll-mt-12 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1F1F23]">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-['Outfit'] flex items-center gap-2.5">
                <span className="text-[#F5B91B]">Book Tour:</span> {activeTour.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete your private reservation directly in 3 easy steps with instant confirmation voucher.
              </p>
            </div>

            {/* Step Progress Navigation Indicator */}
            {!completedBooking && (
              <div className="flex items-center gap-1.5 bg-[#141416] p-1.5 rounded-xl border border-[#27272A]">
                <button
                  type="button"
                  onClick={() => setBookingStep(1)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    bookingStep === 1
                      ? 'bg-[#F5B91B] text-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black bg-black/20">
                    1
                  </span>
                  <span>Vehicle</span>
                </button>

                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

                <button
                  type="button"
                  onClick={handleProceedToStep2}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    bookingStep === 2
                      ? 'bg-[#F5B91B] text-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black bg-black/20">
                    2
                  </span>
                  <span>Schedule</span>
                </button>

                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

                <button
                  type="button"
                  onClick={handleProceedToStep3}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    bookingStep === 3
                      ? 'bg-[#F5B91B] text-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black bg-black/20">
                    3
                  </span>
                  <span>Confirm</span>
                </button>
              </div>
            )}
          </div>

          {/* Validation Alert */}
          {validationError && (
            <div className="p-4 bg-red-950/80 border border-red-800 rounded-xl flex items-center gap-3 text-red-200 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* SUCCESS SCREEN: BOOKING COMPLETED */}
          {completedBooking ? (
            <div className="p-6 sm:p-10 rounded-2xl bg-[#141416] border border-emerald-500/40 space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#27272A]">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                      Booking Status: Confirmed & Logged
                    </span>
                    <h3 className="text-2xl font-extrabold text-white font-['Outfit']">
                      Day Tour Booking Completed!
                    </h3>
                  </div>
                </div>

                {/* Booking Reference Pill */}
                <div className="bg-[#0B0B0D] border border-[#27272A] p-3 rounded-xl flex items-center gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                      Booking Reference
                    </div>
                    <div className="text-base font-extrabold text-[#F5B91B] font-mono">
                      {completedBooking.bookingReference}
                    </div>
                  </div>
                  <button
                    onClick={handleCopyReference}
                    type="button"
                    className="p-2 rounded-lg bg-[#1F1F23] hover:bg-[#27272A] text-slate-300 hover:text-white text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedRef ? <Check className="w-4 h-4 text-emerald-400" /> : <FileText className="w-4 h-4" />}
                    <span>{copiedRef ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Receipt Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#0B0B0D] border border-[#27272A] space-y-1">
                  <span className="text-[11px] text-slate-500 uppercase font-mono">Selected Day Tour</span>
                  <div className="text-sm font-bold text-white font-['Outfit']">{activeTour.title}</div>
                  <span className="text-[11px] text-[#F5B91B] font-mono">{activeTour.duration}</span>
                </div>

                <div className="p-4 rounded-xl bg-[#0B0B0D] border border-[#27272A] space-y-1">
                  <span className="text-[11px] text-slate-500 uppercase font-mono">Date & Pickup Time</span>
                  <div className="text-sm font-bold text-white font-['Outfit']">
                    {completedBooking.pickupDate}
                  </div>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    Departure at {completedBooking.pickupTime}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#0B0B0D] border border-[#27272A] space-y-1">
                  <span className="text-[11px] text-slate-500 uppercase font-mono">Vehicle & Passengers</span>
                  <div className="text-sm font-bold text-white font-['Outfit']">
                    {selectedVehicle.name}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {completedBooking.passengerCount} Passengers · {completedBooking.luggageCount} Luggage
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#0B0B0D] border border-[#27272A] space-y-1">
                  <span className="text-[11px] text-slate-500 uppercase font-mono">Total Fixed Tour Rate</span>
                  <div className="text-xl font-black text-[#F5B91B] font-mono">
                    ${selectedVehicle.priceUsd} USD
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({formatLKR(completedBooking.estimatedFare)})
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0B0D] border border-[#27272A] space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <MapPin className="w-4 h-4 text-[#F5B91B]" />
                  <span>Pickup Location: {completedBooking.pickupLocation}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <User className="w-4 h-4 text-slate-500" />
                  <span>Lead Passenger: {completedBooking.customerName} ({completedBooking.phone})</span>
                </div>
                {completedBooking.email && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span>Official confirmation voucher emailed to: {completedBooking.email}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#27272A]">
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Chauffeur dispatch details sent via WhatsApp prior to departure.</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <a
                    href={generateWhatsAppDispatchLink(completedBooking)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Open WhatsApp Dispatch</span>
                  </a>

                  <button
                    onClick={handleResetForNewBooking}
                    type="button"
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-[#1F1F23] hover:bg-[#27272A] text-slate-200 text-xs font-bold rounded-xl border border-[#27272A] transition-colors cursor-pointer"
                  >
                    <span>Book Another Tour</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* STEP 1: SELECT VEHICLE */}
              {bookingStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-2 border-b border-[#27272A]">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#F5B91B] text-black font-black flex items-center justify-center text-xs">
                        1
                      </span>
                      <h4 className="text-base font-bold text-white font-['Outfit']">
                        Step 1: Select Your Private Vehicle for {activeTour.shortName}
                      </h4>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      Rate is per vehicle for full {activeTour.duration}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {activeTour.vehicles.map((veh) => {
                      const isSelected = selectedVehicleId === veh.id;
                      return (
                        <div
                          key={veh.id}
                          onClick={() => setSelectedVehicleId(veh.id)}
                          className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                            isSelected
                              ? 'bg-[#18181E] border-[#F5B91B] shadow-xl shadow-[#F5B91B]/15 scale-[1.02]'
                              : 'bg-[#141416] border-[#27272A] hover:border-slate-700 hover:bg-[#18181B]'
                          }`}
                        >
                          {veh.badge && (
                            <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#F5B91B] text-black shadow-sm">
                              {veh.badge}
                            </span>
                          )}

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-[#F5B91B] uppercase tracking-wider">
                                {veh.highlight}
                              </span>
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                                  isSelected ? 'border-[#F5B91B] bg-[#F5B91B]' : 'border-slate-600'
                                }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                              </div>
                            </div>

                            <h4 className="text-lg font-bold text-white font-['Outfit']">{veh.name}</h4>

                            <div className="space-y-1.5 text-xs text-slate-400">
                              <div className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                <span>{veh.passengers}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                <span>{veh.luggage}</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 mt-4 border-t border-[#27272A] flex items-baseline justify-between">
                            <div>
                              <div className="text-2xl font-black text-white font-mono">
                                {formatTourPrice(veh.priceUsd)}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                ${veh.priceUsd} USD total
                              </div>
                            </div>
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded ${
                                isSelected ? 'bg-[#F5B91B] text-black' : 'bg-[#27272A] text-slate-300'
                              }`}
                            >
                              {isSelected ? 'Selected' : 'Choose'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#27272A]">
                    <div className="text-xs text-slate-400">
                      Selected: <span className="text-white font-bold">{selectedVehicle.name}</span> —{' '}
                      <span className="text-[#F5B91B] font-mono font-bold">{formatTourPrice(selectedVehicle.priceUsd)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleProceedToStep2}
                      className="px-6 py-3 bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-sm rounded-xl shadow-lg shadow-[#F5B91B]/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Proceed to Step 2: Schedule & Pickup</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: SCHEDULE & PICKUP LOCATION */}
              {bookingStep === 2 && (
                <div className="p-6 sm:p-8 rounded-2xl bg-[#141416] border border-[#27272A] space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#F5B91B] text-black font-black flex items-center justify-center text-xs">
                        2
                      </span>
                      <h4 className="text-base sm:text-lg font-bold text-white font-['Outfit']">
                        Step 2: Schedule & Pickup Location
                      </h4>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      Vehicle: {selectedVehicle.name} (${selectedVehicle.priceUsd} USD)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pickup Location Selection */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                          Pickup Location / Hotel <span className="text-red-400">*</span>
                        </label>
                        <div className="flex items-center gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => setPickupMode('preset')}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                              pickupMode === 'preset' ? 'bg-[#F5B91B] text-black font-bold' : 'text-slate-400'
                            }`}
                          >
                            Preset Hubs
                          </button>
                          <button
                            type="button"
                            onClick={() => setPickupMode('custom')}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                              pickupMode === 'custom' ? 'bg-[#F5B91B] text-black font-bold' : 'text-slate-400'
                            }`}
                          >
                            Exact Address
                          </button>
                        </div>
                      </div>

                      {pickupMode === 'preset' ? (
                        <select
                          value={presetPickup}
                          onChange={(e) => setPresetPickup(e.target.value)}
                          className="w-full px-3.5 py-3 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-sm text-white focus:outline-none focus:border-[#F5B91B]"
                        >
                          {activeTour.pickupLocations.map((loc) => (
                            <option key={loc} value={loc}>
                              {loc}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <GoogleAddressAutocomplete
                          value={customAddress}
                          onChange={setCustomAddress}
                          placeholder="e.g. Add your location, hotel or villa"
                        />
                      )}

                      <p className="text-[11px] text-slate-500">
                        Chauffeur provides door-to-door pickup from your hotel lobby, villa, or private address.
                      </p>
                    </div>

                    {/* Date & Time Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                          Tour Date <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-[#F5B91B] absolute left-3 top-3.5 pointer-events-none" />
                          <input
                            type="date"
                            value={selectedDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            required
                            className="w-full pl-9 pr-3 py-2.5 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-sm text-white focus:outline-none focus:border-[#F5B91B]"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                          Pickup Time <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <Clock className="w-4 h-4 text-[#F5B91B] absolute left-3 top-3.5 pointer-events-none" />
                          <input
                            type="time"
                            value={pickupTime}
                            onChange={(e) => setPickupTime(e.target.value)}
                            required
                            className="w-full pl-9 pr-3 py-2.5 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-sm text-white focus:outline-none focus:border-[#F5B91B]"
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          Recommended departure: {activeTour.defaultTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#27272A]">
                    <button
                      type="button"
                      onClick={() => setBookingStep(1)}
                      className="px-4 py-2.5 bg-[#1F1F23] hover:bg-[#27272A] text-slate-300 text-xs font-bold rounded-xl border border-[#27272A] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Step 1</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleProceedToStep3}
                      className="px-6 py-2.5 bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-sm rounded-xl shadow-lg shadow-[#F5B91B]/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Proceed to Step 3: Passenger Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PASSENGER DETAILS & COMPLETE BOOKING */}
              {bookingStep === 3 && (
                <form
                  onSubmit={handleCompleteBooking}
                  className="p-6 sm:p-8 rounded-2xl bg-[#141416] border border-[#27272A] space-y-6"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#F5B91B] text-black font-black flex items-center justify-center text-xs">
                        3
                      </span>
                      <h4 className="text-base sm:text-lg font-bold text-white font-['Outfit']">
                        Step 3: Passenger Details & Confirm Reservation
                      </h4>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      Fixed Price: ${selectedVehicle.priceUsd} USD
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Passenger Input Fields: 7 cols */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#F5B91B]" />
                          <span>Full Passenger Name</span> <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="e.g. David Richardson"
                          required
                          className="w-full px-3.5 py-2.5 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#F5B91B]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-[#F5B91B]" />
                            <span>WhatsApp / Mobile Number</span> <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="e.g. +94 77 123 4567"
                            required
                            className="w-full px-3.5 py-2.5 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#F5B91B]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-[#F5B91B]" />
                            <span>Email Address</span> <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. david@example.com"
                            required
                            className="w-full px-3.5 py-2.5 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#F5B91B]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-[#F5B91B]" />
                            <span>Passengers</span>
                          </label>
                          <select
                            value={passengerCount}
                            onChange={(e) => setPassengerCount(Number(e.target.value))}
                            className="w-full px-3 py-2.5 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-sm text-white focus:outline-none focus:border-[#F5B91B]"
                          >
                            {Array.from({ length: selectedVehicle.maxPassengers }, (_, i) => i + 1).map((n) => (
                              <option key={n} value={n}>
                                {n} {n === 1 ? 'Passenger' : 'Passengers'}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-[#F5B91B]" />
                            <span>Luggage Pieces</span>
                          </label>
                          <select
                            value={luggageCount}
                            onChange={(e) => setLuggageCount(Number(e.target.value))}
                            className="w-full px-3 py-2.5 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-sm text-white focus:outline-none focus:border-[#F5B91B]"
                          >
                            {[0, 1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                              <option key={n} value={n}>
                                {n} {n === 1 ? 'Piece' : 'Pieces'}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-[#F5B91B]" />
                          <span>Special Requests or Notes (Optional)</span>
                        </label>
                        <textarea
                          rows={2}
                          value={specialNotes}
                          onChange={(e) => setSpecialNotes(e.target.value)}
                          placeholder="e.g. Need child baby seat, prefer specific photography stops, dietary requirements..."
                          className="w-full px-3.5 py-2.5 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#F5B91B]"
                        />
                      </div>
                    </div>

                    {/* Tour & Fare Summary Column: 5 cols */}
                    <div className="lg:col-span-5 bg-[#0B0B0D] border border-[#27272A] rounded-xl p-5 space-y-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#F5B91B] font-mono flex items-center gap-1.5">
                        <FileText className="w-4 h-4" />
                        <span>Tour Reservation Summary</span>
                      </div>

                      <div className="space-y-2 text-xs border-b border-[#1F1F23] pb-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Tour:</span>
                          <span className="text-white font-bold text-right">{activeTour.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Duration:</span>
                          <span className="text-white font-mono">{activeTour.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Date & Time:</span>
                          <span className="text-white font-mono">{selectedDate} @ {pickupTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Pickup Area:</span>
                          <span className="text-white text-right truncate max-w-[180px]">{getEffectivePickup()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Vehicle:</span>
                          <span className="text-emerald-400 font-bold">{selectedVehicle.name}</span>
                        </div>
                      </div>

                      {/* Inclusions summary list */}
                      <div className="space-y-1.5 text-[11px] text-slate-300">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <Check className="w-3.5 h-3.5" />
                          <span>Private Dedicated Chauffeur & Vehicle</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <Check className="w-3.5 h-3.5" />
                          <span>Full Fuel, Parking & Highway Tolls Included</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <Check className="w-3.5 h-3.5" />
                          <span>Door-to-door Hotel Pickup & Drop-off</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#1F1F23] flex items-baseline justify-between">
                        <div>
                          <div className="text-xs text-slate-400">Total Fixed Rate:</div>
                          <div className="text-2xl font-black text-[#F5B91B] font-mono">
                            ${selectedVehicle.priceUsd} USD
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-slate-500 font-mono">Local Equivalent</div>
                          <div className="text-xs font-bold text-slate-200 font-mono">
                            {formatLKR(selectedVehicle.priceUsd * CURRENCIES.USD.rateToLkr)}
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 px-4 bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-sm rounded-xl shadow-lg shadow-[#F5B91B]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Confirming Tour Booking...</span>
                          </>
                        ) : (
                          <>
                            <span>Complete & Confirm Booking</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <div className="text-center">
                        <span className="text-[10px] text-slate-500">
                          Instant booking confirmation • Pay directly in cash (USD/LKR) or card to driver
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#27272A]">
                    <button
                      type="button"
                      onClick={() => setBookingStep(2)}
                      className="px-4 py-2.5 bg-[#1F1F23] hover:bg-[#27272A] text-slate-300 text-xs font-bold rounded-xl border border-[#27272A] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Step 2</span>
                    </button>
                    <span className="text-xs text-slate-500">
                      Step 3 of 3
                    </span>
                  </div>
                </form>
              )}

            </div>
          )}
        </div>

        {/* 2. Tour Highlights Grid */}
        <div className="space-y-6">
          <div className="pb-3 border-b border-[#1F1F23]">
            <h3 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
              <span className="text-[#F5B91B]">2.</span> Tour Highlights — {activeTour.shortName}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Carefully curated signature attractions along this recommended route.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeTour.highlights.map((h, i) => {
              const IconComp = h.icon;
              return (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-[#141416] border border-[#27272A] hover:border-[#F5B91B]/40 transition-colors space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F5B91B]/10 border border-[#F5B91B]/20 flex items-center justify-center text-[#F5B91B]">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-white font-['Outfit']">{h.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{h.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Suggested Itinerary Timeline */}
        <div className="space-y-6">
          <div className="pb-3 border-b border-[#1F1F23]">
            <h3 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
              <span className="text-[#F5B91B]">3.</span> Suggested Itinerary ({activeTour.duration})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Timing is approximate and can be tailored to your hotel pickup location, traffic, and personal preferences.
            </p>
          </div>

          <div className="relative pl-6 sm:pl-8 border-l border-[#27272A] space-y-8 ml-2 sm:ml-4">
            {activeTour.itinerary.map((stop, idx) => (
              <div key={idx} className="relative group">
                {/* Timeline Pin */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-[#0E0E10] border-2 border-[#F5B91B] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F5B91B]" />
                </div>

                <div className="bg-[#141416] border border-[#27272A] rounded-xl p-4 sm:p-5 hover:border-[#F5B91B]/40 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                    <span className="text-xs font-mono font-bold text-[#F5B91B] bg-[#F5B91B]/10 px-2.5 py-0.5 rounded w-fit">
                      {stop.time}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Stop {idx + 1} of {activeTour.itinerary.length}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white font-['Outfit']">{stop.title}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{stop.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. What's Included / Not Included */}
        <div className="space-y-6">
          <div className="pb-3 border-b border-[#1F1F23]">
            <h3 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
              <span className="text-[#F5B91B]">4.</span> What's Included / Not Included
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Transparent terms with dedicated chauffeur and vehicle all day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Included */}
            <div className="p-6 rounded-2xl bg-[#141416] border border-emerald-900/40 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm font-['Outfit']">
                <CheckCircle2 className="w-4 h-4" />
                <span className="uppercase tracking-wider">What's Included</span>
              </div>
              <ul className="space-y-3">
                {activeTour.inclusions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Not Included */}
            <div className="p-6 rounded-2xl bg-[#141416] border border-red-950/40 space-y-4">
              <div className="flex items-center gap-2 text-slate-400 font-bold text-sm font-['Outfit']">
                <XCircle className="w-4 h-4 text-slate-500" />
                <span className="uppercase tracking-wider">Not Included</span>
              </div>
              <ul className="space-y-3">
                {activeTour.exclusions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-400">
                    <XCircle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
