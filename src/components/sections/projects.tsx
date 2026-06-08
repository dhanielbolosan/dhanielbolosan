import { Badge } from "../imports/badge"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "../imports/card"

const projects = [
    {
        name: "KopeChain",
        image: "https://placehold.co/600x400",
        description: "Decentralized supply chain tracker on Base Sepolia to verify the origin of local Hawaiian coffee.",
        stack: ["Scaffold-ETH 2", "Solidity", "Hardhat", "Pinata", "DaisyUI"],
    },
    {
        name: "Legislative Cloud Platform",
        image: "https://placehold.co/600x400",
        description: "Backend service powering AI bill summarization and automated notifications for university officials",
        stack: ["FastAPI", "Google Cloud", "Docker", "Apify", "SMTP"],
    },
    {
        name: "VENOM-RAG",
        image: "https://placehold.co/600x400",
        description: "Security research demonstrating adversarial data poisoning and retreival manipulation in RAG pipelines.",
        stack: ["Python", "Jupyter Notebook", "LangChain", "FAISS", "Ollama"],
    },
    {
        name: "Pathfinity",
        image: "https://placehold.co/600x400",
        description: "Full-stack semantic search interface enabling students to query university course data via natural language.",
        stack: ["Next.js", "Vercel", "OpenAI", "Shadcn UI", "Neon Postgres"],
    },
]

export const Projects = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((item) => (
                <Card className="relative mx-auto w-full max-w-sm pt-0">
                    <img
                        src={item.image}
                        alt={item.name}
                        className="relative z-20 aspect-video w-full object-cover"
                    />
                    <CardHeader>
                        <CardTitle>{item.name}</CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        {item.stack.map((i) => (
                            <Badge variant="secondary">{i}</Badge>
                        ))}
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}