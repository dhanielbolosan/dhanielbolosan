import type { MateriaType } from "@/lib/materia";

export type Project = {
  name: string;
  images: string[];
  thumbnail?: string;
  description: string;
  stack: { name: string; type: MateriaType }[];
  type?: string;
  date?: string;
  progress?: number;
  link?: { label: string; href: string };
};

export const projects: Project[] = [
  {
    name: "Kumu",
    thumbnail: "/projects/kumu/thumbnail.webp",
    images: [
      "/projects/kumu/kumu1.webp",
      "/projects/kumu/kumu2.webp",
      "/projects/kumu/kumu3.webp",
      "/projects/kumu/kumu4.webp",
      "/projects/kumu/kumu5.webp",
    ],
    description:
      "Human-in-loop Claude Code skill that researches a topic, writes a script, and renders a narrated infographic video with captions, music, sound effects, and graphics.",
    stack: [
      { name: "HTML/CSS", type: "language" },
      { name: "HyperFrames", type: "library" },
      { name: "Kokoro TTS", type: "library" },
      { name: "Claude Code", type: "tool" },
      { name: "FFmpeg", type: "tool" },
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
    name: "SENTINEL Mobile App",
    thumbnail: "/projects/sentinel/thumbnail.webp",
    images: [
      "/projects/sentinel/sentinel1.webp",
      "/projects/sentinel/sentinel2.webp",
      "/projects/sentinel/sentinel3.webp",
      "/projects/sentinel/sentinel4.webp",
    ],
    description:
      "Geospatial intelligence dashboard visualizing live data on a 3D globe and real-time feeds, featuring missile launch detection, 5G mesh network, and drone swarm simulations.",
    stack: [
      { name: "TypeScript", type: "language" },
      { name: "Capacitor", type: "framework" },
      { name: "FastAPI", type: "framework" },
      { name: "React", type: "library" },
      { name: "Cesium", type: "library" },
      { name: "TanStack Query", type: "library" },
    ],
    type: "Internship",
    date: "June - July 2026",
    progress: 100,
  },

  {
    name: "KopeChain",
    thumbnail: "/projects/kopechain/thumbnail.webp",
    images: [
      "/projects/kopechain/kopechain1.webp",
      "/projects/kopechain/kopechain2.webp",
      "/projects/kopechain/kopechain3.webp",
    ],
    description:
      "Decentralized supply chain tracker on Base Sepolia Testnet to verify the origin of local Hawaiian coffee, with QR codes, 3D mapping, and NFT minting.",
    stack: [
      { name: "Solidity", type: "language" },
      { name: "Scaffold-ETH 2", type: "framework" },
      { name: "Next.js", type: "framework" },
      { name: "Hardhat", type: "framework" },
      { name: "DaisyUI", type: "library" },
      { name: "Pinata", type: "tool" },
    ],
    type: "Internship",
    date: "Jan – May 2026",
    progress: 100,
    link: { label: "Site", href: "https://kope-chain.vercel.app/" },
  },

  {
    name: "Legislative Cloud Platform",
    thumbnail: "/projects/legislative-cloud-platform/thumbnail.webp",
    images: [
      "/projects/legislative-cloud-platform/uhgro1.webp",
      "/projects/legislative-cloud-platform/uhgro2.webp",
    ],
    description:
      "Backend service powering AI bill summarization and automated notifications for UH staff and officials, helping track legislation that affects the university.",
    stack: [
      { name: "Python", type: "language" },
      { name: "FastAPI", type: "framework" },
      { name: "Google Cloud", type: "tool" },
      { name: "Docker", type: "tool" },
      { name: "Apify", type: "tool" },
      { name: "SMTP", type: "tool" },
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
    thumbnail: "/projects/venom-rag/thumbnail.webp",
    images: [
      "/projects/venom-rag/venomrag1.webp",
      "/projects/venom-rag/venomrag2.webp",
    ],
    description:
      "Security research demonstrating adversarial data poisoning and retrieval manipulation in RAG pipelines through vector manipulation and PDF text poisoning.",
    stack: [
      { name: "Python", type: "language" },
      { name: "FastAPI", type: "framework" },
      { name: "LangChain", type: "library" },
      { name: "FAISS", type: "library" },
      { name: "Ollama", type: "tool" },
      { name: "Jupyter Notebook", type: "tool" },
    ],
    type: "Research",
    date: "Jan – May 2026",
    progress: 100,
  },

  {
    name: "Pathfinity",
    thumbnail: "/projects/pathfinity/thumbnail.webp",
    images: [
      "/projects/pathfinity/pathfinity1.webp",
      "/projects/pathfinity/pathfinity2.webp",
      "/projects/pathfinity/pathfinity3.webp",
    ],
    description:
      "Full-stack platform for exploring university courses with natural language search, text-to-speech accessibility, and AI-suggested career paths.",
    stack: [
      { name: "TypeScript", type: "language" },
      { name: "Next.js", type: "framework" },
      { name: "Drizzle ORM", type: "library" },
      { name: "Shadcn UI", type: "library" },
      { name: "OpenAI", type: "tool" },
      { name: "Neon Postgres", type: "database" },
    ],
    type: "Hackathon",
    date: "Oct – Nov 2025",
    progress: 100,
    link: { label: "Repo", href: "https://github.com/HACC25/Pathfinity" },
  },
];
