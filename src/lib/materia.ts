import magic from "@/assets/materia/magic.png";
import command from "@/assets/materia/command.png";
import support from "@/assets/materia/support.png";
import independent from "@/assets/materia/independent.png";
import summon from "@/assets/materia/summon.png";

export const orbs = {
  language: magic,
  framework: command,
  library: support,
  tool: independent,
  database: summon,
};

export type MateriaType = keyof typeof orbs;
