export type Project = {
  id: string;
  index: string;
  name: string;
  category: string;
  status: string;
  isPrimaryFocus?: true;
  thesis: string;
  description: string;
  technologies: string[];
  projectUrl: string;
  projectLabel: string;
  sourceUrl: string;
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
    isPrimaryFocus: true,
    thesis: "A globe-spanning sailing roguelike · 1522",
    description:
      "Explore. Trade. Fish. Whale. Colonize. Fight. Pillage. Survive. You are a sea captain in the year 1522, and the whole world is yours to discover in this roguelike sandbox historical sailing simulator.",
    technologies: ["Canvas", "Electron", "Geospatial data", "Cloudflare"],
    projectUrl: "https://marque-and-reprisal.com/",
    projectLabel: "Play browser demo",
    sourceUrl: "https://github.com/GarrettPetersen/polyglobe",
    atlas: { x: 82, y: 25 },
  },
  {
    id: "dynastic-histories",
    index: "02",
    name: "Twenty-Four Histories",
    category: "Digital humanities",
    status: "4,099 chapters translated",
    isPrimaryFocus: true,
    thesis: "Canonical records of Chinese history from antiquity to the Ming Dynasty",
    description:
      "24 Histories provides complete English translations of the Twenty-Four Dynastic Histories (二十四史), the canonical collection of Chinese historical records spanning from ancient times through the Ming Dynasty.",
    technologies: ["Static generation", "Search", "Translation", "Publishing"],
    projectUrl: "https://24histories.com/",
    projectLabel: "Explore the archive",
    sourceUrl: "https://github.com/GarrettPetersen/records-of-the-grand-historian",
    atlas: { x: 74, y: 73 },
  },
  {
    id: "ask-thane",
    index: "03",
    name: "Ask Thane",
    category: "Product",
    status: "Live",
    thesis: "Task follow-up for team conversations.",
    description:
      "Ask Thane finds commitments, sends reminders, routes pings to the right place, and reports what moved.",
    technologies: ["TypeScript", "Slack", "LLMs", "Cloudflare Workers"],
    projectUrl: "https://askthane.com/",
    projectLabel: "Visit Ask Thane",
    sourceUrl: "https://github.com/GarrettPetersen/ask-thane",
    atlas: { x: 19, y: 19 },
  },
  {
    id: "connecdoku",
    index: "04",
    name: "Connecdoku",
    category: "Word game",
    status: "New puzzle daily",
    thesis: "Organize the 16 words into a 4×4 grid where each row and column forms a category.",
    description:
      "Connecdoku is a word game. It features a 4×4 grid of words. The user may click a word followed by another word to swap them. The goal is to make valid semantic sets in every row and column.",
    technologies: ["JavaScript", "Puzzle search", "Rust", "D1"],
    projectUrl: "https://connecdoku.com/",
    projectLabel: "Solve today’s puzzle",
    sourceUrl: "https://github.com/GarrettPetersen/connecdoku",
    atlas: { x: 65, y: 43 },
  },
  {
    id: "housing-growth",
    index: "05",
    name: "Housing Supply Lab",
    category: "Economic model",
    status: "Interactive model",
    thesis: "How housing scarcity creates a wealth transfer from the young to the old.",
    description:
      "An interactive Overlapping Generations (OLG) model that simulates how housing supply constraints affect generational wealth, inequality, and affordability over time.",
    technologies: ["React", "TypeScript", "Simulation", "Data visualization"],
    projectUrl: "https://inelastic-housing-growth.pages.dev/",
    projectLabel: "Open the model",
    sourceUrl: "https://github.com/GarrettPetersen/inelastic-housing-growth",
    atlas: { x: 20, y: 76 },
  },
  {
    id: "hilton-zhao",
    index: "06",
    name: "Hilton–Zhao Counterexample",
    category: "Mathematics",
    status: "Paper + verifier",
    thesis: "Wagner-graph counterexample to the Hilton–Zhao vertex-splitting conjecture",
    description:
      "This repository gives a nine-vertex counterexample to the Hilton–Zhao vertex-splitting conjecture. The construction is hand-checkable and is accompanied by a complete paper and two independent exhaustive verification paths.",
    technologies: ["Graph theory", "Python", "SAT search", "Reproducible research"],
    projectUrl: "https://github.com/GarrettPetersen/math/blob/main/output/pdf/hilton-zhao-counterexample.pdf",
    projectLabel: "Read the paper",
    sourceUrl: "https://github.com/GarrettPetersen/math",
    atlas: { x: 43, y: 89 },
  },
];
