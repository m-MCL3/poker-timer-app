import type { LevelBlinds } from "../../level/model/types";

function dash(n: number) {
  return n === 0 ? "-" : String(n);
}

export function formatNextLevel(blinds: LevelBlinds) {
  return {
    fl: `${blinds.fl.sb} / ${blinds.fl.bb} (${dash(blinds.fl.ante)})`,
    stud: `${blinds.stud.bringIn} / ${blinds.stud.complete} (${blinds.stud.ante})`,
    nlpl: `${blinds.nlpl.sb} / ${blinds.nlpl.bb} (${blinds.nlpl.nlAnte}/-)`,
  };
}