export type ProjectTier = "primary" | "medium" | "compact";

export type Project = {
  id: string;
  index: string;
  name: string;
  category: string;
  status: string;
  tier: ProjectTier;
  thesis: string;
  description: string;
  technologies: string[];
  projectUrl: string;
  projectLabel: string;
  sourceUrl: string;
  image: {
    src: string;
    alt: string;
  };
  atlas: {
    x: number;
    y: number;
  };
};

export const projects: Project[] = [
  {
    id: "marque-and-reprisal",
    index: "01",
    name: "Marque & Reprisal",
    category: "Game",
    status: "Coming soon on Steam",
    tier: "primary",
    thesis: "A globe-spanning sailing roguelike · 1522",
    description:
      "Explore. Trade. Fish. Whale. Colonize. Fight. Pillage. Survive. You are a sea captain in the year 1522, and the whole world is yours to discover in this roguelike sandbox historical sailing simulator.",
    technologies: ["Canvas", "Electron", "Geospatial data", "Cloudflare"],
    projectUrl: "https://marque-and-reprisal.com/",
    projectLabel: "Play browser demo",
    sourceUrl: "https://github.com/GarrettPetersen/polyglobe",
    image: {
      src: "/projects/marque-and-reprisal.png",
      alt: "Marque & Reprisal on a pixel-art sunset at sea",
    },
    atlas: { x: 84, y: 31 },
  },
  {
    id: "dynastic-histories",
    index: "02",
    name: "Twenty-Four Histories",
    category: "Digital humanities",
    status: "4,099 chapters translated",
    tier: "primary",
    thesis: "Canonical records of Chinese history from antiquity to the Ming Dynasty",
    description:
      "24 Histories provides complete English translations of the Twenty-Four Dynastic Histories (二十四史), the canonical collection of Chinese historical records spanning from ancient times through the Ming Dynasty.",
    technologies: ["Static generation", "Search", "Translation", "Publishing"],
    projectUrl: "https://24histories.com/",
    projectLabel: "Explore the archive",
    sourceUrl: "https://github.com/GarrettPetersen/records-of-the-grand-historian",
    image: {
      src: "/projects/24histories.png",
      alt: "The Twenty-Four Histories title in Chinese and English",
    },
    atlas: { x: 76, y: 78 },
  },
  {
    id: "connecdoku",
    index: "03",
    name: "Connecdoku",
    category: "Word game",
    status: "New puzzle daily",
    tier: "medium",
    thesis: "Organize the 16 words into a 4×4 grid where each row and column forms a category.",
    description:
      "Connecdoku is a word game. It features a 4×4 grid of words. The user may click a word followed by another word to swap them. The goal is to make valid semantic sets in every row and column.",
    technologies: ["JavaScript", "Puzzle search", "Rust", "D1"],
    projectUrl: "https://connecdoku.com/",
    projectLabel: "Solve today’s puzzle",
    sourceUrl: "https://github.com/GarrettPetersen/connecdoku",
    image: {
      src: "/projects/connecdoku.png",
      alt: "A daily Connecdoku word grid",
    },
    atlas: { x: 66, y: 39 },
  },
  {
    id: "ask-thane",
    index: "04",
    name: "Ask Thane",
    category: "Product",
    status: "Live",
    tier: "medium",
    thesis: "Task follow-up for team conversations.",
    description:
      "Ask Thane finds commitments, sends reminders, routes pings to the right place, and reports what moved.",
    technologies: ["TypeScript", "Slack", "LLMs", "Cloudflare Workers"],
    projectUrl: "https://askthane.com/ask-thane",
    projectLabel: "Visit Ask Thane",
    sourceUrl: "https://github.com/GarrettPetersen/ask-thane",
    image: {
      src: "/projects/ask-thane.png",
      alt: "Ask Thane task follow-up product card",
    },
    atlas: { x: 18, y: 20 },
  },
  {
    id: "mystery-farm",
    index: "05",
    name: "mystery.farm",
    category: "Puzzle game",
    status: "New mystery daily",
    tier: "medium",
    thesis: "A daily genealogical murder mystery.",
    description:
      "Every day at midnight, a new crime is committed on the farm. As the lead detective, your job is to reconstruct the family tree of the residents using DNA evidence and witness testimonies to identify the killer.",
    technologies: ["Genealogy", "Logic puzzle", "Pixel art"],
    projectUrl: "https://mystery.farm/",
    projectLabel: "Solve today’s case",
    sourceUrl: "https://mystery.farm/",
    image: {
      src: "/projects/mystery-farm.png",
      alt: "A pixel-art fox detective from mystery.farm",
    },
    atlas: { x: 88, y: 55 },
  },
  {
    id: "nodeword",
    index: "06",
    name: "Nodeword",
    category: "Word game",
    status: "Five daily puzzles",
    tier: "compact",
    thesis: "Click two circles to swap them. Fill all diamonds to win.",
    description:
      "Each word belongs to one or more hidden categories. Solve all diamonds to complete the puzzle.",
    technologies: ["JavaScript", "Graph puzzle"],
    projectUrl: "https://nodeword.com/",
    projectLabel: "Play Nodeword",
    sourceUrl: "https://github.com/GarrettPetersen/nodeword",
    image: {
      src: "/projects/nodeword.png",
      alt: "A Nodeword graph puzzle",
    },
    atlas: { x: 48, y: 18 },
  },
  {
    id: "housing-growth",
    index: "07",
    name: "Housing Supply Lab",
    category: "Economic model",
    status: "Interactive model",
    tier: "compact",
    thesis: "How housing scarcity creates a wealth transfer from the young to the old.",
    description:
      "An interactive Overlapping Generations (OLG) model that simulates how housing supply constraints affect generational wealth, inequality, and affordability over time.",
    technologies: ["React", "TypeScript", "Simulation", "Data visualization"],
    projectUrl: "https://inelastic-housing-growth.pages.dev/",
    projectLabel: "Open the model",
    sourceUrl: "https://github.com/GarrettPetersen/inelastic-housing-growth",
    image: {
      src: "/projects/housing-model.png",
      alt: "Housing model results for three generations",
    },
    atlas: { x: 18, y: 76 },
  },
  {
    id: "hilton-zhao",
    index: "08",
    name: "Hilton–Zhao Counterexample",
    category: "Mathematics",
    status: "Paper + verifier",
    tier: "compact",
    thesis: "Wagner-graph counterexample to the Hilton–Zhao vertex-splitting conjecture",
    description:
      "This repository gives a nine-vertex counterexample to the Hilton–Zhao vertex-splitting conjecture. The construction is hand-checkable and is accompanied by a complete paper and two independent exhaustive verification paths.",
    technologies: ["Graph theory", "Python", "SAT search", "Reproducible research"],
    projectUrl: "https://github.com/GarrettPetersen/math/blob/main/output/pdf/hilton-zhao-counterexample.pdf",
    projectLabel: "Read the paper",
    sourceUrl: "https://github.com/GarrettPetersen/math",
    image: {
      src: "/projects/hilton-zhao.png",
      alt: "Graph transformations proving the Hilton–Zhao counterexample",
    },
    atlas: { x: 43, y: 89 },
  },
];
