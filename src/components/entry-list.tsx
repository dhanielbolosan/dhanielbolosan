import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./imports/accordion";
import { PixelHand } from "./pixel-hand";

export type Entry = {
  name: string;
  subtitle: string;
  date: string;
  description: string[];
};

// Menu-style list: the hand marks the hovered or open entry, like a selection cursor.
export const EntryList = ({ entries }: { entries: Entry[] }) => (
  <section className="flex flex-col gap-3">
    <Accordion
      type="single"
      collapsible
      className="gap-1 rounded-none border-0"
    >
      {entries.map((item) => (
        <AccordionItem
          key={item.name}
          value={item.name}
          className="rounded-[3px] not-last:border-b-0 data-[state=open]:bg-black/25"
        >
          <AccordionTrigger className="cursor-pointer items-center gap-2 py-2 pr-2 pl-11 hover:bg-white/5 hover:no-underline **:data-[slot=accordion-trigger-icon]:hidden">
            <PixelHand className="invisible absolute left-0 group-hover/accordion-trigger:visible group-focus-visible/accordion-trigger:visible group-aria-expanded/accordion-trigger:visible" />
            <div className="flex w-full items-center gap-3">
              <div className="flex min-w-0 flex-col items-start font-heading">
                <span className="text-sm font-semibold">{item.name}</span>
                <span className="text-sm text-muted-foreground">
                  {item.subtitle}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {item.date}
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="flex list-disc flex-col gap-1.5 pr-2 pb-1 pl-13 marker:text-frame">
              {item.description.map((point, i) => (
                <li
                  key={i}
                  className="text-sm leading-relaxed"
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
