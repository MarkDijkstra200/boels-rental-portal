import { PRODUCTS, Product } from '@/data/products';

export interface AIMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  products?: Product[];
  tips?: string[];
}

interface ProjectMatch {
  projectType: string;
  intro: string;
  productIds: string[];
  crossSellIds: string[];
  tips: string[];
  followUp?: string;
}

const PROJECT_PATTERNS: { keywords: string[]; match: ProjectMatch }[] = [
  {
    keywords: ['foundation', 'fundament', 'trench', 'graven', 'dig', 'excavat', 'grond'],
    match: {
      projectType: 'Excavation & Foundation',
      intro: 'Great — excavation and foundation work! Here are the essential machines for this project:',
      productIds: ['mini-excavator', 'plate-compactor', 'concrete-mixer'],
      crossSellIds: ['laser-level', 'concrete-vibrator'],
      tips: [
        '📍 Always check for underground utilities before digging — call your local utility service.',
        '🌧️ Ensure proper drainage around foundations to prevent water ingress.',
        '📐 Use a rotating laser level to ensure your foundation base is perfectly level.',
      ],
      followUp: 'Will you also need concrete mixing equipment for the foundation pour?',
    },
  },
  {
    keywords: ['concrete', 'beton', 'pour', 'cast', 'mix', 'mortar', 'screed', 'specie'],
    match: {
      projectType: 'Concrete Work',
      intro: 'For concrete work, you\'ll want these tools to get a professional result:',
      productIds: ['concrete-mixer', 'concrete-vibrator', 'laser-level'],
      crossSellIds: ['plate-compactor', 'float-trowel'],
      tips: [
        '🌡️ Avoid pouring concrete in temperatures below 5°C or above 30°C.',
        '💧 Keep the concrete moist for at least 7 days after pouring (curing).',
        '📐 Use a laser level to ensure a flat, even surface.',
      ],
      followUp: 'Do you need compaction equipment for the sub-base before pouring?',
    },
  },
  {
    keywords: ['drill', 'bore', 'hole', 'anchor', 'kernboor', 'boren', 'gat'],
    match: {
      projectType: 'Drilling Work',
      intro: 'For drilling into concrete or masonry, these are the right tools:',
      productIds: ['rotary-hammer', 'core-drill'],
      crossSellIds: ['dust-extractor', 'angle-grinder'],
      tips: [
        '💨 Always use a dust extractor when drilling — concrete dust is hazardous to health.',
        '💧 Use water cooling for core drilling to extend diamond bit life.',
        '🔍 Scan walls for rebar and cables before drilling large holes.',
      ],
      followUp: 'What diameter holes do you need? For pipes and cables over 50mm, the core drill is ideal.',
    },
  },
  {
    keywords: ['demolish', 'break', 'sloop', 'remove', 'strip', 'breken', 'slopen', 'wall', 'muur', 'floor', 'vloer'],
    match: {
      projectType: 'Demolition Work',
      intro: 'For demolition and breaking work, here\'s what you\'ll need:',
      productIds: ['jackhammer', 'angle-grinder'],
      crossSellIds: ['dust-extractor', 'mini-excavator'],
      tips: [
        '🦺 Always wear PPE: dust mask (P3), safety goggles, hearing protection, and steel-toed boots.',
        '⚠️ Check if walls are load-bearing before demolition — consult a structural engineer if unsure.',
        '🌬️ Ensure good ventilation or use wet demolition methods to control silica dust.',
      ],
      followUp: 'Is this an indoor or outdoor demolition project? That affects which equipment is most suitable.',
    },
  },
  {
    keywords: ['scaffold', 'height', 'hoog', 'stelling', 'plafond', 'ceiling', 'paint', 'schilder', 'ladder'],
    match: {
      projectType: 'Work at Height',
      intro: 'For work at height, safety and stability are key. Here\'s what I recommend:',
      productIds: ['scaffolding-4m', 'scissor-lift'],
      crossSellIds: ['paint-sprayer', 'laser-level'],
      tips: [
        '🔒 Always ensure scaffolding outriggers are fully extended and leveled on firm ground.',
        '⚡ Check for overhead power lines before using elevated platforms.',
        '🧰 Use a tool belt to keep both hands free when working at height.',
      ],
      followUp: 'What\'s the working height you need to reach? I can recommend the most suitable platform.',
    },
  },
  {
    keywords: ['floor', 'vloer', 'parquet', 'wood', 'sand', 'schuren', 'strip', 'finish', 'hardwood'],
    match: {
      projectType: 'Floor Preparation',
      intro: 'For floor preparation and finishing work, here\'s the ideal combination:',
      productIds: ['floor-sander', 'dust-extractor'],
      crossSellIds: ['orbital-sander', 'laser-level'],
      tips: [
        '🌲 Sand with the grain for wooden floors — start with 40-grit, finish with 100-grit.',
        '💨 Use a dust extractor to capture fine wood dust — it\'s a fire and health hazard.',
        '🚪 Seal doorways with plastic sheeting to contain dust to the work area.',
      ],
      followUp: 'Are you sanding bare wood or stripping an old finish? This affects which grit to start with.',
    },
  },
  {
    keywords: ['tile', 'tegel', 'bathroom', 'badkamer', 'kitchen', 'keuken', 'ceramic', 'porcelain'],
    match: {
      projectType: 'Tiling Project',
      intro: 'For tiling work, precision cutting is essential. Here\'s what you need:',
      productIds: ['tile-cutter', 'angle-grinder', 'laser-level'],
      crossSellIds: ['rotary-hammer', 'dust-extractor'],
      tips: [
        '📐 Use a laser level to ensure tiles are perfectly horizontal — especially critical in bathrooms.',
        '💧 Wet cutting produces cleaner cuts and less dust than dry cutting.',
        '🧲 For larger format tiles (60x60cm+), use a suction cup lifter to avoid breakage.',
      ],
      followUp: 'Are you tiling floors, walls, or both? Different adhesive types are required.',
    },
  },
  {
    keywords: ['clean', 'wash', 'pressure', 'hogedruk', 'algae', 'graffiti', 'schoon', 'reinig'],
    match: {
      projectType: 'Cleaning & Pressure Washing',
      intro: 'For heavy-duty cleaning and surface preparation, here\'s the right equipment:',
      productIds: ['pressure-washer'],
      crossSellIds: ['surface-cleaner', 'angle-grinder'],
      tips: [
        '💧 Start with a 25° nozzle for general cleaning; switch to 15° for stubborn deposits.',
        '🌱 Use eco-friendly detergents when cleaning near gardens or water drains.',
        '👁️ Never point the pressure washer at people — 200 bar can cause serious injury.',
      ],
      followUp: 'What surface are you cleaning? Paving, render, decking, or vehicle?',
    },
  },
  {
    keywords: ['power', 'electricity', 'aggregaat', 'generator', 'site', 'remote', 'stroom'],
    match: {
      projectType: 'Remote Power Supply',
      intro: 'For sites without mains power, here\'s what you need:',
      productIds: ['generator-5kva', 'air-compressor'],
      crossSellIds: ['extension-reel', 'lighting-tower'],
      tips: [
        '⛽ Calculate total power draw before selecting generator size — always add 20% headroom.',
        '🔌 Never overload the generator — it can damage both tools and the generator itself.',
        '💨 Run generators in ventilated areas only — carbon monoxide is deadly.',
      ],
      followUp: 'What tools will you be running simultaneously? I can help size the right generator.',
    },
  },
  {
    keywords: ['measure', 'level', 'align', 'survey', 'waterpas', 'meten', 'laser', 'nivelleer'],
    match: {
      projectType: 'Surveying & Measuring',
      intro: 'For accurate measurements and alignment, these tools will ensure precision:',
      productIds: ['laser-level'],
      crossSellIds: ['measuring-wheel', 'total-station'],
      tips: [
        '☀️ In direct sunlight, use a laser detector (receiver) instead of relying on the visible beam.',
        '🌡️ Allow the laser to warm up for 5 minutes for maximum accuracy.',
        '🔋 Always carry spare batteries — a dead laser level on a pour day is a major problem.',
      ],
      followUp: 'What\'s the size of the area? For large outdoor sites over 200m, a rotating laser with detector is best.',
    },
  },
  {
    keywords: ['road', 'asphalt', 'weg', 'pave', 'driveway', 'oprit', 'parking'],
    match: {
      projectType: 'Road & Paving Work',
      intro: 'For road and paving projects, compaction is key to a lasting result:',
      productIds: ['roller-compactor', 'plate-compactor', 'concrete-saw'],
      crossSellIds: ['laser-level', 'pressure-washer'],
      tips: [
        '🌡️ Asphalt must be laid at 140-160°C and compacted before it cools below 80°C.',
        '📏 Always cut clean expansion joints in concrete roads to prevent random cracking.',
        '🔄 Use multiple passes with the roller — minimum 4 passes for adequate compaction.',
      ],
      followUp: 'What\'s the total area in m²? This helps determine if you need a plate compactor or full roller.',
    },
  },
];

const FALLBACK_RESPONSES = [
  "I'm here to help you find the right rental equipment! Tell me more about your project — what are you building or working on?",
  "Could you describe your project in a bit more detail? For example: are you doing construction, renovation, landscaping, or something else?",
  "I'd love to help you find the perfect tools! What's the main task — drilling, concrete work, demolition, cleaning, or something else?",
];

let fallbackIndex = 0;

function findProductsByIds(ids: string[]): Product[] {
  return ids
    .map(id => PRODUCTS.find(p => p.id === id))
    .filter(Boolean) as Product[];
}

function matchProject(userMessage: string): ProjectMatch | null {
  const lower = userMessage.toLowerCase();
  let bestMatch: ProjectMatch | null = null;
  let bestScore = 0;

  for (const pattern of PROJECT_PATTERNS) {
    const score = pattern.keywords.filter(kw => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = pattern.match;
    }
  }

  return bestScore > 0 ? bestMatch : null;
}

function generateGreeting(): AIMessage {
  return {
    id: 'greeting',
    role: 'assistant',
    content:
      "👋 Hi! I'm your Boels rental assistant.\n\nTell me about your project and I'll recommend the right equipment, suggest cross-rentals, and share professional tips.\n\nFor example: *\"I need to lay a concrete terrace\"* or *\"I'm renovating a bathroom\"* or *\"I need to dig a trench for pipes\"*.",
  };
}

export function getInitialMessages(): AIMessage[] {
  return [generateGreeting()];
}

export function processUserMessage(userMessage: string, addToCart?: (productId: string) => void): AIMessage {
  const match = matchProject(userMessage);

  if (match) {
    const mainProducts = findProductsByIds(match.productIds);
    const crossSellProducts = findProductsByIds(match.crossSellIds);
    const allProducts = [...mainProducts, ...crossSellProducts];

    const crossSellSection =
      crossSellProducts.length > 0
        ? `\n\n**Also consider adding:**\n${crossSellProducts.map(p => `• ${p.name} — €${p.dailyRate}/day`).join('\n')}`
        : '';

    const tipsSection =
      match.tips.length > 0 ? `\n\n**Project tips:**\n${match.tips.join('\n')}` : '';

    const content = `**${match.intro}**\n${mainProducts.map(p => `• **${p.name}** — €${p.dailyRate}/day | €${p.weeklyRate}/week`).join('\n')}${crossSellSection}${tipsSection}${match.followUp ? `\n\n${match.followUp}` : ''}`;

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      products: allProducts,
    };
  }

  // Handle cart/order related queries
  const lower = userMessage.toLowerCase();
  if (lower.includes('cart') || lower.includes('order') || lower.includes('quote') || lower.includes('price') || lower.includes('prijs')) {
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content:
        "To get a quote, simply add the equipment you need to your cart using the **+ Add to Cart** buttons, then click **Create Quote** in the cart. You'll get a detailed PDF quote you can download and share!\n\nWould you like me to help you find specific equipment?",
    };
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hallo') || lower.includes('hey')) {
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content:
        "Hello! 👋 Great to have you here. Tell me about your project and I'll find the best equipment for the job. What are you working on today?",
    };
  }

  // Fallback
  const response = FALLBACK_RESPONSES[fallbackIndex % FALLBACK_RESPONSES.length];
  fallbackIndex++;
  return {
    id: Date.now().toString(),
    role: 'assistant',
    content: response,
  };
}
