import amethystImg from '../assets/images/can_amethyst_exact_1794772496085.jpg';
import aureliaImg from '../assets/images/can_aurelia_exact_1794772496154.jpg';
import cobaltImg from '../assets/images/can_cobalt_exact_1794772494413.jpg';
import crimsonImg from '../assets/images/can_crimson_exact_1794772495991.jpg';
import emeraldImg from '../assets/images/can_emerald_exact_1794772495329.jpg';
import frostImg from '../assets/images/can_frost_exact_1794772497032.jpg';

export interface ElixirProduct {
  id: string;
  index: string;
  name: string;
  crest: string;
  flavorNotes: string;
  benefit: string;
  ritualMoment: string;
  description: string;
  ritualDetail: string;
  accentHex: string;
  surfaceTint: string;
  image: string;
  packs: {
    size: '6-Pack' | '12-Pack' | '24-Pack';
    cans: number;
    price: number;
  }[];
  metrics: {
    sodiumMg: number;
    potassiumMg: number;
    magnesiumMg: number;
    zincMg: number;
    osmolarity: string;
    sugarG: number;
    calories: number;
    volumeMl: number;
  };
  botanicals: string[];
  /** Primary video timeline window [0..1] */
  featuredWindow: [number, number];
}

export const BRAND_CONFIG = {
  name: 'AETHERIA',
  tagline: 'Botanical Electrolyte Hydration',
  locationNote:
    'Direct-to-door cold-chain dispatch. Prototype storefront — contact & pricing shown for preview.',
  conciergeEmail: 'concierge@aetheria-hydrate.example',
  freeShippingThreshold: 75,
} as const;

export const CINEMA_VIDEO = {
  src: '/assets/hydration/cinema-master.mp4',
  poster: '/assets/hydration/poster.jpg',
  durationSec: 20.0,
} as const;

export const ELIXIRS: ElixirProduct[] = [
  {
    id: 'cobalt-lotus',
    index: '01',
    name: 'Cobalt Lotus',
    crest: 'Blue Iris & Pacific Sea Salt',
    flavorNotes: 'Wild Blueberry · Yuzu Peel · Mineral Salt',
    benefit: 'Deep Cellular Rehydration',
    ritualMoment: 'Morning Reset & Altitude Travel',
    description:
      'Formulated at isotonic 280 mOsm/L osmolarity with cold-pressed yuzu zest, Atlantic kelp minerals, and crisp blue lotus botanical extract for rapid fluid uptake.',
    ritualDetail:
      'Chilled to 4 °C, Cobalt Lotus opens with bright yuzu aromatics before settling into clean Atlantic mineral salinity that restores intracellular balance without heaviness.',
    accentHex: '#4E94FF',
    surfaceTint: 'rgba(78, 148, 255, 0.16)',
    image: cobaltImg,
    packs: [
      { size: '6-Pack', cans: 6, price: 28 },
      { size: '12-Pack', cans: 12, price: 52 },
      { size: '24-Pack', cans: 24, price: 96 },
    ],
    metrics: {
      sodiumMg: 480,
      potassiumMg: 210,
      magnesiumMg: 95,
      zincMg: 4,
      osmolarity: '280 mOsm/L',
      sugarG: 0,
      calories: 10,
      volumeMl: 355,
    },
    botanicals: ['Blue Lotus Petal', 'Cold-Pressed Yuzu', 'Atlantic Sea Mineral'],
    featuredWindow: [0.16, 0.28],
  },
  {
    id: 'jade-verdant',
    index: '02',
    name: 'Jade Verdant',
    crest: 'Emerald Frond & Spring Mint',
    flavorNotes: 'Crisp Cucumber · Garden Mint · Green Tea',
    benefit: 'Clean Botanical Recovery',
    ritualMoment: 'Post-Training & Sauna Sessions',
    description:
      'A cooling post-training mineral infusion combining shade-grown matcha trace polyphenols, crushed garden mint, and balanced chelated magnesium.',
    ritualDetail:
      'Built for heat-depleted intervals and cold plunges, Jade Verdant pairs crisp cucumber water notes with 110 mg magnesium glycinate to steady muscle recovery.',
    accentHex: '#2EE59D',
    surfaceTint: 'rgba(46, 229, 157, 0.16)',
    image: emeraldImg,
    packs: [
      { size: '6-Pack', cans: 6, price: 28 },
      { size: '12-Pack', cans: 12, price: 52 },
      { size: '24-Pack', cans: 24, price: 96 },
    ],
    metrics: {
      sodiumMg: 420,
      potassiumMg: 240,
      magnesiumMg: 110,
      zincMg: 5,
      osmolarity: '272 mOsm/L',
      sugarG: 0,
      calories: 8,
      volumeMl: 355,
    },
    botanicals: ['Crushed Spearmint', 'Uji Matcha Leaf', 'Chlorophyll Trace'],
    featuredWindow: [0.28, 0.42],
  },
  {
    id: 'amethyst-stag',
    index: '03',
    name: 'Amethyst Stag',
    crest: 'Horned Crest & Night Hibiscus',
    flavorNotes: 'Blackberry · Tart Hibiscus · Rosemary',
    benefit: 'Evening Nervous-System Calm',
    ritualMoment: 'Late-Evening Unwind & Deep Sleep Prep',
    description:
      'Zero-caffeine nighttime electrolyte replenishment enriched with 150 mg L-theanine, dark blackberry juice essence, and restorative potassium citrate.',
    ritualDetail:
      'Designed for late studio hours and post-dusk decompression. Tart crimson hibiscus meets velvety blackberry while magnesium and L-theanine quiet the nervous system.',
    accentHex: '#B86BFF',
    surfaceTint: 'rgba(184, 107, 255, 0.18)',
    image: amethystImg,
    packs: [
      { size: '6-Pack', cans: 6, price: 30 },
      { size: '12-Pack', cans: 12, price: 56 },
      { size: '24-Pack', cans: 24, price: 102 },
    ],
    metrics: {
      sodiumMg: 360,
      potassiumMg: 260,
      magnesiumMg: 130,
      zincMg: 6,
      osmolarity: '268 mOsm/L',
      sugarG: 0,
      calories: 12,
      volumeMl: 355,
    },
    botanicals: ['Crimson Hibiscus', 'Sun-Dried Blackberry', 'L-Theanine 150 mg'],
    featuredWindow: [0.42, 0.56],
  },
  {
    id: 'crimson-bloom',
    index: '04',
    name: 'Crimson Bloom',
    crest: 'Ruby Petal & Blood Orange',
    flavorNotes: 'Sicilian Blood Orange · Pomegranate · Ginger',
    benefit: 'High-Output Metabolic Lift',
    ritualMoment: 'Pre-Session & High-Sweat Blocks',
    description:
      'Bright thermogenic hydration layered with cold-extracted ginger root, tart pomegranate polyphenol, and high-sodium endurance electrolyte ratios.',
    ritualDetail:
      'Our highest-sodium formula (540 mg) engineered for high-sweat output. Fresh Peruvian ginger gives a crisp palate snap against bitter-sweet Sicilian blood orange.',
    accentHex: '#FF5678',
    surfaceTint: 'rgba(255, 86, 120, 0.16)',
    image: crimsonImg,
    packs: [
      { size: '6-Pack', cans: 6, price: 28 },
      { size: '12-Pack', cans: 12, price: 52 },
      { size: '24-Pack', cans: 24, price: 96 },
    ],
    metrics: {
      sodiumMg: 540,
      potassiumMg: 220,
      magnesiumMg: 85,
      zincMg: 4,
      osmolarity: '290 mOsm/L',
      sugarG: 0,
      calories: 15,
      volumeMl: 355,
    },
    botanicals: ['Blood Orange Zest', 'Peruvian Ginger', 'Pomegranate Seed'],
    featuredWindow: [0.56, 0.68],
  },
  {
    id: 'aurelia-lion',
    index: '05',
    name: 'Aurelia Lion',
    crest: 'Solar Sovereign & Saffron Gold',
    flavorNotes: 'Alphonso Mango · Saffron Thread · Mandarin',
    benefit: 'Peak Solar Endurance',
    ritualMoment: 'Midday Focus & Outdoor Miles',
    description:
      'Our flagship warm-climate hydration elixir pairing Kashmiri saffron aromatics with crisp mandarin peel and full-spectrum ionic trace minerals.',
    ritualDetail:
      'Crafted as the centerpiece of the Aetheria collection. Golden Alphonso mango essence balances delicate saffron threads over 520 mg of pure ionic sea mineral.',
    accentHex: '#D9A441',
    surfaceTint: 'rgba(217, 164, 65, 0.18)',
    image: aureliaImg,
    packs: [
      { size: '6-Pack', cans: 6, price: 32 },
      { size: '12-Pack', cans: 12, price: 58 },
      { size: '24-Pack', cans: 24, price: 108 },
    ],
    metrics: {
      sodiumMg: 520,
      potassiumMg: 235,
      magnesiumMg: 105,
      zincMg: 5,
      osmolarity: '285 mOsm/L',
      sugarG: 0,
      calories: 12,
      volumeMl: 355,
    },
    botanicals: ['Saffron Stigma', 'Mandarin Essential Oil', 'Ionic Trace Silt'],
    featuredWindow: [0.68, 0.84],
  },
  {
    id: 'frost-orchid',
    index: '06',
    name: 'Frost Orchid',
    crest: 'Glacial Pearl & White Peach',
    flavorNotes: 'White Peach · Elderflower · Alpine Mist',
    benefit: 'Weightless Daily Purity',
    ritualMoment: 'All-Day Desk & Studio Hydration',
    description:
      'Ultra-clean effervescent hydration with delicate wild elderflower blossom, crisp white peach nectar, and bioavailable zinc for effortless daily clarity.',
    ritualDetail:
      'Subtle enough to replace sparkling mineral water at the table. Delicate elderflower aromatics lift white peach essence with 8 mg chelated zinc.',
    accentHex: '#D6E2F5',
    surfaceTint: 'rgba(214, 226, 245, 0.16)',
    image: frostImg,
    packs: [
      { size: '6-Pack', cans: 6, price: 28 },
      { size: '12-Pack', cans: 12, price: 52 },
      { size: '24-Pack', cans: 24, price: 96 },
    ],
    metrics: {
      sodiumMg: 380,
      potassiumMg: 195,
      magnesiumMg: 90,
      zincMg: 8,
      osmolarity: '264 mOsm/L',
      sugarG: 0,
      calories: 5,
      volumeMl: 355,
    },
    botanicals: ['Wild Elderflower', 'White Peach Mist', 'Chelated Zinc'],
    featuredWindow: [0.84, 1.0],
  },
];

export function getActiveFeaturedElixir(progress: number): ElixirProduct {
  const found = ELIXIRS.find(
    (e) => progress >= e.featuredWindow[0] && progress <= e.featuredWindow[1]
  );
  return found ?? ELIXIRS[4];
}
