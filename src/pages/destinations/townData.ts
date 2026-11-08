/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TownRoute {
  from: string;
  to: string;
  distanceKm: number;
  duration: string;
  sedanLkr: number;
  vanLkr: number;
  suvLkr: number;
  highlight: string;
}

export interface TownAttraction {
  name: string;
  category: string;
  description: string;
}

export interface TownFaq {
  question: string;
  answer: string;
}

export interface TownTaxiConfig {
  id: string;
  slug: string;
  townName: string;
  pageTitle: string;
  heroHeadline: string;
  heroHighlight: string;
  badge: string;
  tagline: string;
  heroImage: string;
  aboutTitle: string;
  aboutText: string[];
  distanceToAirport: string;
  distanceToGalle: string;
  defaultPickup: string;
  defaultDestination: string;
  popularRoutes: TownRoute[];
  attractions: TownAttraction[];
  faqs: TownFaq[];
}

export const TOWNS_DATA: Record<string, TownTaxiConfig> = {
  'ahangama-taxi': {
    id: 'ahangama',
    slug: 'ahangama-taxi',
    townName: 'Ahangama',
    pageTitle: 'Ahangama Taxi Service | Private Airport Transfers & Surf Chauffeurs',
    heroHeadline: 'Reliable Private Taxi in',
    heroHighlight: 'Ahangama & Kabalana',
    badge: 'Sri Lanka Surf Coast Hub',
    tagline: 'Direct Colombo Airport (CMB) highway transfers, beachfront villa rides, and custom surf trip transportation with board-rack equipped luxury vehicles.',
    heroImage: '/assets/aistudio/Sri_Lanka_Southern_Coast_Surf_Sunset_2549a27a.png',
    aboutTitle: 'Why Travelers Choose Galle Taxi for Ahangama Rides',
    aboutText: [
      'Ahangama has emerged as Sri Lanka’s premier surf and coastal bohemian lifestyle enclave. Known for legendary surf breaks like Kabalana The Rock, Marshmallows, and Sticks, plus stylish oceanfront cafes and private boutique villas, having a dedicated on-demand chauffeur makes exploring seamless.',
      'Our professional chauffeurs specialize in airport pick-ups directly to your Ahangama villa or hotel, complete with surfboard-friendly transport, free flight delay tracking, and all Southern Expressway (E01) tolls included in your upfront rate.',
      'Whether you need a daily morning surf shuttle, a sunset transfer to Galle Fort for dinner, or a direct transfer to Bandaranaike International Airport, our modern air-conditioned sedans and spacious VIP vans are available 24/7.'
    ],
    distanceToAirport: '165 km · Approx. 2h 15m via E01 Expressway',
    distanceToGalle: '21 km · Approx. 30 Mins via coastal A2 road',
    defaultPickup: 'Ahangama Beach',
    defaultDestination: 'Bandaranaike International Airport (CMB)',
    popularRoutes: [
      {
        from: 'Ahangama / Kabalana',
        to: 'Colombo Airport (CMB)',
        distanceKm: 165,
        duration: '2h 15m',
        sedanLkr: 22000,
        vanLkr: 26000,
        suvLkr: 32000,
        highlight: 'Southern Expressway (E01) tolls included, meet & greet available',
      },
      {
        from: 'Ahangama',
        to: 'Galle Dutch Fort',
        distanceKm: 21,
        duration: '30 mins',
        sedanLkr: 5200,
        vanLkr: 6800,
        suvLkr: 8500,
        highlight: 'Scenic coastal drive passing Koggala stilt fishermen & Thalpe',
      },
      {
        from: 'Ahangama',
        to: 'Weligama Bay Surf Beach',
        distanceKm: 9,
        duration: '15 mins',
        sedanLkr: 3000,
        vanLkr: 4200,
        suvLkr: 5500,
        highlight: 'Quick surf drop-off to Weligama surf schools and Marriott resort',
      },
      {
        from: 'Ahangama',
        to: 'Mirissa Beach & Harbour',
        distanceKm: 15,
        duration: '22 mins',
        sedanLkr: 4500,
        vanLkr: 5800,
        suvLkr: 7200,
        highlight: 'Whale watching departures, Coconut Tree Hill & beach clubs',
      },
      {
        from: 'Ahangama',
        to: 'Hiriketiya Beach / Dikwella',
        distanceKm: 46,
        duration: '1h 05m',
        sedanLkr: 11500,
        vanLkr: 14500,
        suvLkr: 17500,
        highlight: 'Horseshoe bay surf, Dot’s 60s cafe & Hiriketiya nightlife',
      },
      {
        from: 'Ahangama',
        to: 'Ella Mountain Village',
        distanceKm: 178,
        duration: '3h 30m',
        sedanLkr: 32000,
        vanLkr: 38000,
        suvLkr: 45000,
        highlight: 'Direct highway transfer through scenic hill country pass',
      },
    ],
    attractions: [
      {
        name: 'The Rock at Kabalana',
        category: 'Famous Surf Break',
        description: 'World-renowned A-frame reef break attracting advanced surfers during the sunny south coast season.',
      },
      {
        name: 'Koggala Lake & Cinnamon Islands',
        category: 'Eco Nature Tour',
        description: 'Serene mangrove channels, spice plantations, and centuries-old Buddhist hermitages just 8 minutes away.',
      },
      {
        name: 'Ahangama Sunset Cafes & Rooftops',
        category: 'Dining & Social Scene',
        description: 'Chic beachside hangouts, artisan sourdough bakeries, and panoramic sunset cocktail bars.',
      },
      {
        name: 'Midigama Surf Village',
        category: 'Reef & Point Breaks',
        description: 'Neighboring village featuring Rams, Lazy Left, Plantations, and Coconut surf points.',
      },
    ],
    faqs: [
      {
        question: 'Can your taxis carry surfboards to or from Ahangama?',
        answer: 'Yes! We frequently transport shortboards, fish boards, and longboards. Our spacious VIP KDH vans and roof-equipped vehicles comfortably fit board bags with plenty of room for passenger luggage.',
      },
      {
        question: 'How long does a private taxi transfer take between Colombo Airport (CMB) and Ahangama?',
        answer: 'Via the Southern Expressway (E01), a direct private taxi ride takes approximately 2 hours and 15 minutes. All highway toll tickets are fully included in our transparent upfront quote.',
      },
      {
        question: 'Are night-time and early morning airport pick-ups available in Ahangama?',
        answer: 'Yes, our chauffeur dispatch operates 24/7/365. Whether your flight departs at 4:00 AM or touches down at midnight, our drivers arrive at your villa or hotel 15 minutes ahead of schedule.',
      },
      {
        question: 'Can I stop along the way for stilt fishermen photos or a coconut break?',
        answer: 'Absolutely. Because our rides are 100% private, you have the flexibility to take short scenic photo stops in Thalpe or Koggala at no extra charge.',
      },
    ],
  },

  'mirissa-taxi': {
    id: 'mirissa',
    slug: 'mirissa-taxi',
    townName: 'Mirissa',
    pageTitle: 'Mirissa Taxi Service | Private Airport Pickups & South Coast Chauffeurs',
    heroHeadline: 'Direct Private Taxi in',
    heroHighlight: 'Mirissa & Weligama Bay',
    badge: 'Whales & Tropical Beach Capital',
    tagline: 'Reliable private airport transfers, early morning whale watching shuttles, and inter-city rides to Yala, Ella, and Galle Fort with air-conditioned luxury vehicles.',
    heroImage: '/assets/aistudio/Sri_Lanka_Southern_Coast_Surf_Sunset_2549a27a.png',
    aboutTitle: 'Premier Chauffeur Transport for Mirissa Travelers',
    aboutText: [
      'Mirissa is famous worldwide for blue whale watching expeditions, iconic Coconut Tree Hill, Secret Beach, and vibrant beachfront nightlife. Navigating between resorts, harbors, and distant wildlife reserves is effortless with Galle Taxi.',
      'We provide punctual 24/7 airport transfers connecting Bandaranaike International Airport (CMB) directly to Mirissa Beach via the Southern Expressway. Our drivers monitor international flight arrivals to guarantee prompt terminal meet-and-greets.',
      'Planning onward travel from Mirissa to Yala National Park for a leopard safari or the cool hills of Ella? Our long-distance private chauffeur fleet offers fixed upfront rates with commercial insurance and maximum comfort.'
    ],
    distanceToAirport: '175 km · Approx. 2h 20m via E01 Expressway',
    distanceToGalle: '35 km · Approx. 45 Mins via coastal A2 or highway',
    defaultPickup: 'Mirissa Beach',
    defaultDestination: 'Bandaranaike International Airport (CMB)',
    popularRoutes: [
      {
        from: 'Mirissa Beach',
        to: 'Colombo Airport (CMB)',
        distanceKm: 175,
        duration: '2h 20m',
        sedanLkr: 23000,
        vanLkr: 27500,
        suvLkr: 33500,
        highlight: 'Southern Expressway (E01) tolls included, doorstep pickup',
      },
      {
        from: 'Mirissa',
        to: 'Galle Dutch Fort',
        distanceKm: 35,
        duration: '45 mins',
        sedanLkr: 8500,
        vanLkr: 11000,
        suvLkr: 13500,
        highlight: 'Day trip to UNESCO ramparts, colonial boutique cafes & jewelry',
      },
      {
        from: 'Mirissa',
        to: 'Yala National Park (Tissamaharama)',
        distanceKm: 125,
        duration: '2h 15m',
        sedanLkr: 24000,
        vanLkr: 29000,
        suvLkr: 35000,
        highlight: 'Wildlife safari gateway, direct transfer to luxury campsite or lodge',
      },
      {
        from: 'Mirissa',
        to: 'Ella Town (Nine Arch Bridge)',
        distanceKm: 165,
        duration: '3h 15m',
        sedanLkr: 30000,
        vanLkr: 36000,
        suvLkr: 42000,
        highlight: 'Scenic mountain transfer directly to your Ella guesthouse or hotel',
      },
      {
        from: 'Mirissa',
        to: 'Udawalawe National Park',
        distanceKm: 110,
        duration: '2h 00m',
        sedanLkr: 22000,
        vanLkr: 26500,
        suvLkr: 31000,
        highlight: 'Elephant transit home and open-top 4x4 safari departures',
      },
      {
        from: 'Mirissa',
        to: 'Hiriketiya & Tangalle',
        distanceKm: 38,
        duration: '50 mins',
        sedanLkr: 9500,
        vanLkr: 12000,
        suvLkr: 14500,
        highlight: 'Quiet southern beaches, Goyambokka, and horseshoe bays',
      },
    ],
    attractions: [
      {
        name: 'Coconut Tree Hill',
        category: 'Iconic Viewpoint',
        description: 'A picturesque palm-crowned headland overlooking the Indian Ocean, famous for sunrise and sunset photography.',
      },
      {
        name: 'Mirissa Harbour Whale Watching',
        category: 'Marine Safari',
        description: 'Departures to spot blue whales, sperm whales, and spinning dolphins in their natural deep-water migration trench.',
      },
      {
        name: 'Secret Beach Mirissa',
        category: 'Hidden Cove',
        description: 'Secluded tidal lagoon sheltered by palm jungle, ideal for quiet swimming and fresh king coconut refreshments.',
      },
      {
        name: 'Parrot Rock',
        category: 'Coastal Lookout',
        description: 'Natural ocean rock formation directly on Mirissa main beach offering panoramic vistas of the surf bay.',
      },
    ],
    faqs: [
      {
        question: 'What is the taxi fare from Colombo Airport to Mirissa?',
        answer: 'Our private sedan rate starts at approximately LKR 23,000 (~$75 USD) and includes all Southern Expressway tolls, fuel, chauffeur allowances, and terminal meet-and-greet.',
      },
      {
        question: 'Can you arrange an early 5:30 AM pickup for the Mirissa whale watching boat?',
        answer: 'Yes! Our drivers are available around the clock. We can pick you up from any hotel in Mirissa, Weligama, or Ahangama and deliver you right to the harbor boarding gate on time.',
      },
      {
        question: 'Can we book a one-way private taxi from Mirissa to Ella or Yala?',
        answer: 'Yes, we operate daily inter-city transfers to Ella, Yala, Udawalawe, and Nuwara Eliya. You travel in modern air-conditioned comfort without having to wrestle crowded public buses.',
      },
    ],
  },

  'unawatuna-taxi': {
    id: 'unawatuna',
    slug: 'unawatuna-taxi',
    townName: 'Unawatuna',
    pageTitle: 'Unawatuna Taxi Service | Private Beach Shuttles & Airport Transfers',
    heroHeadline: 'Premium Private Taxi in',
    heroHighlight: 'Unawatuna Beach & Bay',
    badge: 'Historic Golden Bay Sanctuary',
    tagline: 'Quick 15-minute rides to Galle Dutch Fort, direct Colombo Airport highway transfers, and private beach shuttles to Jungle Beach and Dalawella rope swing.',
    heroImage: '/assets/aistudio/Sunset_Beach_Road_Trip_with_Surfboard_19548307.png',
    aboutTitle: 'Your Trusted Private Chauffeur in Unawatuna',
    aboutText: [
      'Unawatuna is one of Sri Lanka’s most beloved coastal resort towns, renowned for its crescent-shaped golden bay, calm swimming waters, and lush jungle headlands. Nestled just minutes from UNESCO Galle Fort, it is an ideal hub for exploring the south coast.',
      'Galle Taxi is headquartered in the immediate vicinity, giving us an unmatched 10-to-15 minute response time for on-demand pickups anywhere in Unawatuna, Yaddehimulla, Rumassala, and Dalawella.',
      'From direct airport highway transfers with infant car seats to full-day private chauffeurs for shopping and dining in Galle Fort, we deliver white-glove hospitality with clean, commercially inspected vehicles.'
    ],
    distanceToAirport: '155 km · Approx. 2h 00m via E01 Expressway',
    distanceToGalle: '6 km · Approx. 12 Mins via Matara Road',
    defaultPickup: 'Unawatuna Beach',
    defaultDestination: 'Bandaranaike International Airport (CMB)',
    popularRoutes: [
      {
        from: 'Unawatuna Beach',
        to: 'Colombo Airport (CMB)',
        distanceKm: 155,
        duration: '2h 00m',
        sedanLkr: 20500,
        vanLkr: 24500,
        suvLkr: 30000,
        highlight: 'Direct Southern Expressway (E01) transfer, all tolls included',
      },
      {
        from: 'Unawatuna',
        to: 'Galle Dutch Fort',
        distanceKm: 6,
        duration: '12 mins',
        sedanLkr: 2500,
        vanLkr: 3500,
        suvLkr: 4500,
        highlight: 'Quick shuttle for shopping, historic lighthouse & sunset dining',
      },
      {
        from: 'Unawatuna',
        to: 'Jungle Beach & Peace Pagoda',
        distanceKm: 4,
        duration: '10 mins',
        sedanLkr: 2000,
        vanLkr: 2800,
        suvLkr: 3500,
        highlight: 'Hilltop Japanese pagoda with bay views & hidden snorkeling cove',
      },
      {
        from: 'Unawatuna',
        to: 'Ahangama / Kabalana Surf',
        distanceKm: 16,
        duration: '22 mins',
        sedanLkr: 4200,
        vanLkr: 5500,
        suvLkr: 7000,
        highlight: 'Scenic coastal transfer past Thalpe beach villas & surf camps',
      },
      {
        from: 'Unawatuna',
        to: 'Mirissa Beach & Whale Watching',
        distanceKm: 30,
        duration: '40 mins',
        sedanLkr: 7500,
        vanLkr: 9800,
        suvLkr: 12000,
        highlight: 'Day trip to Coconut Tree Hill & early morning boat tours',
      },
      {
        from: 'Unawatuna',
        to: 'Hikkaduwa Coral Reef',
        distanceKm: 26,
        duration: '35 mins',
        sedanLkr: 6500,
        vanLkr: 8200,
        suvLkr: 10500,
        highlight: 'Snorkeling with sea turtles and exploring marine sanctuary',
      },
    ],
    attractions: [
      {
        name: 'Japanese Peace Pagoda & Rumassala',
        category: 'Spiritual & Scenic',
        description: 'A striking Buddhist stupa built by Japanese monks atop Rumassala sanctuary, offering 360-degree views of Galle Fort harbor.',
      },
      {
        name: 'Dalawella Beach & Rope Swing',
        category: 'Coastal Lagoon',
        description: 'Famous palm tree rope swing, protective coral reef pool where green sea turtles swim near the shore.',
      },
      {
        name: 'Jungle Beach',
        category: 'Snorkeling Cove',
        description: 'Tucked away between Rumassala headland, featuring calm crystal-clear turquoise waters and live coral.',
      },
      {
        name: 'Yaddehimulla Road Cafes',
        category: 'Food & Culture',
        description: 'Charming pedestrian alley packed with authentic seafood restaurants, vegan cafes, and yoga shalas.',
      },
    ],
    faqs: [
      {
        question: 'How fast can a taxi pick me up in Unawatuna?',
        answer: 'Since our primary dispatch hub is stationed right by Galle and Unawatuna, our average arrival time is between 10 to 15 minutes for local bookings.',
      },
      {
        question: 'Do you offer round-trip dining shuttles between Unawatuna and Galle Fort?',
        answer: 'Yes! We frequently drop guests off at Galle Fort for evening dining and pick them up at a pre-arranged time to return safely to Unawatuna.',
      },
      {
        question: 'Is luggage assistance and child safety seats provided for airport transfers?',
        answer: 'Yes, all our chauffeurs provide courteous luggage loading, and sanitized infant or booster child seats can be added upon request.',
      },
    ],
  },

  'hikkaduwa-taxi': {
    id: 'hikkaduwa',
    slug: 'hikkaduwa-taxi',
    townName: 'Hikkaduwa',
    pageTitle: 'Hikkaduwa Taxi Service | Private Airport Pickups & Coral Coast Transfers',
    heroHeadline: 'Direct Private Taxi in',
    heroHighlight: 'Hikkaduwa & Narigama Beach',
    badge: 'Coral Reef & Marine Life Hub',
    tagline: 'Reliable private airport transfers, sea turtle beach shuttles, and day tours to Galle Fort and Madu Ganga river safari with executive air-conditioned vehicles.',
    heroImage: '/assets/aistudio/Sunset_Beach_Road_Trip_with_Surfboard_19548307.png',
    aboutTitle: 'Professional Chauffeurs Serving Hikkaduwa',
    aboutText: [
      'Hikkaduwa is world-famous as Sri Lanka’s original surfing and coral reef haven. With its offshore marine national park, wild sea turtles swimming right up to the shore, and miles of palm-fringed sands along Narigama Beach, it remains a traveler favorite.',
      'Located just 20 minutes north of Galle, Hikkaduwa enjoys quick highway connectivity to Colombo Airport via the Kurundugahahetekma and Pinnaduwa expressway interchanges.',
      'Galle Taxi provides dependable on-time transfers for holidaymakers, divers, and families looking for safe, comfortable transport without dealing with unpredictable street tuk-tuk negotiations.'
    ],
    distanceToAirport: '142 km · Approx. 1h 50m via E01 Expressway',
    distanceToGalle: '19 km · Approx. 25 Mins via coastal A2 road',
    defaultPickup: 'Hikkaduwa Beach',
    defaultDestination: 'Bandaranaike International Airport (CMB)',
    popularRoutes: [
      {
        from: 'Hikkaduwa Beach',
        to: 'Colombo Airport (CMB)',
        distanceKm: 142,
        duration: '1h 50m',
        sedanLkr: 19000,
        vanLkr: 23000,
        suvLkr: 28500,
        highlight: 'Fastest highway link to CMB airport, tolls & flight monitoring included',
      },
      {
        from: 'Hikkaduwa',
        to: 'Galle Dutch Fort',
        distanceKm: 19,
        duration: '25 mins',
        sedanLkr: 4800,
        vanLkr: 6200,
        suvLkr: 7800,
        highlight: 'Historic day trip, maritime museum & rampart sunset walk',
      },
      {
        from: 'Hikkaduwa',
        to: 'Bentota / Balapitiya River Safari',
        distanceKm: 28,
        duration: '35 mins',
        sedanLkr: 6800,
        vanLkr: 8500,
        suvLkr: 10500,
        highlight: 'Madu Ganga boat tour, cinnamon peeling & fish therapy spa',
      },
      {
        from: 'Hikkaduwa',
        to: 'Unawatuna & Thalpe',
        distanceKm: 25,
        duration: '35 mins',
        sedanLkr: 6200,
        vanLkr: 7900,
        suvLkr: 9800,
        highlight: 'Golden bay swimming, jungle beach & beach clubs',
      },
      {
        from: 'Hikkaduwa',
        to: 'Mirissa Beach',
        distanceKm: 52,
        duration: '1h 10m',
        sedanLkr: 12500,
        vanLkr: 15500,
        suvLkr: 18500,
        highlight: 'Blue whale watching tours and Coconut Tree Hill headland',
      },
      {
        from: 'Hikkaduwa',
        to: 'Colombo City Center',
        distanceKm: 115,
        duration: '1h 45m',
        sedanLkr: 18000,
        vanLkr: 22000,
        suvLkr: 27000,
        highlight: 'Direct highway transfer to Colombo 5-star hotels or embassies',
      },
    ],
    attractions: [
      {
        name: 'Hikkaduwa Coral Sanctuary',
        category: 'Marine Reserve',
        description: 'Vibrant shallow reef home to over 60 species of hard corals and colorful reef fish, ideal for glass-bottom boat trips and snorkeling.',
      },
      {
        name: 'Sea Turtle Feeding Point',
        category: 'Wildlife Experience',
        description: 'Giant green sea turtles visit the shallow shore daily in front of Hikkaduwa coral beach to feed on seagrass right beside visitors.',
      },
      {
        name: 'Narigama Long Surf Beach',
        category: 'Surf & Beach Life',
        description: 'Wide sandy beach stretching for kilometers, offering beachfront seafood grills, surf schools, and fiery orange sunsets.',
      },
      {
        name: 'Tsunami Photo Museum & Memorial',
        category: 'Historical Landmark',
        description: 'Touching historical memorial and photo archive honoring resilience and community history along the southern rail line.',
      },
    ],
    faqs: [
      {
        question: 'How long does a taxi take between Hikkaduwa and Colombo Airport (CMB)?',
        answer: 'Via the Southern Expressway, a private taxi transfer from Hikkaduwa to Colombo Airport takes roughly 1 hour and 50 minutes. All expressway tolls are fully covered in our price.',
      },
      {
        question: 'Can you pick up our surfboards and dive gear in Hikkaduwa?',
        answer: 'Yes! We have spacious vans with fold-down seats and roof capabilities designed specifically for travelers carrying surfboards and bulky scuba gear.',
      },
      {
        question: 'Can we stop at the turtle hatchery or moonstone mine on the way to Galle?',
        answer: 'Yes, our private chauffeurs are happy to accommodate cultural sightseeing stops in Meetiyagoda (moonstone mines) or Kosgoda (sea turtle conservation) along the route.',
      },
    ],
  },

  'bentota-taxi': {
    id: 'bentota',
    slug: 'bentota-taxi',
    townName: 'Bentota',
    pageTitle: 'Bentota Taxi Service | Luxury Resort Transfers & Airport Chauffeurs',
    heroHeadline: 'Luxury Private Taxi in',
    heroHighlight: 'Bentota & Beruwala Beach',
    badge: 'Luxury Beach Resort & River Capital',
    tagline: 'Direct Colombo Airport transfers to 5-star beach resorts, Madu Ganga river safari day tours, and private chauffeurs across Sri Lanka’s gold coast.',
    heroImage: '/assets/aistudio/Sunset_Beach_Road_Trip_with_Surfboard_19548307.png',
    aboutTitle: 'Elite Chauffeur Experience in Bentota',
    aboutText: [
      'Bentota is Sri Lanka’s prime coastal haven for luxury beach holidays, water sports, and architectural heritage. Famous for the tranquil Bentota River lagoon, Geoffrey Bawa’s Lunuganga estate, and five-star beachfront resorts, high standards of hospitality are essential.',
      'Galle Taxi provides executive chauffeur transportation connecting Bentota and neighboring Beruwala with Colombo International Airport (CMB) in just 1 hour and 30 minutes via the Southern Expressway.',
      'Whether you are visiting for thrilling jet ski and banana boat sports, exploring Brief Garden, or traveling south to Galle Dutch Fort, our licensed, English-speaking chauffeurs ensure a smooth, dignified journey.'
    ],
    distanceToAirport: '110 km · Approx. 1h 30m via E01 Expressway',
    distanceToGalle: '54 km · Approx. 50 Mins via E01 Highway',
    defaultPickup: 'Bentota Beach Resort',
    defaultDestination: 'Bandaranaike International Airport (CMB)',
    popularRoutes: [
      {
        from: 'Bentota / Beruwala',
        to: 'Colombo Airport (CMB)',
        distanceKm: 110,
        duration: '1h 30m',
        sedanLkr: 16500,
        vanLkr: 20000,
        suvLkr: 25000,
        highlight: 'Fastest highway expressway transfer, flight delay tracking included',
      },
      {
        from: 'Bentota',
        to: 'Galle Dutch Fort',
        distanceKm: 54,
        duration: '50 mins',
        sedanLkr: 11500,
        vanLkr: 14500,
        suvLkr: 17500,
        highlight: 'UNESCO heritage exploration, rampart walk & colonial cafes',
      },
      {
        from: 'Bentota',
        to: 'Madu Ganga River Safari (Balapitiya)',
        distanceKm: 18,
        duration: '25 mins',
        sedanLkr: 4500,
        vanLkr: 6000,
        suvLkr: 7500,
        highlight: 'Mangrove boat safari, cinnamon island & natural fish spa',
      },
      {
        from: 'Bentota',
        to: 'Unawatuna & Mirissa',
        distanceKm: 78,
        duration: '1h 15m',
        sedanLkr: 16000,
        vanLkr: 19500,
        suvLkr: 24000,
        highlight: 'Deep south beach day tour, whale watching & stilt fishermen',
      },
      {
        from: 'Bentota',
        to: 'Kandy & Cultural Triangle',
        distanceKm: 175,
        duration: '3h 45m',
        sedanLkr: 32000,
        vanLkr: 38000,
        suvLkr: 46000,
        highlight: 'Temple of the Tooth Relic, botanical gardens & tea country',
      },
      {
        from: 'Bentota',
        to: 'Colombo City Hotels',
        distanceKm: 85,
        duration: '1h 15m',
        sedanLkr: 14500,
        vanLkr: 18000,
        suvLkr: 22500,
        highlight: 'Direct highway transfer to Galle Face, Colombo 03, or casino resorts',
      },
    ],
    attractions: [
      {
        name: 'Bentota River Lagoon & Water Sports',
        category: 'Adventure',
        description: 'World-class center for jet skiing, wakeboarding, windsurfing, speed-boating, and tube rides along calm inland waters.',
      },
      {
        name: 'Lunuganga (Geoffrey Bawa’s Country Estate)',
        category: 'Architecture & Nature',
        description: 'The legendary country estate of world-renowned architect Geoffrey Bawa, featuring enchanting Italianate landscaping.',
      },
      {
        name: 'Brief Garden by Bevis Bawa',
        category: 'Botanical Sanctuary',
        description: 'Magical tropical garden sculpted by Bevis Bawa with dense foliage, outdoor sculptures, and romantic hidden pathways.',
      },
      {
        name: 'Kosgoda Sea Turtle Conservation Project',
        category: 'Eco Conservation',
        description: 'Pioneering marine turtle hatchery protecting newly laid eggs and rehabilitating injured olive ridley and leatherback turtles.',
      },
    ],
    faqs: [
      {
        question: 'How long does a private taxi transfer take between Bentota and Colombo Airport (CMB)?',
        answer: 'Thanks to the Southern Expressway interchange at Welipenna, the drive takes only 1 hour and 30 minutes in normal traffic conditions. All expressway tolls are included.',
      },
      {
        question: 'Can your chauffeurs provide daily sightseeing tours in Bentota?',
        answer: 'Yes, we offer custom private day tours covering the Madu River boat safari, Lunuganga estate, turtle hatcheries, and Brief Garden with waiting time included.',
      },
      {
        question: 'Do you pick up from luxury resorts like Cinnamon Bentota Beach, Taj Bentota, and Saman Villas?',
        answer: 'Yes, we regularly service all 5-star beachfront resorts, boutique villas, and private holiday homes throughout Bentota and Beruwala with door-to-door luggage handling.',
      },
    ],
  },

  'weligama-taxi': {
    id: 'weligama',
    slug: 'weligama-taxi',
    townName: 'Weligama',
    pageTitle: 'Weligama Taxi Service | Surf Transfers, Bay Shuttles & Airport Chauffeurs',
    heroHeadline: 'Premium Private Taxi in',
    heroHighlight: 'Weligama Bay & Beach',
    badge: 'Sri Lanka Surf & Catamaran Bay',
    tagline: 'Reliable Colombo Airport (CMB) highway transfers, beachfront surf shuttles, and private chauffeur rides across Weligama, Midigama & Mirissa with air-conditioned luxury sedans and vans.',
    heroImage: '/assets/aistudio/Sri_Lanka_Southern_Coast_Surf_Sunset_2549a27a.png',
    aboutTitle: 'Why Travelers Choose Galle Taxi for Weligama Rides',
    aboutText: [
      'Weligama Bay is Sri Lanka’s celebrated coastal hub for beginner and intermediate surfing, luxury resorts like Weligama Bay Marriott, and lively beachside seafood culture. Spread around a scenic horseshoe bay featuring the iconic Taprobane Island, getting around comfortably requires trusted private transport.',
      'Galle Taxi provides round-the-clock private airport transfers directly to Weligama hotels and villas via the Kokmaduwa / Weligama interchange on the Southern Expressway (E01) in just 2 hours and 10 minutes.',
      'Our vehicles are clean, air-conditioned, and equipped to accommodate surfboards and multiple luggage bags. Whether you need a short ride to Mirissa for dinner or whale watching, an excursion to Galle Dutch Fort, or an intercity journey to Ella or Yala, our professional chauffeurs are ready 24/7.'
    ],
    distanceToAirport: '170 km · Approx. 2h 10m via E01 Expressway',
    distanceToGalle: '28 km · Approx. 35 Mins via A2 Coast Road',
    defaultPickup: 'Weligama Bay Beach',
    defaultDestination: 'Bandaranaike International Airport (CMB)',
    popularRoutes: [
      {
        from: 'Weligama Bay',
        to: 'Colombo Airport (CMB)',
        distanceKm: 170,
        duration: '2h 10m',
        sedanLkr: 22500,
        vanLkr: 26500,
        suvLkr: 32500,
        highlight: 'Southern Expressway E01 tolls included, flight tracking & zero advance deposit',
      },
      {
        from: 'Weligama',
        to: 'Galle Dutch Fort',
        distanceKm: 28,
        duration: '35 mins',
        sedanLkr: 5800,
        vanLkr: 7400,
        suvLkr: 9200,
        highlight: 'Scenic coastal drive passing Ahangama and Koggala stilt fishermen',
      },
      {
        from: 'Weligama',
        to: 'Mirissa Beach & Coconut Tree Hill',
        distanceKm: 6,
        duration: '10 mins',
        sedanLkr: 2500,
        vanLkr: 3500,
        suvLkr: 4800,
        highlight: 'Quick dinner transfer or early morning whale watching harbour drop-off',
      },
      {
        from: 'Weligama',
        to: 'Ahangama & Kabalana Beach',
        distanceKm: 9,
        duration: '15 mins',
        sedanLkr: 3000,
        vanLkr: 4200,
        suvLkr: 5500,
        highlight: 'Surf safari shuttle between Weligama beach breaks and Kabalana reefs',
      },
      {
        from: 'Weligama',
        to: 'Hiriketiya Beach & Dikwella',
        distanceKm: 38,
        duration: '50 mins',
        sedanLkr: 9800,
        vanLkr: 12500,
        suvLkr: 15500,
        highlight: 'Horseshoe surf bay, beach cafes & tranquil southern coastline',
      },
      {
        from: 'Weligama',
        to: 'Ella Mountain Village',
        distanceKm: 170,
        duration: '3h 25m',
        sedanLkr: 31000,
        vanLkr: 37000,
        suvLkr: 44000,
        highlight: 'Comfortable hill country transfer via Southern Expressway & Wellawaya',
      },
    ],
    attractions: [
      {
        name: 'Weligama Sandy Surf Beach',
        category: 'Surf & Beach Recreation',
        description: 'Gentle, rolling sand-bottom waves ideal for beginners and longboarders, lined with certified surf schools and beach bars.',
      },
      {
        name: 'Taprobane Island',
        category: 'Historic Landmark',
        description: 'Picturesque private rocky islet crowned with a neo-Palladian villa built in the 1920s by the Count de Mauny-Talvande.',
      },
      {
        name: 'Kushtarajagala Rock Carving',
        category: 'Ancient Heritage',
        description: 'Impressive 7th-to-9th-century colossal Mahayana Buddhist rock-hewn statue of Bodhisattva Avalokiteshvara.',
      },
      {
        name: 'Midigama Surf Breaks (Lazy Left & Rams)',
        category: 'Advanced Surf',
        description: 'World-famous coral reef breaks just 5 minutes north of Weligama Bay for experienced wave riders.',
      },
    ],
    faqs: [
      {
        question: 'How long does a private taxi transfer take between Weligama and Colombo Airport (CMB)?',
        answer: 'Via the Southern Expressway (E01) through the Weligama/Kokmaduwa exit, the journey takes approximately 2 hours and 10 minutes. All expressway tolls and luggage handling are included in the upfront fare.',
      },
      {
        question: 'Can your taxis carry longboards and surf gear in Weligama?',
        answer: 'Yes! We have spacious Toyota KDH high-roof vans and cars with roof racks suited for shortboards and longboards. Please mention your board count during booking so we allocate the best vehicle.',
      },
      {
        question: 'Do you offer transfers to Weligama Bay Marriott Resort & Spa?',
        answer: 'Yes, we provide 24/7 direct door-to-door private transfers to the Marriott, Cape Weligama, W15, and all boutique hotels and surf villas across Weligama.',
      },
    ],
  },
};
