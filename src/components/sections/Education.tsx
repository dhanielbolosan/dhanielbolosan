import { Avatar, AvatarFallback, AvatarImage } from "../imports/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../imports/accordion";

const data = [
  {
    school: "University of Hawai'i at Manoa",
    avatar: "/UHM.png",
    degree: "Computer Science, B.S.",
    date: "Aug. 2024 - May 2026",
    description: ["Test1", "Test2", "Test3"],
  },
  {
    school: "University of Hawai'i Maui College",
    avatar: "/UHMC.jpg",
    degree: "Natural Science - Information and Computer Sciences, A.S",
    date: "Aug. 2022 - May 2024",
    description: ["Test1", "Test2", "Test3"],
  },
];

export const Education = () => {
  return (
    <div className="flex flex-col w-full">
      <Accordion
        type="single"
        collapsible
      >
        {data.map((item) => (
          <AccordionItem
            key={item.school}
            value={item.school}
          >
            <AccordionTrigger>
              <div className="flex items-center gap-2 w-full pr-5">
                <Avatar>
                  <AvatarImage
                    src={item.avatar}
                    alt={item.school}
                  />
                  <AvatarFallback>
                    {item.school.slice(0, 4).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="font-bold">{item.school}</span>
                  <span className="text-sm">{item.degree}</span>
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
