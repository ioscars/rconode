import { Buffer } from "https://deno.land/std@0.76.0/node/buffer.ts";
import { Md5 } from "https://deno.land/std@0.159.0/hash/md5.ts?s=Md5";
import { squadNames } from "../models/bf4/squads.names.ts";

export function tabulate<R>(res: string[], offset = 0): {rows: R[], cols: string[]} {
  const nColumns = parseInt(res[offset], 10);
  const cols = [];
  let i;
  for (i = offset + 1; i <= nColumns; i++) {
    cols.push(res[i]);
  }
  i += offset;
  const nRows = parseInt(res[i], 10);
  const rows: R[] = [];
  for (let n = 0; n < nRows; n++) {
    const row: any = {};
    for (let j = 0; j < cols.length; j++) {
      row[cols[j]] = res[++i];
    }
    rows.push(row);
  }

  return {
    rows,
    cols,
  };
}

export function getTeamScore(args: string[], offset = 0, t = 0) {
  const entities = +args[offset];
  const scores = [];
  for (let i = 1; i < entities + 1; i++) {
    scores.push(args[offset + i]);
  }
  return {
    scores, targetScore: args[offset + entities + 1]
  }
}

export function hashPassword(password: string, serverHash: string) {
  const md = new Md5();
  const md5Pass = md
    .update(Buffer.from(serverHash, "hex"))
    .update(Buffer.from(password, "utf-8"))
    .digest();
  return Buffer.from(md5Pass).toString("hex").toLocaleUpperCase();
}

export function squadIds2squads(squadIds: string[]) {
  return squadIds.map(sId => ({id: sId, name: squadNames[+sId]}))
}


