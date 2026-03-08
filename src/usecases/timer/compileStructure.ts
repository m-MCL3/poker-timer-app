import type { TimerStructure } from "@/domain/models/timerStructure";
import {
  buildStructureCache,
  type StructureCache,
} from "@/usecases/timer/structureCache";

export function compileStructure(structure: TimerStructure): StructureCache {
  return buildStructureCache(structure);
}
