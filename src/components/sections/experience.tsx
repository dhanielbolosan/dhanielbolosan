import { Avatar, AvatarFallback, AvatarImage } from "../imports/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../imports/accordion";

const experience = [
  {
    company: "Black Sand Solutions",
    avatar: "/experience/black-sand-solutions.svg",
    role: "Software Engineer Intern",
    date: "June 2026 - July 2026",
    description: [
      "Engineered a geospatial intelligence dashboard and backend data pipeline that queried and rendered live data streams across desktop and mobile platforms.",
      "Built interactive Space Domain Awareness simulations, including ML-based satellite thermal anomaly detection for missile launches, 5G mesh network visualizations, and a game-theoretic drone swarm engine.",
      "Collaborated with the engineering team through daily syncs, translating open-ended defense technology concepts into scoped prototypes and functional software.",
    ],
  },
  {
    company: "Penn State University",
    avatar: "/experience/penn-state.png",
    role: "AI Cybersecurity Training Program Participant",
    date: "May 2026",
    description: [
      "Participated in an NSF-funded intensive AI security training program in collaboration with Penn State and NC State University.",
      "Investigated adversarial vulnerabilities in LLMs, focusing on prompt injection and jailbreaking techniques.",
      "Executed red-team attack strategies, evaluating their effectiveness against LLM guardrails.",
    ],
  },
  {
    company: "Naval Information Warfare Center",
    avatar: "/experience/NIWC.png",
    role: "Undergraduate AI Security Researcher",
    date: "Jan. 2026 - May 2026",
    description: [
      "Researched RAG pipeline vulnerabilities, establishing methods to evaluate data retrieval integrity.",
      "Developed exploits using targeted vector manipulation, invisible text, and font poisoning in PDF documents to manipulate LLM data retrieval.",
      "Designed an interactive demonstration UI to showcase attacks on RAG data ingestion, and authored a research paper and poster presentation documenting findings.",
    ],
  },
  {
    company: "Blockchain in Paradise",
    avatar: "/experience/blockchain-in-paradise.jpg",
    role: "Full-Stack Software Developer Intern",
    date: "Jan. 2026 - May 2026",
    description: [
      "Deployed a decentralized supply chain tracker on Base Sepolia Testnet using Solidity smart contracts to verify the origin of local Hawaiian coffee.",
      "Delivered a full-stack Web3 application using Next.js and Vercel, integrating QR code generation, 3D mapping, and NFT creation.",
      "Implemented IPFS-based asset storage to enable immutable data persistence across the supply chain.",
    ],
  },
  {
    company: "University of Hawaiʻi Office of Government Relations",
    avatar: "/experience/UH.png",
    role: "Backend Cloud Developer Intern",
    date: "Aug. 2025 - Dec. 2025",
    description: [
      "Architected a cost-efficient FastAPI backend on Google Cloud, streamlining manual legislative analysis workflows for university staff.",
      "Shipped an automated daily notification system that kept staff informed of legislation impacting the University of Hawaiʻi.",
      "Integrated an AI-powered bill summarization and comparison tool directly into the office's internal website, reducing the time staff spent parsing legislative documents.",
    ],
  },
];

export const Experience = () => {
  return (
    <section className="flex flex-col w-full max-w-4xl mx-auto gap-5 pb-10 px-5">
      <h2 className="text-xl md:text-2xl font-bold tracking-tight">
        Experience
      </h2>

      <Accordion
        type="single"
        collapsible
      >
        {experience.map((item) => (
          <AccordionItem
            key={item.company}
            value={item.company}
            className="bg-card data-[state=open]:bg-muted"
          >
            <AccordionTrigger className="cursor-pointer hover:no-underline hover:bg-muted/50">
              <div className="flex items-center gap-2 w-full">
                <Avatar>
                  <AvatarImage
                    src={item.avatar}
                    alt={item.company}
                  />
                  <AvatarFallback>
                    {item.company.slice(0, 4).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-base">{item.company}</span>
                  <span className="text-base">{item.role}</span>
                </div>
                <span className="ml-auto text-base whitespace-nowrap shrink-0">{item.date}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="flex flex-col gap-1 list-disc list-inside pl-10 pb-1">
                {item.description.map((point, i) => (
                  <li
                    key={i}
                    className="text-sm"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};
