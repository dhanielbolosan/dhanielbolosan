import magic from "@/assets/materia/magic.png";
import command from "@/assets/materia/command.png";
import support from "@/assets/materia/support.png";
import independent from "@/assets/materia/independent.png";
import summon from "@/assets/materia/summon.png";

// Materia orbs, one per tech type, colored the way FF7 colors them. Skills groups and
// project stacks both wear them. Sprites are from a fan-made sheet by JackTheRippa
// (The Spriters Resource), free to use.
export const orbs = {
  language: magic,
  framework: command,
  library: support,
  tool: independent,
  database: summon,
};

export type MateriaType = keyof typeof orbs;
