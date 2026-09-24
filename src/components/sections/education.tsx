import { EntryList, type Entry } from "../entry-list";

const education: Entry[] = [
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

export const Education = () => <EntryList entries={education} />;
