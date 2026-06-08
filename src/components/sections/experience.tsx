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
    description: ["Test1", "Test2", "Test3"],
  },
  {
    company: "Naval Information Warfare Center",
    avatar: "/NIWC.png",
    role: "Undergraduate AI Security Researcher",
    date: "Jan. 2026 - May 2026",
    description: ["Test1", "Test2", "Test3"],
  },
  {
    company: "Blockchain in Paradise",
    avatar: "/BIP.jpg",
    role: "Full-Stack Software Developer Intern",
    date: "Jan. 2026 - May 2026",
    description: ["Test1", "Test2", "Test3"],
  },
  {
    company: "University of Hawai'i Office of Government Relations",
    avatar: "/UHOGR.jpg",
    role: "Backend Cloud Developer Intern",
    date: "Aug. 2025 - Dec. 2025",
    description: ["Test1", "Test2", "Test3"],
  },
  {
    company: "University of Hawai'i at Manoa",
    avatar: "/UHM.png",
    role: "Undergraduate Teaching Assistant",
    date: "Aug. 2025 - Dec. 2025",
    description: ["Test1", "Test2", "Test3"],
  },
];

export const Experience = () => {
  return (
    <div className="flex flex-col w-full">
      <Accordion
        type="single"
        collapsible
      >
        {experience.map((item) => (
          <AccordionItem
            key={item.company}
            value={item.company}
          >
            <AccordionTrigger>
              <div className="flex items-center gap-2 w-full pr-5">
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
              <ul className="flex flex-col gap-1 list-disc list-inside">
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
    </div>
  );
};
