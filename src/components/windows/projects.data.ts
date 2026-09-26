import type { MateriaType } from "@/lib/materia";

// Projects window entries, newest first.
export type Project = {
  name: string;
  images: string[];
  thumbnail?: string;
  description: string;
  stack: { name: string; type: MateriaType }[];
  type?: string;
  date?: string;
  /** 0-100; a full bar flashes like FF7's Limit bar. */
  progress?: number;
  link?: { label: string; href: string };
};

export const projects: Project[] = [
  {
    name: "Kumu",
    thumbnail: "/projects/kumu/thumbnail.png",
    images: [
      "/projects/kumu/kumu1.jpg",
      "/projects/kumu/kumu2.png",
      "/projects/kumu/kumu3.png",
    ],
    description:
      "Human-in-loop Claude Code skill that researches a topic, writes a script, and renders a narrated infographic video with captions and music.",
    stack: [
      { name: "Claude Code", type: "tool" },
      { name: "HyperFrames", type: "library" },
      { name: "HTML/CSS", type: "language" },
      { name: "FFmpeg", type: "tool" },
      { name: "Kokoro TTS", type: "library" },
      { name: "whisper.cpp", type: "tool" },
    ],
    type: "Personal",
    date: "Sep 2026",
    progress: 75,
    link: {
      label: "Repo",
      href: "https://github.com/blockchain-in-paradise/kumu",
    },
  },
  {
    name: "SENTINEL Mobile Application",
    thumbnail: "/projects/sentinel/thumbnail.png",
    images: [
      "/projects/sentinel/sentinel1.png",
      "/projects/sentinel/sentinel2.png",
      "/projects/sentinel/sentinel3.png",
    ],
    description:
      "Geospatial intelligence dashboard, using Cesium 3D globe of live wildfire, seismic, weather, and aviation feeds with Starlink orbits and a FastAPI backend.",
    stack: [
      { name: "Capacitor", type: "framework" },
      { name: "React", type: "framework" },
      { name: "TypeScript", type: "language" },
      { name: "Cesium", type: "library" },
      { name: "FastAPI", type: "framework" },
      { name: "TanStack Query", type: "library" },
    ],
    type: "Internship",
    date: "June - July 2026",
    progress: 100,
  },
  {
    name: "KopeChain",
    thumbnail: "/projects/kopechain/thumbnail.png",
    images: [
      "/projects/kopechain/kopechain1.png",
      "/projects/kopechain/kopechain2.png",
      "/projects/kopechain/kopechain3.png",
    ],
    description:
      "Decentralized supply chain tracker on Base Sepolia Testnet to verify the origin of local Hawaiian coffee, with QR codes, 3D mapping, and NFT minting.",
    stack: [
      { name: "Scaffold-ETH 2", type: "framework" },
      { name: "Solidity", type: "language" },
      { name: "Hardhat", type: "framework" },
      { name: "Pinata", type: "tool" },
      { name: "DaisyUI", type: "library" },
      { name: "Next.js", type: "framework" },
    ],
    type: "Internship",
    date: "Jan – May 2026",
    progress: 100,
    link: { label: "Site", href: "https://kope-chain.vercel.app/" },
  },
  {
    name: "Legislative Cloud Platform",
    thumbnail: "/projects/legislative-cloud-platform/thumbnail.png",
    images: [
      "/projects/legislative-cloud-platform/uhgro1.png",
      "/projects/legislative-cloud-platform/uhgro2.png",
    ],
    description:
      "Backend service powering AI bill summarization and automated notifications for university officials, helping UH staff track legislation that affects the university.",
    stack: [
      { name: "FastAPI", type: "framework" },
      { name: "Google Cloud", type: "tool" },
      { name: "Docker", type: "tool" },
      { name: "Apify", type: "tool" },
      { name: "SMTP", type: "tool" },
      { name: "Python", type: "language" },
    ],
    type: "Internship",
    date: "Aug – Dec 2025",
    progress: 100,
    link: {
      label: "Org",
      href: "https://github.com/orgs/engr401-groot-ai/repositories",
    },
  },
  {
    name: "VENOM-RAG",
    thumbnail: "/projects/venom-rag/thumbnail.png",
    images: [
      "/projects/venom-rag/venomrag1.png",
      "/projects/venom-rag/venomrag2.png",
    ],
    description:
      "Security research demonstrating adversarial data poisoning and retrieval manipulation in RAG pipelines through vector manipulation and PDF font poisoning.",
    stack: [
      { name: "Python", type: "language" },
      { name: "Jupyter Notebook", type: "tool" },
      { name: "LangChain", type: "library" },
      { name: "FAISS", type: "library" },
      { name: "Ollama", type: "tool" },
      { name: "FastAPI", type: "framework" },
    ],
    type: "Research",
    date: "Jan – May 2026",
    progress: 100,
  },
  {
    name: "Pathfinity",
    thumbnail: "/projects/pathfinity/thumbnail.png",
    images: [
      "/projects/pathfinity/pathfinity1.png",
      "/projects/pathfinity/pathfinity2.png",
      "/projects/pathfinity/pathfinity3.png",
    ],
    description:
      "Full-stack semantic search interface enabling students to query university course data via natural language, with GitHub and Google sign-in.",
    stack: [
      { name: "Next.js", type: "framework" },
      { name: "OpenAI", type: "tool" },
      { name: "Shadcn UI", type: "library" },
      { name: "Neon Postgres", type: "database" },
      { name: "TypeScript", type: "language" },
      { name: "Drizzle ORM", type: "library" },
    ],
    type: "Hackathon",
    date: "Oct – Nov 2025",
    progress: 100,
    link: { label: "Repo", href: "https://github.com/HACC25/Pathfinity" },
  },
];
