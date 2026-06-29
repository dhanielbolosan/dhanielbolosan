import { useState, useEffect } from "react";
import { Badge } from "../imports/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../imports/card";

const projects = [
  {
    name: "KopeChain",
    images: ["/projects/kopechain1.png", "/projects/kopechain2.png", "/projects/kopechain3.png"],
    description:
      "Decentralized supply chain tracker on Base Sepolia Testnet to verify the origin of local Hawaiian coffee.",
    stack: ["Scaffold-ETH 2", "Solidity", "Hardhat", "Pinata", "DaisyUI"],
  },
  {
    name: "Legislative Cloud Platform",
    images: ["/projects/uhgro1.png", "/projects/uhgro2.png"],
    description:
      "Backend service powering AI bill summarization and automated notifications for university officials",
    stack: ["FastAPI", "Google Cloud", "Docker", "Apify", "SMTP"],
  },
  {
    name: "VENOM-RAG",
    images: ["/projects/venomrag1.png", "/projects/venomrag2.png"],
    description:
      "Security research demonstrating adversarial data poisoning and retreival manipulation in RAG pipelines.",
    stack: ["Python", "Jupyter Notebook", "LangChain", "FAISS", "Ollama"],
  },
  {
    name: "Pathfinity",
    images: ["/projects/pathfinity1.png", "/projects/pathfinity2.png"],
    description:
      "Full-stack semantic search interface enabling students to query university course data via natural language.",
    stack: ["Hackathon", "Next.js", "OpenAI", "Shadcn UI", "Neon Postgres"],
  },
];

interface ProjectProps {
  name: string;
  images: string[];
  description: string;
  stack: string[];
}

const ProjectCard = ({ name, images, description, stack }: ProjectProps) => {
  const [currImage, setCurrImage] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (!isHovering || images.length <= 1) {
      setCurrImage(0);
      return;
    }

    setCurrImage(1 % images.length);

    const interval = setInterval(() => {
      setCurrImage((prev) => (prev + 1) % images.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isHovering, images.length]);

  return (
    <Card
      className="relative w-full flex flex-col pt-0 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:cursor-pointer"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative aspect-video w-full overflow-hidden">
        {images.map((src: string, i: number) => (
          <img
            key={src}
            src={src}
            alt={name}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${i === currImage ? "opacity-100" : "opacity-0"
              }`}
          />
        ))}
      </div>
      <CardHeader className="flex-grow">
        <CardTitle className="text-base">{name}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-wrap gap-2">
        {stack.map((i: string) => (
          <Badge key={i} className="bg-muted text-black dark:text-white">{i}</Badge>
        ))}
      </CardFooter>
    </Card>
  );
};

export const Projects = () => {
  return (
    <section className="flex flex-col w-full max-w-4xl mx-auto gap-5 pb-10 px-5">
      <h2 className="text-xl md:text-2xl font-bold tracking-tight">Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {projects.map((item) => (
          <ProjectCard key={item.name} {...item} />
        ))}
      </div>
    </section>
  );
};
