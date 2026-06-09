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
        stack: ["Hackathon", "Next.js", "OpenAI", "Shadcn UI", "Neon Postgres"],
    },
]

export const Projects = () => {
    return (
        <section className="flex flex-col w-full max-w-4xl mx-auto gap-5 pb-10 px-5">

            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                Projects
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {projects.map((item) => (
                    <Card key={item.name} className="relative w-full flex flex-col pt-0 overflow-hidden">
                        <img
                            src={item.image}
                            alt={item.name}
                            className="relative aspect-video w-full object-cover"
                        />
                        <CardHeader className="flex-grow">
                            <CardTitle>{item.name}</CardTitle>
                            <CardDescription>{item.description}</CardDescription>
                        </CardHeader>
                        <CardFooter className="flex flex-wrap gap-2">
                            {item.stack.map((i) => (
                                <Badge variant="secondary">{i}</Badge>
                            ))}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </section>
    )
}