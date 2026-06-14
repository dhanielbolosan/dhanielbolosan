import { Avatar, AvatarFallback, AvatarImage } from "../imports/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../imports/accordion";

const experience = [
  {
    company: "Penn State University",
    avatar: "/PENN.jpg",
    role: "AI Cybersecurity Training Program Participant",
    date: "May 2026",
    description: [
      "Participated in an NSF-funded intensive AI security training program in collaboration with Penn State and NC State University.",
      "Investigated adversarial vulnerabilities in LLMs, focusing on prompt injection and jailbreaking techniques.",
      "Executed red-team attack strategies, evaluating their effectiveness against LLM guardrails."
    ],
  },
  {
    company: "Naval Information Warfare Center",
    avatar: "/NIWC.png",
    role: "Undergraduate AI Security Researcher",
    date: "Jan. 2026 - May 2026",
    description: [
      "Researched RAG pipeline vulnerabilities by designing methods to evaluate data retrieval integrity.",
      "Developed exploits using targeted vector manipulation, invisible text, and font poisoning in PDF documents to manipulate LLM data retrieval.",
      "Designed an interactive demonstration UI to visualize attacks on RAG data ingestion, and authored a research paper and poster presentation documenting findings."
    ],
  },
  {
    company: "Blockchain in Paradise",
    avatar: "/BIP.jpg",
    role: "Full-Stack Software Developer Intern",
    date: "Jan. 2026 - May 2026",
    description: [
      "Deployed a decentralized supply chain tracker on Base Sepolia Testnet using Solidity smart contracts to verify the origin of local Hawaiian coffee.",
      "Engineered a full-stack Web3 application using Next.js and Vercel, integrating QR code generation, 3D map visualization, and NFT creation.",
      "Implemented IPFS-based asset storage to enable immutable data persistence across the supply chain."
    ],
  },
  {
    company: "University of Hawai'i Office of Government Relations",
    avatar: "/UHOGR.jpg",
    role: "Backend Cloud Developer Intern",
    date: "Aug. 2025 - Dec. 2025",
    description: [
      "Architected a cost-efficient FastAPI backend on Google Cloud, streamlining manual legislative analysis workflows for university staff.",
      "Engineered an automated daily notification system that kept staff informed of legislation impacting the University of Hawaiʻi.",
      "Integrated an AI-powered bill summarization and comparison tool directly into the office's internal website, reducing the time staff spent parsing legislative documents."
    ],
  }
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
        className="border-none"
      >
        {experience.map((item) => (
          <AccordionItem
            key={item.company}
            value={item.company}
            className="border-none data-[state=open]:bg-muted rounded-md"
          >
            <AccordionTrigger className="cursor-pointer hover:no-underline hover:bg-muted/50 rounded-md">
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
                  <span className="font-bold">{item.company}</span>
                  <span className="text-sm">{item.role}</span>
                </div>
                <span className="ml-auto text-sm">{item.date}</span>
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
