export type Entry = {
  name: string;
  subtitle: string;
  date: string;
  description: string[];
};

export const experience: Entry[] = [
  {
    name: "Black Sand Solutions",
    subtitle: "Software Engineer Intern",
    date: "June 2026 - July 2026",
    description: [
      "Engineered a geospatial intelligence dashboard and backend data pipeline that queried and rendered live data streams across desktop and mobile platforms.",
      "Built interactive Space Domain Awareness simulations, including ML-based satellite thermal anomaly detection for missile launches, 5G mesh network visualizations, and a game-theoretic drone swarm engine.",
      "Collaborated with the engineering team through daily syncs, translating open-ended defense technology concepts into scoped prototypes and functional software.",
    ],
  },

  {
    name: "Penn State University",
    subtitle: "AI Cybersecurity Training Program Participant",
    date: "May 2026",
    description: [
      "Participated in an NSF-funded intensive AI security training program in collaboration with Penn State and NC State University.",
      "Investigated adversarial vulnerabilities in LLMs, focusing on prompt injection and jailbreaking techniques.",
      "Executed red-team attack strategies, evaluating their effectiveness against LLM guardrails.",
    ],
  },

  {
    name: "Naval Information Warfare Center",
    subtitle: "Undergraduate AI Security Researcher",
    date: "Jan. 2026 - May 2026",
    description: [
      "Researched RAG pipeline vulnerabilities, establishing methods to evaluate data retrieval integrity.",
      "Developed exploits using targeted vector manipulation, invisible text, and font poisoning in PDF documents to manipulate LLM data retrieval.",
      "Designed an interactive demonstration UI to showcase attacks on RAG data ingestion, and authored a research paper and poster presentation documenting findings.",
    ],
  },

  {
    name: "Blockchain in Paradise",
    subtitle: "Full-Stack Software Developer Intern",
    date: "Jan. 2026 - May 2026",
    description: [
      "Deployed a decentralized supply chain tracker on Base Sepolia Testnet using Solidity smart contracts to verify the origin of local Hawaiian coffee.",
      "Delivered a full-stack Web3 application using Next.js and Vercel, integrating QR code generation, 3D mapping, and NFT creation.",
      "Implemented IPFS-based asset storage to enable immutable data persistence across the supply chain.",
    ],
  },

  {
    name: "University of Hawaiʻi Office of Government Relations",
    subtitle: "Backend Cloud Developer Intern",
    date: "Aug. 2025 - Dec. 2025",
    description: [
      "Architected a cost-efficient FastAPI backend on Google Cloud, streamlining manual legislative analysis workflows for university staff.",
      "Shipped an automated daily notification system that kept staff informed of legislation impacting the University of Hawaiʻi.",
      "Integrated an AI-powered bill summarization and comparison tool directly into the office's internal website, reducing the time staff spent parsing legislative documents.",
    ],
  },
];

export const education: Entry[] = [
  {
    name: "University of Hawaiʻi at Mānoa",
    subtitle: "Computer Science, B.S.",
    date: "Aug. 2024 - May 2026",
    description: ["Cumulative GPA: 3.31/4.00", "Dean's List (Spring 2025)"],
  },

  {
    name: "University of Hawaiʻi Maui College",
    subtitle: "Natural Science - Information and Computer Sciences, A.S",
    date: "Aug. 2022 - May 2024",
    description: ["Cumulative GPA: 3.10/4.00", "Dean's List (Fall 2022)"],
  },
];

export const groups = [
  { label: "Experience", entries: experience },
  { label: "Education", entries: education },
];
