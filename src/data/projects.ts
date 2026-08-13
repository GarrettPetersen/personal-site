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
    status: "Playable demo",
    isPrimaryFocus: true,
    thesis: "The age of sail, wrapped around the whole world.",
    description:
      "A globe-spanning pixel-art sailing roguelike set in 1522. Explore, trade, fish, fight, colonize, and survive on a spherical world built from a geodesic tile system.",
    technologies: ["Canvas", "Electron", "Geospatial data", "Cloudflare"],
    projectUrl: "https://marque-and-reprisal.com/",
    projectLabel: "Play the demo",
    sourceUrl: "https://github.com/GarrettPetersen/polyglobe",
    atlas: { x: 82, y: 25 },
  },
  {
    id: "dynastic-histories",
    index: "02",
    name: "Twenty-Four Histories",
    category: "Digital humanities",
    status: "Living archive",
    isPrimaryFocus: true,
    thesis: "Two thousand years of Chinese history, made searchable.",
    description:
      "A reading environment for the official dynastic histories of China, pairing source text with literal and idiomatic English translations, annotations, and full-corpus search.",
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
    thesis: "Task tracking that listens before it asks.",
    description:
      "An AI-native task tracker for teams. Thane listens to ordinary Slack conversation, infers task state, keeps an auditable history, and follows up when work goes quiet.",
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
    thesis: "Sixteen words. Eight overlapping connections.",
    description:
      "A 4×4 semantic word puzzle where every swap matters. Arrange the grid so each row and column forms a valid set, with a generator and curation system behind the daily game.",
    technologies: ["JavaScript", "Puzzle search", "Rust", "D1"],
    projectUrl: "https://connecdoku.com/",
    projectLabel: "Play today’s puzzle",
    sourceUrl: "https://github.com/GarrettPetersen/connecdoku",
    atlas: { x: 65, y: 43 },
  },
  {
    id: "housing-growth",
    index: "05",
    name: "Housing Supply Lab",
    category: "Economic model",
    status: "Interactive model",
    thesis: "See scarcity move wealth between generations.",
    description:
      "An interactive overlapping-generations model for testing how constrained housing supply can affect prices, ownership, inequality, and intergenerational wealth transfers.",
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
    thesis: "A nine-vertex graph that breaks a 1997 conjecture.",
    description:
      "A hand-checkable counterexample to the Hilton–Zhao vertex-splitting conjecture, accompanied by a complete paper and two independent exhaustive verification paths.",
    technologies: ["Graph theory", "Python", "SAT search", "Reproducible research"],
    projectUrl: "https://github.com/GarrettPetersen/math/blob/main/output/pdf/hilton-zhao-counterexample.pdf",
    projectLabel: "Read the paper",
    sourceUrl: "https://github.com/GarrettPetersen/math",
    atlas: { x: 43, y: 89 },
  },
];
